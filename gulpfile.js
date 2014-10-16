'use strict';

var gulp    = require('gulp');
var jshint  = require('gulp-jshint');

var paths = {
  js: ['gulpfile.js', 'lib/**/*.js', 'test/**/*.js']
};

gulp.task('lint', function () {
  gulp.src(paths.js)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('watch', function() {
  gulp.watch(paths.js, ['lint']);
});

gulp.task('default', ['lint', 'watch'], function() {});
