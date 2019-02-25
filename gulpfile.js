/* eslint-env node */
'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')({
  overridePattern: false,
  pattern: [
    'browser-sync',
    'main-bower-files',
    'path-exists'
  ]
});
var bowerWithMin = [];
gulp.task('bower', function() {
  return $.bower();
});

gulp.task('serve', ['eslint', 'sass'], function() {
  $.browserSync.init({
    server: {
      baseDir: './src'
    },
    open: true
  });
  gulp.start('watch');
});

gulp.task('watch', ['inject'], function() {
  $.watch([
    './src/**/*.html',
    './src/**/*.js',
    './src/**/*.css',
    '!./src/styles/**'
  ], $.browserSync.reload);
  $.watch(['./src/app/**/*.js'], function() {
    gulp.start('eslint');
  });
  $.watch(
    ['./src/app/**/*.js', './src/styles/**/*.css'],
    { events: ['add', 'unlink'] },
    function() {
      gulp.start('inject');
    }
  );
  $.watch(['./bower.json'], function() {
    gulp.start('inject');
  });
  $.watch(['./src/app/**/*.scss'], function() {
    gulp.start('sass');
  });
});

gulp.task('eslint', function() {
  return gulp.src(['./src/app/**/*.js'])
    .pipe($.eslint())
    .pipe($.eslint.format());
});

gulp.task('inject', function() {
  return gulp.src(['./src/index.html'])
    .pipe($.inject( // Inject bower components
      gulp.src($.mainBowerFiles(), { read: false }),
      { relative: true, empty: true, name: 'bower' }
    ))
    .pipe($.inject( // Inject js and css
      gulp.src(
        [
          './src/app/**/app.js',
          './src/app/**/app.*.js',
          './src/app/**/*.js',
          './src/styles/**/*.css'
        ],
        { read: false }
      ),
      { relative: true, empty: true }
    ))
    .pipe(gulp.dest('./src'));
});

gulp.task('sass', function() {
  return gulp.src('./src/app/scss/**/*.scss')
    .pipe($.sourcemaps.init())
    .pipe($.sass().on('error', $.sass.logError))
    .pipe($.sourcemaps.write('.', {
      includeContent: false
    }))
    .pipe(gulp.dest('./src/styles'))
    .pipe($.browserSync.stream());
});

gulp.task('clean', function() {
  return gulp.src([
      './build',
      './__temp__'
    ], { read: false })
    .pipe($.clean());
});

gulp.task('build:js', ['clean', 'build:template'], function() {
  return gulp.src([
      './src/app/**/app.*.js',
      './src/app/**/*.js',
      './__temp__/templates.js',
    ])
    .pipe($.ngAnnotate({ single_quotes: true }))
    .pipe($.concat('app.min.js'))
    .pipe($.stripDebug())
    .pipe($.uglify())
    .pipe($.hash())
    .pipe(gulp.dest('./build/js'));
});

gulp.task('build:template', ['clean'], function() {
  return gulp.src([
      './src/app/**/*.html',
    ])
    .pipe($.angularTemplatecache({
      root: 'app',
      module: 'TrenderlandLottery',
    }))
    .pipe(gulp.dest('__temp__'));
});

gulp.task('build:css', ['clean', 'sass'], function() {
  return gulp.src('./src/styles/**/*.css')
    .pipe($.autoprefixer())
    .pipe($.csso())
    .pipe($.hash({ template: '<%= name %>-<%= hash %>.min<%= ext %>' }))
    .pipe(gulp.dest('./build/css'));
});

gulp.task('build:bower', ['clean', 'bower'], function() {
  var exists = $.pathExists.sync;
  bowerWithMin = $.mainBowerFiles().map(function(path, index, arr) {
    var newPath = path.replace(/.([^.]+)$/g, '.min.$1');
    return exists(newPath) ? newPath : path;
  });
  return gulp.src(bowerWithMin, { base: 'src/bower_components'})
    .pipe(gulp.dest('./build/vendors'));
});

gulp.task('build:html', ['clean'], function() {
  return gulp.src(['./src/**/*.html', '!src/bower_components/**'])
    .pipe(gulp.dest('./build'));
});

gulp.task('build', ['build:html', 'build:bower', 'build:js', 'build:css'], function() {
  var vendors = bowerWithMin.map(function(path) {
    return path.replace(/.*bower_components/, 'build/vendors');
  });
  gulp.src(
    [
      './src/fonts/**',
      './src/images/**',
      './src/data/**'
    ],
    { base: 'src' }
  )
    .pipe(gulp.dest('./build'));
  gulp.src(['./build/index.html'])
    .pipe($.inject(
      gulp.src(vendors, { read: false }),
      { relative: true, empty: true, name: 'bower' }
    ))
    .pipe($.inject(
      gulp.src(['./build/js/**', './build/css/**'], { read: false }),
      { relative: true, empty: true }
    ))
    .pipe(gulp.dest('./build'));
});
