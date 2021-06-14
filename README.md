# gulp-svgmin

[![Build Status](https://travis-ci.org/ben-eb/gulp-svgmin.svg?branch=master)][travis-status]
[![NPM version](https://badge.fury.io/js/gulp-svgmin.svg)][npm-status]
[![Dependency Status](https://david-dm.org/ben-eb/gulp-svgmin.svg)][deps-status]


A [Gulp][gulp-url] wrapper for [SVGO][svgo-url].

*If you have any difficulties with the output of this plugin, please use the [SVGO tracker][svgo-bugs].*


## Install

With [npm][npm-url] do:

```
npm install gulp-svgmin
```


## Example

```js
var gulp = require('gulp');
var svgmin = require('gulp-svgmin');

gulp.task('default', function () {
    return gulp.src('logo.svg')
        .pipe(svgmin())
        .pipe(gulp.dest('./out'));
});
```


## Plugins

Optionally, you can customise the output by specifying the `plugins` option. You
will need to provide the config in comma separated objects, like the example
below. Note that you can either disable the plugin by setting it to false,
or pass different options to change the default behaviour.

```js
gulp.task('default', function () {
    return gulp.src('logo.svg')
        .pipe(svgmin({
            plugins: [{
                removeDoctype: false
            }, {
                removeComments: false
            }, {
                cleanupNumericValues: {
                    floatPrecision: 2
                }
            }, {
                convertColors: {
                    names2hex: false,
                    rgb2hex: false
                }
            }]
        }))
        .pipe(gulp.dest('./out'));
});
```

You can view the [full list of plugins here][svgo-plugins].


## Beautify

You can also use `gulp-svgmin` to optimise your SVG but render a pretty output,
instead of the default where all extraneous whitespace is removed:

```js
gulp.task('pretty', function () {
    return gulp.src('logo.svg')
        .pipe(svgmin({
            js2svg: {
                pretty: true
            }
        }))
        .pipe(gulp.dest('./out'))
});
```


## Per-file options

To have per-file options, pass a function, that receives `file` object and
returns `svgo` options. For example, if you need to prefix ids with filenames
to make them unique before combining svgs with [gulp-svgstore][gulp-svgostore]:

```js
gulp.task('default', function () {
    return gulp.src('src/*.svg')
        .pipe(svgmin(function getOptions (file) {
            var prefix = path.basename(file.relative, path.extname(file.relative));
            return {
                plugins: [{
                    cleanupIDs: {
                        prefix: prefix + '-',
                        minify: true
                    }
                }]
            }
        }))
        .pipe(svgstore())
        .pipe(gulp.dest('./dest'));
});
```


## Contributing

Pull requests are welcome. If you add functionality, then please add unit tests
to cover it.


## License

MIT © [Ben Briggs](https://beneb.info)


[travis-status]:    https://travis-ci.org/ben-eb/gulp-svgmin
[deps-status]:      https://david-dm.org/ben-eb/gulp-svgmin
[npm-status]:       https://badge.fury.io/js/gulp-svgmin
[npm-url]:          https://npmjs.org/package/gulp-svgmin
[gulp-url]:         https://github.com/gulpjs/gulp
[gulp-svgostore]:   https://github.com/w0rm/gulp-svgstore
[svgo-url]:         https://github.com/svg/svgo
[svgo-bugs]:        https://github.com/svg/svgo/issues
[svgo-plugins]:     https://github.com/svg/svgo/tree/master/plugins
