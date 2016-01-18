var expect = require('chai').expect,
    ava    = require('ava'),
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

function makeTest (plugins, content, expected) {
    return new Promise(function (resolve) {
        var stream = svgmin({plugins: plugins});
        
        stream.on('data', function (data) {
            expect(String(data.contents)).satisfy(expected);
            resolve();
        });

        var file = new gutil.File({contents: new Buffer(content)});
        stream.write(file);
    });
}

ava('should let null files pass through', function () {
    return new Promise(function (resolve) {
        var stream = svgmin();

        stream.on('data', function (data) {
            expect(data.contents).to.equal(null);
            resolve();
        });

        stream.write(new gutil.File({
            path: 'null.md',
            contents: null
        }));
        
        stream.end();
    });
});

ava('should minify svg with svgo', function () {
    return makeTest([], raw, function (content) {
        return compressed === content;
    });
});

ava('should honor disabling plugins, such as keeping the doctype', function () {
    var plugins = [
        {removeDoctype: false}
    ];
    return makeTest(plugins, raw, function (content) {
        return expect(content).to.contain(doctype);
    });
});

ava('should allow disabling multiple plugins', function () {
    var plugins = [
        {removeDoctype: false},
        {removeComments: false}
    ];
    return makeTest(plugins, raw, function (content) {
        return expect(content).to.contain(doctype).and.contain('test comment');
    });
});

ava('should allow per file options, such as keeping the doctype', function () {
    return new Promise(function (resolve) {
        var file = new gutil.File({contents: new Buffer(raw)});
        var getOptions = function (f) {
            expect(f).to.equal(file);
            return {plugins: [{removeDoctype: false}]};
        };
        var stream = svgmin(getOptions);
        stream.on('data', function (data) {
            expect(data.contents.toString()).to.contain(doctype);
            resolve();
        });
        stream.write(file);
    });
});

ava('in stream mode must emit error', function (t) {
    var stream = svgmin();
    var fakeFile = new gutil.File({
        contents: new Stream()
    });

    var doWrite = function () {
        stream.write(fakeFile);
        fakeFile.contents.write(raw);
        fakeFile.contents.end();
    };
    
    t.throws(doWrite, /Streaming not supported/);
});
