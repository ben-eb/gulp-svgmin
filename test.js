/* jshint node: true */
/* global describe, it */

'use strict';

var expect = require('chai').expect,
    gutil  = require('gulp-util'),
    svgmin = require('./index'),
    es = require('event-stream'),
    Stream = require('stream');

var doctype = '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

var raw = '<?xml version="1.0" encoding="utf-8"?>' + doctype +
'<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve">' +
'<circle cx="50" cy="50" r="40" fill="yellow" />' +
'</svg>';

var compressed = '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="#ff00"/></svg>';

describe('gulp-svgmin in buffer mode', function() {
    it('should minify svg with svgo', function(cb) {
        var stream = svgmin();

        stream.on('data', function(data) {
            expect(String(data.contents)).to.equal(compressed);
            cb();
        });

        stream.write(new gutil.File({
            contents: new Buffer(raw)
        }));
    });

    it('should honor disabling plugins, such as keeping the doctype', function(cb) {
        var stream = svgmin({
            removeDoctype: false
        });

        stream.on('data', function(data) {
            expect(String(data.contents)).to.have.string(doctype);
            cb();
        });

        stream.write(new gutil.File({
            contents: new Buffer(raw)
        }));
    });
});

describe('gulp-svgmin in stream mode', function() {
    it('should minify svg with svgo', function(cb) {
        var stream = svgmin();
        var fakeFile = new gutil.File({
            contents: new Stream()
        });

        stream.on('data', function(data) {
            data.contents.pipe(es.wait(function(err, data) {
                expect(data).to.equal(compressed);
                cb();
            }));
        });

        stream.write(fakeFile);
        fakeFile.contents.write(raw);
        fakeFile.contents.end();
    });

    it('should honor disabling plugins, such as keeping the doctype', function(cb) {
        var stream = svgmin({
            removeDoctype: false
        });
        var fakeFile = new gutil.File({
            contents: new Stream()
        });

        stream.on('data', function(data) {
            data.contents.pipe(es.wait(function(err, data) {
                expect(data).to.have.string(doctype);
                cb();
            }));
        });

        stream.write(fakeFile);
        fakeFile.contents.write(raw);
        fakeFile.contents.end();
    });
});
