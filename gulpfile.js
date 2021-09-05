let preprocessor = 'sass', // Preprocessor (sass, less, styl); 'sass' also work with the Scss syntax in blocks/ folder.
		fileswatch   = 'html,htm,txt,json,md,woff2', // List of files extensions for watching & hard reload
		mode         = 'webpack' // JavaScript modes: 'webpack' or 'concat'

import pkg from 'gulp'
const { gulp, src, dest, parallel, series, watch } = pkg

import browserSync  from 'browser-sync'
import bssi         from 'browsersync-ssi'
import ssi          from 'ssi'
import webpack      from 'webpack-stream'
import uglifyEs     from 'gulp-uglify-es'
const  uglify       = uglifyEs.default
import concat       from 'gulp-concat'
import gulpSass     from 'gulp-sass'
import dartSass     from 'sass'
import sassglob     from 'gulp-sass-glob'
const  sass         = gulpSass(dartSass)
import less         from 'gulp-less'
import lessglob     from 'gulp-less-glob'
import styl         from 'gulp-stylus'
import stylglob     from 'gulp-noop'
import postCss      from 'gulp-postcss'
import cssnano      from 'cssnano'
import autoprefixer from 'autoprefixer'
import imagemin     from 'gulp-imagemin'
import changed      from 'gulp-changed'
import rename       from 'gulp-rename'
import rsync        from 'gulp-rsync'
import del          from 'del'

// For JavaScript Concat mode
function scripts_concat() {
	return src([
		'app/libs/jquery/dist/jquery.min.js', // sudo npm i -g bower; bower i jquery
		'app/libs/owlCarousel/owl.carousel.min.js', // sudo npm i -g bower; bower i jquery
		'app/js/app.js', // Always at the end
		])
	.pipe(concat('app.min.js'))
	.pipe(uglify({ output: { comments: false } }))
	.pipe(dest('app/js'))
	.pipe(browserSync.stream())
}

// For JavaScript Webpack mode
function scripts_webpack() {
	return src(['app/js/*.js', '!app/js/*.min.js'])
		.pipe(webpack({
			mode: 'production',
			performance: { hints: false },
			module: {
				rules: [
					{
						test: /\.(js)$/,
						exclude: /(node_modules)/,
						loader: 'babel-loader',
						query: {
							presets: ['@babel/env'],
							plugins: ['babel-plugin-root-import']
						}
					}
				]
			}
		})).on('error', function handleError() {
			this.emit('end')
		})
		.pipe(rename('app.min.js'))
		.pipe(dest('app/js'))
		.pipe(browserSync.stream())
}

function styles() {
	return src([`app/styles/${preprocessor}/*.*`, `!app/styles/${preprocessor}/_*.*`])
		.pipe(eval(`${preprocessor}glob`)())
		.pipe(eval(preprocessor)())
		.pipe(postCss([
			autoprefixer({ grid: 'autoplace' }),
			cssnano({ preset: ['default', { discardComments: { removeAll: true } }] })
		]))
		.pipe(rename({ suffix: '.min' }))
		.pipe(dest('app/css'))
		.pipe(browserSync.stream())
}

function images() {
	return src(['app/images/src/**/*'])
		.pipe(changed('app/images/dist'))
		.pipe(imagemin())
		.pipe(dest('app/images/dist'))
		.pipe(browserSync.stream())
}

function buildcopy() {
	return src([
		'{app/js,app/css}/*.min.*',
		'app/images/**/*.*',
		'!app/images/src/**/*',
		'app/fonts/**/*'
	], { base: 'app/' })
	.pipe(dest('dist'))
}

async function buildhtml() {
	let includes = new ssi('app/', 'dist/', '/**/*.html')
	includes.compile()
	del('dist/parts', { force: true })
}

async function cleandist() {
	del('dist/**/*', { force: true })
}

function browsersync() {
	browserSync.init({
		server: {
			baseDir: 'app/',
			middleware: bssi({ baseDir: 'app/', ext: '.html' })
		},
		ghostMode: { clicks: false },
		notify: false,
		online: true,
		// tunnel: 'yousutename', // Attempt to use the URL https://yousutename.loca.lt
	})
}

function deploy() {
	return src('dist/')
		.pipe(rsync({
			root: 'dist/',
			hostname: 'username@yousite.com',
			destination: 'yousite/public_html/',
			// clean: true, // Mirror copy with file deletion
			include: [/* '*.htaccess' */], // Included files to deploy,
			exclude: [ '**/Thumbs.db', '**/*.DS_Store' ],
			recursive: true,
			archive: true,
			silent: false,
			compress: true
		}))
}

function startwatch() {
	watch(`app/styles/${preprocessor}/**/*`, { usePolling: true }, styles)
	watch(['app/js/**/*.js', '!app/js/**/*.min.js'], { usePolling: true }, scripts)
	watch('app/images/src/**/*', { usePolling: true }, images)
	watch(`app/**/*.{${fileswatch}}`, { usePolling: true }).on('change', browserSync.reload)
}

let scripts = eval(`scripts_${mode}`)

export { scripts, styles, deploy }
export let assets = series(scripts, styles, )
export let build = series(cleandist,  scripts, styles, buildcopy, buildhtml)
export default series(scripts, styles, parallel(browsersync, startwatch))
