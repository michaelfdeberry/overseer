/// <binding BeforeBuild='default' />
var gulp = require("gulp");
var sass = require("gulp-sass");
var watch = require("gulp-watch");
var uglify = require("gulp-uglify");
var concat = require("gulp-concat");
var jshint = require("gulp-jshint");
var minifyCSS = require("gulp-minify-css");
var sourcemaps = require("gulp-sourcemaps");
var templateCache = require("gulp-angular-templatecache");
var rev = require("gulp-rev-append");

gulp.task("styles", function() {
    return gulp.src("app/assets/styles/overseer.scss")
        .pipe(sass().on("error", sass.logError))
        .pipe(minifyCSS())
        .pipe(gulp.dest("./"));
});

gulp.task("lint", function() {
    return gulp.src("app/**/*.js")
        .pipe(jshint({
            multistr: true,
            strict: true,
            quotmark: "double",
            unused: "vars",
            freeze: true,
            nonew: true,
            nocomma: true,
            maxdepth: 3
        }))
        .pipe(jshint.reporter("jshint-stylish"), { verbose: true })
        .pipe(jshint.reporter("fail"));
});

gulp.task("templates", function () {
    return gulp.src("app/**/*html")
        .pipe(templateCache({
            module: "overseer"
        }))
        .pipe(gulp.dest("./"));
});

gulp.task("angular", ["lint", "templates"], function () {    
    return gulp.src(["app/**/*js", "templates.js"])
        .pipe(sourcemaps.init())
        .pipe(uglify({ mangle: false }))
        .pipe(concat("overseer.js", { newLine: "\n" }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest("./"));
});

gulp.task("rev", function() {
    return gulp.src("./index.html")
        .pipe(rev())
        .pipe(gulp.dest("./"));
});

gulp.task("watch", function () {
    gulp.watch("app/**/*", ["styles", "angular"]); 
});

gulp.task("default", ["rev", "styles", "angular"]);