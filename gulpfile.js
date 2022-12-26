// Initial
const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const watch = require('gulp-watch');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const gcmq = require('gulp-group-css-media-queries');
const sassGlob = require('gulp-sass-glob');
const pug = require('gulp-pug');
const del = require('del');
const fs = require('fs');

// Task запуска pug
gulp.task('pug', function (cb) {
    return gulp.src('./src/pug/pages/**/*.pug')
        .pipe(plumber({
            errorHandler: notify.onError(function (err) {
                return {
                    title: 'Pug',
                    sound: false,
                    message: err.message
                }
            })
        }))
        .pipe(pug({
            pretty: true
            // locals: {
            //     jsonData: JSON.parse(fs.readFileSync('./src/data/data.json', 'utf8')),
            //     jsonNav: JSON.parse(fs.readFileSync('./src/data/nav.json', 'utf8'))
            // }
        }))
        .pipe(gulp.dest('./build/'))

        /**запуск обновления сервера методом stream */
        .pipe(browserSync.stream());
    cb();
});

// Tack запуск компиляции  scss в css
gulp.task('scss', function (cb) {
    /**находим файл */
    return gulp.src('./src/scss/main.scss')

        /**обработчик ошибок */
        .pipe(plumber({
            errorHandler: notify.onError(function (err) {
                return {
                    title: 'Styles',
                    sound: false,
                    massage: err.massage
                }
            })
        }))
        /**отрисовка карт */
        .pipe(sourcemaps.init())

        .pipe(sassGlob())

        /** подключение пакета sass обработка scss */
        .pipe(sass({
            indentType: 'tab',
            indentWidth: 1,
            outputStyle: 'expanded'
        }))

        .pipe(gcmq())

        /**подключение пакета autoprefixer */
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 4 version']
        }))

        /**завершение отрисовки карт */
        .pipe(sourcemaps.write())

        /**сохраняем по указанному пути все изменения в отслеживаемых файлах */
        .pipe(gulp.dest('./build/css/'))

        /**запуск обновления сервера методом stream */
        .pipe(browserSync.stream())
    cb();
});

// Task копирования изображений и сохранение в /build
gulp.task('copy:img', function (cb) {
    return gulp.src('./src/img/**/*.*')
        .pipe(gulp.dest('./build/img/'))
    cb();
});

// Task копирование js файлов и сохранение в /build
gulp.task('copy:js', function (cb) {
    return gulp.src('./src/js/**/*.*')
        .pipe(gulp.dest('./build/js/'))
    cb();
});

// Task отслеживаний
gulp.task('watch', function () {

    // Слежение в /build за img и js и перезапуск браузера
    watch(['./build/js/**/*.*', './build/img/**/*.*'], gulp.parallel(browserSync.reload));

    // Слежение в /src за scss, и компиляции с задержкой в 0.5 секунды
    watch('./src/scss/**/*.scss', function () {
        setTimeout(gulp.parallel('scss'), 500);
    })

    // Слежение в /src за PUG, json и сборка
    watch(['./src/**/*.pug', './src/data/**/*.json'], gulp.parallel('pug'));

    // Слежение в /src за img и js
    watch('./src/img/**/*.*', gulp.parallel('copy:img'));
    watch('./src/js/**/*.*', gulp.parallel('copy:js'));


    // отслеживание и запуск html
    // watch('./src/**/*.html', gulp.parallel('html'))
});

// Tack  запуска сервера из /build
gulp.task('server', function () {
    browserSync.init({
        server: {
            baseDir: "./build/"
        }
    })
});

// Task запуска отчистки в /build
gulp.task('clean:build', function () {
    return del('./build')
});

// Задача по умолчанию запуск всех task
gulp.task('default', gulp.series(
    gulp.parallel('clean:build'),
    gulp.parallel('scss', 'pug', 'copy:img', 'copy:js'),
    gulp.parallel('server', 'watch'))
);

