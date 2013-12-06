# gulp-svgmin

Minify SVG files with gulp. This plugin is a small wrapper around the excellent SVGO module, which can be found here:

https://github.com/svg/svgo

## Installation

Install via npm:

```
npm install gulp-svgmin --save-dev
```

## Example

```
var gulp = require('gulp');
var svgmin = require('gulp-svgmin');

gulp.task('default', function() {
    gulp.src('logo.svg')
        .pipe(svgmin())
        .pipe(gulp.dest('./out'));
});
```

## Plugins

Optionally, you can disable any [SVGO plugins](https://github.com/svg/svgo/tree/master/plugins) to customise the output. Simply pass an object to `svgmin` with the list of plugins that you would like to disable:

```
gulp.task('default', function() {
    gulp.src('logo.svg')
        .pipe(svgmin({
            removeDoctype: false
        }))
        .pipe(gulp.dest('./out'));
});
```
