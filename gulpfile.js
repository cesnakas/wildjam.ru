// 'use strict'
const {src, dest, parallel} = require('gulp')
const gulp = require('gulp')
const del = require('del')
const panini = require('panini')

const sass = require('gulp-sass')(require('sass'))
const sassGlob = require('gulp-sass-glob')

const babel = require('gulp-babel')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify')

const imagemin = require('gulp-imagemin')
const svgSymbols =require('gulp-svg-symbols')
const autoprefixer = require('gulp-autoprefixer')
const sourcemaps = require('gulp-sourcemaps')
const mode = require('gulp-mode')({modes: ['prod', 'dev'], default: 'dev', verbose: false})
const browserSync = require('browser-sync').create()

// Paths
const paths = {
    html: {
        src: 'app/pages/*.{html,php}',
        dest: 'dist/',
        watch: 'app/pages/**/*.{html,php}'
    },
    styles: {
        src: 'app/scss/**/*.scss',
        dest: 'dist/css/',
        watch: 'app/scss/**/*.scss'
    },
    scripts: {
        src: [
            'node_modules/jquery/dist/jquery.js',
            'node_modules/swiper/swiper-bundle.js',
            'app/js/main.js'
        ],
        dest: 'dist/js/',
        watch: 'app/js/*.js'
    },
    images: {
        src: 'app/images/*.{jpg,jpeg,gif,png,svg}',
        dest: 'dist/images/',
        build: 'dist/images/*.{jpg,jpeg,gif,png,svg}'
    },
    symbols: {
        src: 'app/symbols/*.svg',
        dest: 'dist/images/'
    }
}

// gulp clean
function clean() {
    return del(['dist'])
}

// gulp html
function html() {
    return gulp.src(paths.html.src)
        .pipe(panini({
            root:     'app/pages/',
            layouts:  'app/pages/layouts/',
            partials: 'app/pages/partials/',
            helpers:  'app/pages/helpers/',
            data:     'app/pages/data/'
        }))
        .pipe(dest(paths.html.dest))
        .pipe(browserSync.stream())
}

// gulp styles
function styles() {
    return gulp.src(paths.styles.src)
        .pipe(mode.dev(sourcemaps.init()))
        .pipe(sassGlob())
        .pipe(sass.sync({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 8 versions'],
            cascade: false,
            grid: true
        }))
        .pipe(mode.dev(sourcemaps.write()))
        .pipe(dest(paths.styles.dest))
}

// gulp scripts
function scripts() {
    return gulp.src(paths.scripts.src, { sourcemaps: true })
        .pipe(mode.dev(sourcemaps.init()))
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(mode.dev(sourcemaps.write()))
        .pipe(dest(paths.scripts.dest))
}

// images
function images() {
    return gulp.src(paths.images.src)
        .pipe(imagemin([
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.mozjpeg({ quality: 75, progressive: true }),
            imagemin.gifsicle({ interlaced: true }),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: false },
                    { cleanupIDs: true },
                    { removeRasterImages: true },
                    { removeDimensions: true }
                ]
            })
        ]))
        .pipe(dest(paths.images.dest))
        .pipe(browserSync.stream())
}

// svg symbols
function symbols() {
    return gulp.src(paths.symbols.src)
        .pipe(imagemin([
            imagemin.svgo({
                plugins: [
                    { removeViewBox: false },
                    { cleanupIDs: true },
                    { removeRasterImages: true },
                    { removeDimensions: true }
                ]
            })
        ]))
        .pipe(svgSymbols({
            id: '%f',
            templates: ['default-svg']
        }))
        .pipe(dest(paths.symbols.dest))
        .pipe(browserSync.stream())
}

// panini
function resetPages(done) {
    panini.refresh()
    done()
}

// watch
function watch(done) {
    browserSync.init({
        server: {
            baseDir: ['dist/', './']
        },
        notify: false,
        online: false,
    })
    // html
    gulp.watch('app/{pages,layouts,partials}/**/*.{html,php}').on('change', gulp.series(resetPages, html, browserSync.reload))
    gulp.watch('app/pages/data/**/*.{js,json,yml}').on('change', gulp.series(resetPages, html, browserSync.reload))
    gulp.watch('app/pages/helpers/**/*.js').on('change', gulp.series(resetPages, html, browserSync.reload))
    // styles
    gulp.watch(paths.styles.watch).on('change', gulp.parallel(styles, browserSync.reload))
    // scripts
    gulp.watch(paths.scripts.watch).on('change', gulp.parallel(scripts, browserSync.reload))
    // images
    gulp.watch(['app/images/*.{jpg,jpeg,gif,png,svg}', 'dist/images/*.{jpg,jpeg,gif,png,svg}'], images)
    done()
}

var build = gulp.series(clean, images, symbols, gulp.parallel(html, styles, scripts), watch)

// Exports
exports.clean = clean
exports.html = html
exports.styles = styles
exports.scripts = scripts
exports.images = images
exports.symbols = symbols
exports.build = build

exports.default = build
