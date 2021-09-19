'use strict'
const { src, dest, series, parallel, watch } = require('gulp')
const gulp         = require('gulp');
const browserSync  = require('browser-sync').create()
const plumber      = require('gulp-plumber')
const panini       = require('panini')
const sourcemaps   = require('gulp-sourcemaps')
const sass         = require('gulp-sass')(require('sass'))
const autoprefixer = require('gulp-autoprefixer')
const concat       = require('gulp-concat')
const babel        = require('gulp-babel')
const uglify       = require('gulp-uglify')
const imagemin     = require('gulp-imagemin')
const svgSymbols   = require('gulp-svg-symbols')
const imageminWebp = require('imagemin-webp')
const WEBP         = require('gulp-webp')
const cache        = require('gulp-cache')
const del          = require('del')
const SITEMAP      = require('gulp-sitemap')
const mode         = require('gulp-mode')({modes: ['prod', 'dev'], default: 'dev', verbose: false})
const path         = require('path')
//
const webpack = require('webpack-stream')
//


// ========== HTML ==========
const html = () => {
    panini.refresh()
    return src('app/pages/*.html', { base: 'app/pages/' })
        .pipe(plumber())
        .pipe(panini({
            root:     'app/',
            layouts:  'app/pages/layouts/',
            partials: 'app/pages/partials/',
            helpers:  'app/pages/helpers/',
            data:     'app/pages/data/'
        }))
        .pipe(plumber.stop())
        .pipe(dest('dist/'))
        .pipe(browserSync.stream())
}

// ========== Styles ==========
const styles = () => {
    return src('app/scss/**/*.scss')
        .pipe(plumber())
        .pipe(mode.dev(sourcemaps.init()))
        .pipe(sass.sync({
            outputStyle: 'compressed'
        }).on('error', sass.logError))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 versions'],
            cascade: false
        }))
        .pipe(mode.dev(sourcemaps.write()))
        .pipe(plumber.stop())
        .pipe(dest('dist/css/'))
        .pipe(browserSync.stream())
}

// ========== Scripts ==========
const scripts = () => {
    return src([
        // 'node_modules/...',
        'app/js/main.js',
    ])
        .pipe(plumber())
        .pipe(mode.dev(sourcemaps.init()))
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(mode.dev(sourcemaps.write()))
        .pipe(plumber.stop())
        .pipe(dest('dist/js/'))
        .pipe(browserSync.stream())
}

// ========== Images ==========
const images = () => {
    return src('app/images/**/*.{png,jpg,jpeg,gif}')
        .pipe(cache(imagemin([
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.mozjpeg({ quality: 75, progressive: true }),
            imagemin.gifsicle({ interlaced: true }),
        ])))
        .pipe(dest('dist/images/'))
        .pipe(browserSync.stream())
}
// https://github.com/svg/svgo#built-in-plugins
const svg = () => {
    return src('app/images/*.svg','!app/images/svg/*')
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
        .pipe(dest('dist/images/'))
        .pipe(browserSync.stream())
}
const sprite = () => {
    return src('app/images/symbols/*.svg')
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
        .pipe(dest('dist/images/'))
        .pipe(browserSync.stream())
}
const webp = () => {
    return src('app/images/**/*.{jpg,jpeg,png}')
        .pipe(cache(WEBP()))
        .pipe(dest('dist/images/'))
        .pipe(browserSync.stream())
}

// ========== Fonts ==========
const fonts = () => {
    return src('app/fonts/**/*.*')
        .pipe(dest('dist/fonts/'))
        .pipe(browserSync.stream())
}

// ========== Sitemap ==========
const sitemap = () => {
    return src('dist/*.html', {
        read: false
    })
        .pipe(SITEMAP({
            siteUrl: 'www.example.com',
            changefreq: 'weekly'
        }))
        .pipe(dest('dist'))
}

// ========== Clean Build ==========
const clean = (cb) => {
    del([
        './*.html',
        './dist/*',
        './dist'
    ])
    return cache.clearAll(cb)
}

// ========== BrowserSync ==========
const watchFiles = () => {
    browserSync.init({
        server: { baseDir: ['dist/', './'] },
        notify: false,
        online: false,
    })
}

// ========== Watch ==========
watch(['app/pages/**/*.html','dist/*.html'], html)
watch(['app/scss/**/*.scss','dist/css/**/*'], styles)
watch(['app/js/*.js','dist/js/**/*'], scripts)
watch('app/fonts/**/*', fonts)
watch('app/images/**/*.{png,jpg,jpeg,gif}', images)
watch('app/images/**/*.svg', svg)
watch('app/images/symbols/*.svg', sprite)
watch('app/images/**/*.webp', webp)

// ========== Exports ==========
exports.styles  = styles
exports.scipts  = scripts
exports.html    = html
exports.fonts   = fonts
exports.images  = images
exports.svg     = svg
exports.sprite  = sprite
exports.webp    = webp
exports.sitemap = sitemap
exports.clean   = clean

exports.default = series(clean, parallel(html, styles, scripts, fonts, images, svg, sprite), watchFiles)