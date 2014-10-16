'use strict';

require('should');
var gutil  = require('gulp-util'),
    svgmin = require('../lib'),
    es = require('event-stream'),
    Stream = require('stream');

var head = '<?xml version="1.0" encoding="utf-8"?>',
    doctype = '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">',
    fullsvg = '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve">' +
            '<circle cx="50" cy="50" r="40" fill="yellow" />' +
            '<!-- test comment --></svg>',
    raw = head + doctype + fullsvg;

var compressed = '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="#ff00"/></svg>';

var makeTest = function(plugins, content, expected) {
    it('in stream mode', function(done) {
        var stream = svgmin(plugins);
        var fakeFile = new gutil.File({
            contents: new Stream()
        });

        stream.on('data', function(data) {
            data.contents.pipe(es.wait(function(err, data) {
                String(data).should.match(expected);
                done();
            }));
        });

        stream.write(fakeFile);
        fakeFile.contents.write(content);
        fakeFile.contents.end();
    });
    it('in buffer mode', function(done) {
        var stream = svgmin(plugins);
        stream.on('data', function(data) {
            String(data.contents).should.match(expected);
            done();
        });

        stream.write(new gutil.File({
            contents: new Buffer(content)
        }));
    });
};

describe('gulp-svgmin', function() {
    describe('with null contents', function() {
        it('should let null files pass through', function(done) {
            var stream = svgmin();
            var i = 0;

            stream.pipe(es.through(
                function(file) {
                    file.path.should.eql('bibabelula.md');
                    (file.contents === null).should.be.true;
                    i += 1;
                },
                function() {
                    i.should.eql(1);
                    done();
                }
            ));
            stream.write(new gutil.File({
                path: 'bibabelula.md',
                contents: null
            }));
            stream.end();
        });
    });

    describe('should minify svg with svgo', function() {
        makeTest([], raw, compressed);
    });

    describe('should honor disabling plugins, such as keeping the doctype', function() {
        var plugins = [
            { removeDoctype: false }
        ];
        makeTest(plugins, raw, function(content) {
            return content.should.containEql(doctype);
        });
    });

    describe('should allow disabling multiple plugins', function() {
        var plugins = [
            { removeDoctype: false },
            { removeComments: false }
        ];
        makeTest(plugins, raw, function(content) {
            return content.should.containEql(doctype).and.containEql('test comment');
        });
    });
});
