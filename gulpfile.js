/* jshint node:true */

'use strict';

var gulp    = require('gulp');
var gutil   = require('gulp-util');
var clear   = require('clear');
var jshint  = require('gulp-jshint');

gulp.task('lint', function () {
  gulp.src('*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('default', function() {
  gulp.run('lint');
  gulp.watch('*.js', function(event) {
    clear();
    gutil.log(gutil.colors.cyan(event.path.replace(process.cwd(), '')) + ' ' + event.type + '. (' + gutil.colors.magenta(gutil.date('HH:MM:ss')) + ')');
    gulp.run('lint');
  });
});
