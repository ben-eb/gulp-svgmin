/* global describe, it */

'use strict';

var expect = require('chai').expect,
    gutil  = require('gulp-util'),
    svgmin = require('./index.js'),
    Stream = require('stream');

var head = '<?xml version="1.0" encoding="utf-8"?>',
    doctype = '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">',
    fullsvg = '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve">' +
            '<circle cx="50" cy="50" r="40" fill="yellow" />' +
            '<!-- test comment --></svg>',
    raw = head + doctype + fullsvg;

var compressed = '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="#ff0"/></svg>';

function makeTest (plugins, content, expected, done) {
    var stream = svgmin({plugins: plugins});

    stream.on('data', function (data) {
        expect(String(data.contents)).satisfy(expected);
        done();
    });

    var file = new gutil.File({contents: new Buffer(content)});
    stream.write(file);
}

describe('gulp-svgmin', function () {
    it('should let null files pass through', function (done) {
        var stream = svgmin();

        stream.on('data', function (data) {
            expect(data.contents).to.equal(null);
            done();
        });

        stream.write(new gutil.File({
            path: 'null.md',
            contents: null
        }));
        stream.end();
    });

    it('should minify svg with svgo', function (done) {
        makeTest([], raw, function (content) {
            return compressed === content;
        }, done);
    });

    it('should honor disabling plugins, such as keeping the doctype', function (done) {
        var plugins = [
            {removeDoctype: false}
        ];
        makeTest(plugins, raw, function (content) {
            return expect(content).to.contain(doctype);
        }, done);
    });

    it('should allow per file options, such as keeping the doctype', function (cb) {
        var file = new gutil.File({contents: new Buffer(raw)});
        var getOptions = function (f) {
            expect(f).to.equal(file);
            return {plugins: [{removeDoctype: false}]};
        };
        var stream = svgmin(getOptions);
        stream.on('data', function (data) {
            expect(data.contents.toString()).to.contain(doctype);
            cb();
        });
        stream.write(file);
    });

    it('should allow disabling multiple plugins', function (done) {
        var plugins = [
            {removeDoctype: false},
            {removeComments: false}
        ];
        makeTest(plugins, raw, function (content) {
            return expect(content).to.contain(doctype).and.contain('test comment');
        }, done);
    });

    it('in stream mode must emit error', function (cb) {
        var stream = svgmin();
        var fakeFile = new gutil.File({
            contents: new Stream()
        });

        var doWrite = function () {
            stream.write(fakeFile);
            fakeFile.contents.write(raw);
            fakeFile.contents.end();
        };

        expect(doWrite).to.throw(/Streaming not supported/);
        cb();
    });
});
