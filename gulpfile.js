var gulp = require('gulp');
var source = require('vinyl-source-stream'); // Used to stream bundle for further handling
var browserify = require('browserify');
var watchify = require('watchify');
var reactify = require('reactify'); 
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var streamify = require('gulp-streamify');
var notify = require('gulp-notify');
var concat = require('gulp-concat');
var cssmin = require('gulp-cssmin');
var gutil = require('gulp-util');
var shell = require('gulp-shell');
var glob = require('glob');
var livereload = require('gulp-livereload');
var jasminePhantomJs = require('gulp-jasmine2-phantomjs');

// External dependencies you do not want to rebundle while developing,
// but include in your application deployment
var dependencies = [
    'react',
    'react-addons'
];

var _copyTask= function( src, dest ) {
    var run= function() {
        console.log('Deploying ' + src);
        gulp.src(src + '/**', { base: src })
            .pipe(gulp.dest(dest));
    };
    run();
    gulp.watch(src + '/**', run);
};

var copyTask = function (taskTarget, dest) {
    _copyTask('./static', dest);
    _copyTask('./static.' + taskTarget, dest);
};

var browserifyTask = function (options) {

  // Our app bundler
    var appBundler = browserify({
        entries: [ options.src ], // Only need initial file, browserify finds the rest
        transform: [ reactify ], // We want to convert JSX to normal javascript
        debug: options.development, // Gives us sourcemapping
        cache: {}, packageCache: {}, fullPaths: true // Requirement of watchify
    });

    // We set our dependencies as externals on our app bundler when developing        
    (options.development ? dependencies : []).forEach(function (dep) {
        appBundler.external(dep);
    });

    var logError= function (message) {
        if ( typeof message === 'object' && message.toString ) {
            message= message.toString();
        }
        gutil.log(typeof message, message);
     };

    // The rebundle process
    var rebundle = function () {
        var start = Date.now();
        console.log('Building APP bundle');
        appBundler.bundle()
            .on('error', logError)
            .pipe(source('main.js'))
            .pipe(gulpif(!options.development, streamify(uglify())))
            .pipe(gulp.dest(options.dest))
            .pipe(gulpif(options.development, livereload()))
            .pipe(notify(function () {
                console.log('APP bundle built in ' + (Date.now() - start) + 'ms');
            }))
        ;
    };

    // Fire up Watchify when developing
    if ( options.development ) {
        appBundler = watchify(appBundler);
        appBundler.on('update', rebundle);
    }

    rebundle();

    // We create a separate bundle for our dependencies as they
    // should not rebundle on file changes. This only happens when
    // we develop. When deploying the dependencies will be included 
    // in the application bundle
    if ( options.development ) {

        var testFiles = glob.sync('./specs/**/*-spec.js');
        var testBundler = browserify({
            entries: testFiles,
            debug: true, // Gives us sourcemapping
            transform: [reactify],
            cache: {}, packageCache: {}, fullPaths: true // Requirement of watchify
        });

        dependencies.forEach(function (dep) {
            testBundler.external(dep);
        });

        var rebundleTests = function () {
            var start = Date.now();
            console.log('Building TEST bundle');
            testBundler.bundle()
                .on('error', logError)
                .pipe(source('specs.js'))
                .pipe(gulp.dest(options.dest))
                .pipe(livereload())
                .pipe(notify(function () {
                    console.log('TEST bundle built in ' + (Date.now() - start) + 'ms');
                }))
            ;
        };

        testBundler = watchify(testBundler);
        testBundler.on('update', rebundleTests);
        rebundleTests();
    }

    // Remove react-addons when deploying, as it is only for
    // testing
    if ( !options.development ) {
        dependencies.splice(dependencies.indexOf('react-addons'), 1);
    }

    var vendorsBundler = browserify({
        debug: true,
        require: dependencies
    });

    // Run the vendor bundle
    var start = new Date();
    console.log('Building VENDORS bundle');
    vendorsBundler.bundle()
        .on('error', logError)
        .pipe(source('vendors.js'))
        .pipe(gulpif(!options.development, streamify(uglify())))
        .pipe(gulp.dest(options.dest))
        .pipe(notify(function () {
            console.log('VENDORS bundle built in ' + (Date.now() - start) + 'ms');
        }))
    ;
}

var cssTask = function (options) {
    if (options.development) {
        var run = function () {
            console.log(arguments);
            var start = new Date();
            console.log('Building CSS bundle');
            gulp.src(options.src)
                .pipe(concat('bootstrap.css'))
                .pipe(concat('main.css'))
                .pipe(gulp.dest(options.dest))
                .pipe(notify(function () {
                    console.log('CSS bundle built in ' + (Date.now() - start) + 'ms');
                }))
            ;
        };
        run();
        gulp.watch(options.src, run);
    }
    else {
        gulp.src(options.src)
            .pipe(concat('bootstrap.css'))
            .pipe(concat('main.css'))
            .pipe(cssmin())
            .pipe(gulp.dest(options.dest))
        ;
    }
}

// Starts our development workflow
gulp.task('default', function () {

    copyTask('development', './build');

    browserifyTask({
        development: true,
        src: './app/main.js',
        dest: './build/static'
    });

    cssTask({
        development: true,
        src: './styles/**/*.css',
        dest: './build/static'
    });
});

gulp.task('deploy', function () {

    copyTask('production', './dist');

    browserifyTask({
        development: false,
        src: './app/main.js',
        dest: './dist/static'
    });

    cssTask({
        development: false,
        src: './styles/**/*.css',
        dest: './dist/static'
    });
});

// gulp.watch('./styles/**', [ 'default' ]);
// gulp.watch('./static/**', [ 'default' ]);

gulp.task('test', function () {
    return gulp.src('./build/testrunner-phantomjs.html').pipe(jasminePhantomJs());
});