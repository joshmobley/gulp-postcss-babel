/*
** @name Project Starter
** @version 1.1.0
** @description A starter package and gulpfile for continuous-build development.
** @author Josh Mobley
** @license GNU GPLv3
*/

// MODULES
var gulp         = require('gulp');
var browserSync  = require('browser-sync').create();
var eslint       = require('gulp-eslint');
var stylelint    = require('gulp-stylelint');
var postcss      = require('gulp-postcss');
var cssnano      = require('cssnano');
var sourcemaps   = require('gulp-sourcemaps');
var babel        = require('gulp-babel');
var plumber      = require('gulp-plumber');
var notify       = require('gulp-notify');

// PATHS
var styles = {
    "path": './css/src/',
    "entry": 'main.css',
    "dist": './css/dist/'
};

var scripts = {
    "path": './js/src/',
    "entry": 'main.js',
    "dist": './js/dist/'
};

// BROWSER SYNC
gulp.task('browser-sync', function() {

    // initialize browser-sync, documentation here -> https://browsersync.io/docs/gulp
    browserSync.init({
        proxy: "localhost:8888/tools/project-starters/gulp-postcss-babel"  // this assumes a MAMP-based localhost
    });
    
});
    
// CSS
gulp.task('css', function() {

    // configure postcss + load modules
    var postcssConfig = postcss([
        require( 'precss' ),
        require( 'autoprefixer' ),
        require( 'cssnano' )
    ]);

    // configure error message via notify
    var errorHandler = notify.onError( function(error){
        return "POSTCSS error: " + error.message;
    });

    return gulp
        .src( styles.path + '**/*.css' )      // file input
        .pipe( stylelint({
          failAfterError: false,
          reporters: [
            { formatter: 'string', console: true },
            { formatter: 'verbose', console: true },
          ],
        }))
        .pipe( sourcemaps.init() )              // create sourcemaps
        .pipe( postcssConfig )                  // configure postcss
        .on( 'error', errorHandler )            // report errors via notify
        .pipe( plumber() )                      // continues gulp build on error
        .pipe( sourcemaps.write() )             // write sourcemaps to disk
        .pipe( gulp.dest( styles.dist ))        // write css to disk
        .pipe( browserSync.stream() );          // stream changes into browser
       
});

// JS 
gulp.task("js", function() {

    // configure babel
    var babelConfig = babel({
        presets: ['latest'],                    // use the latest yearly ES version
        compact: 'true',                        // minify output
        plugins: ['transform-es2015-modules-amd']
    });

    // configure error message via notify
    var errorHandler = notify.onError( function(error) {
        return "JavaScript error: " + error.message;
    });

    return gulp
        .src( scripts.path + '**/*.js' )        // input files
        .pipe( eslint({
            fix: true
        }))
        .pipe( eslint.format() )
        .pipe( babelConfig )                    // transpile via babel
        .on( 'error', errorHandler )            // report error via notify
        .pipe( plumber() )                      // continue gulp build on error
        .pipe( sourcemaps.init() )              // create sourcemaps
        .pipe( sourcemaps.write() )             // write sourcemaps to disk
        .pipe( gulp.dest( scripts.dist ))       // write js to disk
        .pipe( browserSync.stream() );          // stream change into browser

});

// WATCH
gulp.task( 'watch', function() {

    gulp.watch( styles.path + '**/*.css', ['css'] );    // watch css for changes
    gulp.watch( scripts.path + '**/*.js', ['js'] );     // watch js for changes

});

// DEFAULT
gulp.task( 'default', ['css', 'js', 'browser-sync', 'watch'] ); // default task to run
