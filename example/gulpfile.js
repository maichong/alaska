'use strict';

const gulp = require('gulp');
const less = require('gulp-less');
const minify = require('gulp-minify-css');

gulp.task('admin-less', () => {
  gulp.src('less/admin.less')
    .pipe(less())
    .pipe(minify())
    .pipe(gulp.dest('public/admin/css/'));
});

gulp.task('watch', ['admin-less'], () => {
  gulp.watch('less/*.less', ['admin-less']);
});

gulp.task('default', ['admin-less']);

