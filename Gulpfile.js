/**
 * Created by acb222 on 9/27/16.
 */
var gulp = require('gulp');
var bs = require('browser-sync').create();

gulp.task('server', function() {
    bs.init({
        server: {
            baseDir: './src'
        },
        files: ["src/**/*.html", "src/app/**/*.js"]
    });
});