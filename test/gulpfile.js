'use strict';

const gulp = require('gulp');
const less = require('gulp-less');
const cleanCss = require('gulp-clean-css');

gulp.task('admin-less', () => {
  gulp.src('less/admin.less')
    .pipe(less())
    .pipe(cleanCss())
    .pipe(gulp.dest('public/admin/css/'));
});

gulp.task('watch', ['admin-less'], () => {
  gulp.watch('less/*.less', ['admin-less']);
  gulp.watch('node_modules/alaska-admin-view/less/*.less', ['admin-less']);
});

gulp.task('default', ['admin-less']);

