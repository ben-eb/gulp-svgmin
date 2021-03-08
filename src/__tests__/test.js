import fs from 'fs';
import path from 'path';
import Stream from 'stream';
import {expect} from 'chai';
import test from 'ava';
import Vinyl from 'vinyl';
import svgmin from '../index.js';

function readFixture(svg) {
    return fs
        .readFileSync(path.join(__dirname, svg), 'utf8')
        .replace(/\n$/, '');
}

const raw = readFixture('input.svg');
const compressed = readFixture('output.svg');

function makeTest(plugins, content, expected) {
    return new Promise((resolve) => {
        const stream = svgmin({plugins});

        stream.on('data', (data) => {
            expect(String(data.contents)).satisfy(expected);
            resolve();
        });

        stream.write(new Vinyl({contents: Buffer.from(content)}));
    });
}

test('should let null files pass through', () => {
    return new Promise((resolve) => {
        const stream = svgmin();

        stream.on('data', (data) => {
            expect(data.contents).to.equal(null);
            resolve();
        });

        stream.write(
            new Vinyl({
                path: 'null.md',
                contents: null,
            })
        );

        stream.end();
    });
});

test('should minify svg with svgo', () => {
    return makeTest([], raw, (content) => compressed === content);
});

test('should honor disabling plugins, such as keeping the doctype', () => {
    const plugins = [{removeDoctype: false}];
    return makeTest(plugins, raw, (content) => {
        return expect(content).to.contain('DOCTYPE');
    });
});

test('should allow disabling multiple plugins', () => {
    const plugins = [{removeDoctype: false}, {removeComments: false}];
    return makeTest(plugins, raw, (content) => {
        return expect(content)
            .to.contain('DOCTYPE')
            .and.contain('test comment');
    });
});

test('should allow per file options, such as keeping the doctype', () => {
    return new Promise((resolve) => {
        const file = new Vinyl({contents: Buffer.from(raw)});

        const stream = svgmin((data) => {
            expect(data).to.equal(file);
            return {plugins: [{removeDoctype: false}]};
        });

        stream.on('data', (data) => {
            expect(data.contents.toString()).to.contain('DOCTYPE');
            resolve();
        });

        stream.write(file);
    });
});

test('in stream mode must emit error', (t) => {
    const stream = svgmin();
    const fakeFile = new Vinyl({
        contents: new Stream.Readable(),
    });

    const doWrite = function () {
        stream.write(fakeFile);
        fakeFile.contents.write(raw);
        fakeFile.contents.end();
    };

    t.throws(doWrite, /Streaming not supported/);
});

test('stream should emit an error when svgo errors', (t) => {
    const stream = svgmin();
    const fakeFile = new Vinyl({
        contents: Buffer.from('throw an error'),
    });

    stream.write(fakeFile);

    stream.on('error', (error) => t.regex(error, /Error in parsing SVG/));
});
