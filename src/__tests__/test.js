import Stream from 'stream';
import {expect} from 'chai';
import ava from 'ava';
import Vinyl from 'vinyl';
import svgmin from '..';

const head = '<?xml version="1.0" encoding="utf-8"?>';
const doctype = '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
const fullsvg = '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve">' +
            '<circle cx="50" cy="50" r="40" fill="yellow" />' +
            '<!-- test comment --></svg>';

const raw = head + doctype + fullsvg;
const compressed = '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="#ff0"/></svg>';

function makeTest (plugins, content, expected) {
    return new Promise(resolve => {
        const stream = svgmin({plugins: plugins});

        stream.on('data', data => {
            expect(String(data.contents)).satisfy(expected);
            resolve();
        });

        stream.write(new Vinyl({contents: new Buffer(content)}));
    });
}

ava('should let null files pass through', () => {
    return new Promise(resolve => {
        const stream = svgmin();

        stream.on('data', data => {
            expect(data.contents).to.equal(null);
            resolve();
        });

        stream.write(new Vinyl({
            path: 'null.md',
            contents: null,
        }));

        stream.end();
    });
});

ava('should minify svg with svgo', () => {
    return makeTest([], raw, content => compressed === content);
});

ava('should honor disabling plugins, such as keeping the doctype', () => {
    const plugins = [
        {removeDoctype: false},
    ];
    return makeTest(plugins, raw, content => {
        return expect(content).to.contain(doctype);
    });
});

ava('should allow disabling multiple plugins', () => {
    const plugins = [
        {removeDoctype: false},
        {removeComments: false},
    ];
    return makeTest(plugins, raw, content => {
        return expect(content).to.contain(doctype).and.contain('test comment');
    });
});

ava('should allow per file options, such as keeping the doctype', () => {
    return new Promise(resolve => {
        const file = new Vinyl({contents: new Buffer(raw)});

        const stream = svgmin(data => {
            expect(data).to.equal(file);
            return {plugins: [{removeDoctype: false}]};
        });

        stream.on('data', data => {
            expect(data.contents.toString()).to.contain(doctype);
            resolve();
        });

        stream.write(file);
    });
});

ava('in stream mode must emit error', (t) => {
    const stream = svgmin();
    const fakeFile = new Vinyl({
        contents: new Stream.Readable(),
    });

    const doWrite = function () {
        stream.write(fakeFile);
        fakeFile.contents.write(raw);
        fakeFile.contents.end();
    };

    t.throws(doWrite, /blah/);
});

ava('stream should emit an error when svgo errors', (t) => {
    const stream = svgmin();
    const fakeFile = new Vinyl({
        contents: new Buffer('throw an error'),
    });

    stream.write(fakeFile);

    stream.on('error', error => t.regex(error, /Error in parsing SVG/));
});
