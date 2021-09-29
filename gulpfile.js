// 'use strict'
const {src, dest, lastRun, parallel} = require('gulp')
const gulp = require('gulp')
const del = require('del')
const cache = require('gulp-cache')
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

/**
 * ### Paths ###
 */
const paths = {
    html: {
        src: 'app/pages/*.{html,php}',
        dest: 'dist/',
        watch: 'app/pages/**/*.{html,php}'
    },
    styles: {
        src: 'app/styles/**/*.scss',
        dest: 'dist/css/',
        watch: 'app/styles/**/*.{css,scss}'
    },
    scripts: {
        src: [
            'node_modules/jquery/dist/jquery.js',
            'node_modules/bootstrap/dist/js/bootstrap.bundle.js',
            'node_modules/swiper/swiper-bundle.js',
            'app/scripts/main.js'
        ],
        dest: 'dist/js/',
        watch: 'app/scripts/**/*.js'
    },
    images: {
        src: 'app/images/**/*.{jpg,jpeg,gif,png,svg}',
        dest: 'dist/images/',
        watch: 'app/images/**/*.{jpg,jpeg,gif,png,svg}'
    },
    symbols: {
        src: 'app/svg/*.svg',
        dest: 'dist/images/',
        watch: 'app/svg/*.svg'
    },
    fonts: {
        src: 'app/fonts/**/*',
        dest: 'dist/fonts/',
        watch: 'app/fonts/**/*'
    }
}

/**
 * ### CLEAN ###
 * Clean & delete 'dist' directory
 */
function clean() {
    return del(['dist'])
}
exports.clean = clean

/**
 * ### HTML ###
 * Building HTML using Panini
 */
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
exports.html = html

// Panini refresh
function resetPages(done) {
    panini.refresh()
    done()
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
exports.styles = styles

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
exports.scripts = scripts

// images
function images() {
    return gulp.src(paths.images.src, { since: lastRun(images) })
        .pipe(cache(imagemin([
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
        ])))
        .pipe(dest(paths.images.dest))
        .pipe(browserSync.stream())
}
exports.images = images

// svg symbols
function symbols() {
    return gulp.src(paths.symbols.src, { since: lastRun(symbols) })
        .pipe(cache(imagemin([
            imagemin.svgo({
                plugins: [
                    { removeViewBox: false },
                    { cleanupIDs: true },
                    { removeRasterImages: true },
                    { removeDimensions: true }
                ]
            })
        ])))
        .pipe(svgSymbols({
            id: '%f',
            templates: ['default-svg']
        }))
        .pipe(dest(paths.symbols.dest))
        .pipe(browserSync.stream())
}
exports.symbols = symbols

// Clean Cache
function cleanCache(done) {
    cache.clearAll()
    done()
}
exports.cleanCache = cleanCache

// fonts
function fonts() {
    return gulp.src(paths.fonts.src)
        .pipe(dest(paths.fonts.dest))
        .pipe(browserSync.stream())
}
exports.fonts = fonts

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
    gulp.watch(paths.images.watch).on('change', gulp.series(images, browserSync.reload))
    gulp.watch(paths.symbols.watch).on('change', gulp.series(symbols, browserSync.reload))
    done()
}

// Exports
const build = gulp.series(clean, images, symbols, fonts, gulp.parallel(html, styles, scripts), watch)
exports.build = build
exports.default = build
