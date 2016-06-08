var gulp = require('gulp'),
	uglify = require('gulp-uglify')
	plumber = require('gulp-plumber'),
	order = require('gulp-order'),
	filter = require('gulp-filter'),
	concat = require('gulp-concat'),
	templateCache = require('gulp-angular-templatecache');

var config = {
	js: {
		path: './src/',
		dest: './dist/'
	},
	html: {
		path: './src/views/'
	}
};

gulp.task('templates', function () {
	return gulp.src(config.html.path + '**/*.html')
    	.pipe(templateCache('app.templates.js', {
                module: 'rr.api.v2.explorer.templates',
                standalone: true
            }))
    	.pipe(gulp.dest(config.js.path));
});

gulp.task('js-dist', ['templates'], function () {
	return gulp.src(config.js.path + '**/*.js')
		.pipe(plumber())
		.pipe(order([
			'src/vendor/*.js',
			'src/**/*.js'
		], {
			base: './'
		}))
		.pipe(uglify())
		.pipe(concat('rr-explorer-2.min.js'))
		.pipe(gulp.dest(config.js.dest));
});

gulp.task('watch', function () {
	gulp.watch(config.js.path + '**/*.js', ['js-dist']);
});