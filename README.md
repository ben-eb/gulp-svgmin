# [gulp][gulp]-svgmin [![Build Status](https://travis-ci.org/ben-eb/gulp-svgmin.svg?branch=master)][ci] [![NPM version](https://badge.fury.io/js/gulp-svgmin.svg)][npm] [![Dependency Status](https://gemnasium.com/ben-eb/gulp-svgmin.svg)][deps]

> Minify SVG with [SVGO][orig].

*If you have any difficulties with the output of this plugin, please use the
[SVGO tracker][bugs].*

Install via [npm](https://npmjs.org/package/gulp-svgmin):

```
npm install gulp-svgmin --save-dev
```

## Example

```js
var gulp = require('gulp');
var svgmin = require('gulp-svgmin');

gulp.task('default', function() {
    return gulp.src('logo.svg')
        .pipe(svgmin())
        .pipe(gulp.dest('./out'));
});
```

## Plugins

Optionally, you can disable any [SVGO plugins][plugins] to customise the output.
You will need to provide the config in comma separated objects, like the example
below.

```js
gulp.task('default', function() {
    return gulp.src('logo.svg')
        .pipe(svgmin({
            plugins: [{
                removeDoctype: false
            }, {
                removeComments: false
            }]
        }))
        .pipe(gulp.dest('./out'));
});
```

## Beautify

You can also use `gulp-svgmin` to optimise your SVG but render a pretty output,
instead of the default where all extraneous whitespace is removed:

```js
gulp.task('pretty', function() {
    return gulp.src('logo.svg')
        .pipe(svgmin({
            js2svg: {
                pretty: true
            }
        }))
        .pipe(gulp.dest('./out'))
});
```

## Contributing

Pull requests are welcome. If you add functionality, then please add unit tests
to cover it.

## License

MIT © Ben Briggs

[bugs]:    https://github.com/svg/svgo/issues
[ci]:      https://travis-ci.org/ben-eb/gulp-svgmin
[deps]:    https://gemnasium.com/ben-eb/gulp-svgmin
[gulp]:    https://github.com/wearefractal/gulp
[npm]:     http://badge.fury.io/js/gulp-svgmin
[orig]:    https://github.com/svg/svgo
[plugins]: https://github.com/svg/svgo/tree/master/plugins
