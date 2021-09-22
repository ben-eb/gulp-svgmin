import test from 'ava';
import {readFileSync} from 'fs';
import path from 'path';
import PluginError from 'plugin-error';
import {Readable} from 'stream';
import Vinyl from 'vinyl';
import svgmin from '../src/index.js';

function readFixture(fileName) {
    return readFileSync(
        path.resolve(__dirname, 'fixtures', fileName),
        'utf8'
    ).replace(/\n$/, '');
}

const inputSVG = readFixture('input.svg');
const outputSVG = readFixture('output.svg');

function makeTest(options, file, additionalSetup = () => {}) {
    return new Promise((resolve, reject) => {
        try {
            const transform = svgmin(options);
            let result;

            // Resolve the promise on the transform's finish or end
            // events.
            transform.on('finish', () => resolve(result));
            transform.on('error', (error) => reject(error));

            // Save the transform's data to the Promise's result.
            transform.on('data', (data) => {
                result = data.contents ? String(data.contents) : data.contents;
                console.log(result);
            });

            // Write the test's file to the transform.
            const vinylFile = Vinyl.isVinyl(file)
                ? file
                : new Vinyl({contents: Buffer.from(file)});
            transform.write(vinylFile);

            // Allow individual tests to run additional code before the
            // transform 'end' event and to modify the transform or the Vinyl
            // file being written.
            additionalSetup(transform, vinylFile);

            transform.end();
        } catch (error) {
            reject(error);
        }
    });
}

test('should let null files pass through', async (t) => {
    const result = await makeTest(
        null,
        new Vinyl({
            path: 'null.md',
            contents: null,
        })
    );

    t.is(result, null);
});

test('should minify svg with svgo', async (t) => {
    const result = await makeTest(null, inputSVG);

    t.is(result, outputSVG);
});

test('should honor disabling plugins, such as keeping the doctype', async (t) => {
    const result = await makeTest(
        {plugins: [{removeDoctype: false}]},
        inputSVG
    );

    t.regex(result, /DOCTYPE/);
});

test('should allow disabling multiple plugins', async (t) => {
    const result = await makeTest(
        {plugins: [{removeDoctype: false}, {removeComments: false}]},
        inputSVG
    );

    t.regex(result, /DOCTYPE/);
    t.regex(result, /test comment/);
});

test('should allow per file options, such as keeping the doctype', async (t) => {
    const vinylFile = new Vinyl({contents: Buffer.from(inputSVG)});

    const result = await makeTest((file) => {
        t.is(file, vinylFile);
        return {plugins: [{removeDoctype: false}]};
    }, vinylFile);

    t.regex(result, /DOCTYPE/);
});

test('should emit an error when the Vinyl object is in stream mode', async (t) => {
    await t.throwsAsync(
        makeTest(
            null,
            // Create a stream-mode Vinyl object.
            new Vinyl({
                contents: new Readable(),
            }),
            (transform, vinylFile) => {
                // Write the SVG file to the stream.
                vinylFile.contents.write(inputSVG);
                vinylFile.contents.end();
            }
        ),
        {
            instanceOf: PluginError,
            message: /Streaming not supported/,
        }
    );
});

test('should emit an error when svgo throws an error', async (t) => {
    await t.throwsAsync(makeTest(null, 'file does not contain an SVG'), {
        instanceOf: PluginError,
        message: /SvgoParserError/,
    });
});
