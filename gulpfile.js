const bs = require('browser-sync').create();
const sass = require('gulp-sass');
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const beep = require('beepbeep');
const pug = require('gulp-pug');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const uglifyCSS = require('gulp-uglifycss');
const rename = require('gulp-rename');
const uncss = require('gulp-uncss');
const Karma = require('karma').Server;

'use strict';

const errorHandler = (err) => {
  console.log('ERROR', err.message);
  console.log('CAUSE', err.cause);
  console.log(err);
  bs.notify( `Error in ${err.relativePath}:${err.line}`, 5000);
  beep();
}

const karmaCfg = {
  configFile: __dirname + '/karma.conf.js'  
};

const APPNAME = 'musicsearch';
const paths = {
  sass: [ './sass/main.sass', './sass/*.sass', './www/components/**/*.sass' ],
  pug: [ './www/index.pug', './www/components/**/*.pug', './www/includes/*.pug' ],
  html: [ './www/index.html', './www/components/**/*.html' ],
  scripts: [ './www/js/**/*.js', '!./www/js/external/*' ],
  barrels: {},
  dist: {
    scripts: './www/dist/',
    styles: './www/dist/'
  }
};
paths.barrels.sass = paths.sass[0];

const emptyFn = function(){};
const compilePug = ( target, cb = emptyFn ) => {
  return gulp.src(target)
    .pipe(plumber({ errorHandler }))
    .pipe(pug({ pretty: true }))
    // compile file in the origin folder
    .pipe(gulp.dest( (file) => file.base ))
    .on('end', cb);
}

const onPugChange = (e) => {
  // converting absolute in relative path
  // the base dir is ./www, removing everything before
  const relPath = e.path.slice( e.path.indexOf('www') );

  console.log(`pug: ${ relPath } updated`);
  compilePug(relPath);
  // if the file which triggered the task was included 
  // in the index we need to compile it for updates to show
  compilePug('./www/index.pug', bs.reload);
}

gulp.task('serve', ['sass'], function(){
    bs.init({ server: './www/' });
    gulp.watch(paths.sass, ['sass']);
    gulp.watch(paths.pug, onPugChange);
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function(){
   gulp.src(paths.barrels.sass)
    .pipe(plumber({ errorHandler }))
    .pipe(sass())
    .pipe(gulp.dest('./www/'))
    .pipe(bs.stream());
});

gulp.task('pug', function() {
  compilePug( paths.pug );
});

gulp.task('scripts-prod', function(){
  gulp.src(paths.scripts)
    .pipe(plumber({ errorHandler }))
    .pipe(babel())
    .pipe(concat(`${APPNAME}.bundle.js`))
    .pipe(uglify())
    .pipe(gulp.dest(paths.dist.scripts));
});

gulp.task('styles-prod', ['sass'], function(){
  gulp.src(`./www/main.css`)
    .pipe(uncss({ html: paths.html }))
    .pipe(plumber({ errorHandler }))
    .pipe(rename(`${APPNAME}.min.css`))
    .pipe(uglifyCSS())
    .pipe(gulp.dest(paths.dist.styles));
});

gulp.task('karma-start', function(done) {
  new Karma(karmaCfg, done).start();
});

gulp.task('build', ['scripts-prod', 'styles-prod']);

gulp.task('default', ['serve']);