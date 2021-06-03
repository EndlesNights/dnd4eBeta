// Dependencies for build tasks.
const gulp = require('gulp');
const prefix = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const yaml = require('gulp-yaml');
const webp = require('gulp-webp');
const vueComponent = require('gulp-vue-single-file-component');
const babel = require('gulp-babel');
const wrap = require('gulp-wrap');
const declare = require('gulp-declare');
const concat = require('gulp-concat');
const minify = require('gulp-minify');

// Dependencies for compendium tasks.
const through2 = require("through2");
const jsYaml = require("js-yaml");
const Datastore = require("nedb");
const mergeStream = require("merge-stream");
const fs = require("fs");
const path = require("path");
const clean = require("gulp-clean");

// Constants.
const PACK_SRC = "packs/src";
const PACK_DEST = "packs/dist";

/* ----------------------------------------- */
/*  Compile Compendia
/* ----------------------------------------- */

/**
 * Gulp Task: Compile packs from the yaml source content to .db files.
 */
function compilePacks() {
  // Every folder in the src dir will become a compendium.
  const folders = fs.readdirSync(PACK_SRC).filter((file) => {
    return fs.statSync(path.join(PACK_SRC, file)).isDirectory();
  });

  // Iterate over each folder/compendium.
  const packs = folders.map((folder) => {
    // Initialize a blank nedb database based on the directory name. The new
    // database will be stored in the dest directory as <foldername>.db
    const db = new Datastore({ filename: path.resolve(__dirname, PACK_DEST, `${folder}.db`), autoload: true });
    // Process the folder contents and insert them in the database.
    return gulp.src(path.join(PACK_SRC, folder, "/**/*.yml")).pipe(
      through2.obj((file, enc, cb) => {
        let json = jsYaml.loadAll(file.contents.toString());
        db.insert(json);
        cb(null, file);
      })
    );
  });

  // Execute the streams.
  return mergeStream.call(null, packs);
}

/**
 * Cleanup the packs directory.
 *
 * This task will delete the existing compendiums so that the compile task can
 * write fresh copies in their place.
 */
function cleanPacks() {
  return gulp.src(`${PACK_DEST}`, { allowEmpty: true }, {read: false}).pipe(clean());
}

/* ----------------------------------------- */
/*  Export Compendia
/* ----------------------------------------- */

/**
 * Santize pack entries.
 *
 * This function will deep clone a given compendium object, such as an Actor or
 * Item, and will then delete the `_id` key along with replacing the
 * `_permission` object with a generic version that doesn't reference user IDs.
 *
 * @param {object} pack Loaded compendium content.
 */
function sanitizePack(pack) {
  let sanitizedPack = JSON.parse(JSON.stringify(pack));
  delete sanitizedPack._id;
  sanitizedPack.permission = { default: 0 };
  return sanitizedPack;
}

/**
 * Sluggify a string.
 *
 * This function will take a given string and strip it of non-machine-safe
 * characters, so that it contains only lowercase alphanumeric characters and
 * hyphens.
 *
 * @param {string} string String to sluggify.
 */
function sluggify(string) {
  return string
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, ' ')
    .trim()
    .replace(/\s+|-{2,}/g, '-');
}

/**
 * Gulp Task: Export Packs
 *
 * This gulp task will load all compendium .db files from the dest directory,
 * load them into memory, and then export them to a human-readable YAML format.
 */
function extractPacks() {
  // Start a stream for all db files in the packs dir.
  const packs = gulp.src(`${PACK_DEST}/**/*.db`)
    // Run a callback on each pack file to load it and then write its
    // contents to the pack src dir in yaml format.
    .pipe(through2.obj((file, enc, callback) => {
      // Create directory.
      let filename = path.parse(file.path).name;
      if (!fs.existsSync(`./${PACK_SRC}/${filename}`)) {
        fs.mkdirSync(`./${PACK_SRC}/${filename}`);
      }

      // Load the database.
      const db = new Datastore({ filename: file.path, autoload: true });
      db.loadDatabase();

      // Export the packs.
      db.find({}, (err, packs) => {
        // Iterate through each compendium entry.
        packs.forEach(pack => {
          // Remove permissions and _id
          pack = sanitizePack(pack);

          // Convert to a Yaml document.
          let output = jsYaml.dump(pack, {
            quotingType: "'",
            forceQuotes: true,
            noRefs: true,
            sortKeys: false
          });

          // Sluggify the filename.
          let packName = sluggify(pack.name);

          // Write to the file system.
          fs.writeFileSync(`./${PACK_SRC}/${filename}/${packName}.yml`, output);
        });
      });

      // Complete the through2 callback.
      callback(null, file);
    }));

  // Call the streams.
  return mergeStream.call(null, packs);
}

/* ----------------------------------------- */
/* Convert images
/* ----------------------------------------- */
const SYSTEM_IMAGES = [
  'assets/src/**/*.{png,jpeg,jpg}',
];
function compileImages() {
  return gulp.src(SYSTEM_IMAGES, {base: 'assets/src'})
    .pipe(webp())
    .pipe(gulp.dest('./assets/dist'));
};
const imageTask = gulp.series(compileImages);

const SYSTEM_SVG = [
  'assets/src/**/*.svg',
];
function compileSvg() {
  return gulp.src(SYSTEM_SVG, {base: 'assets/src'})
    .pipe(gulp.dest('./assets/dist'));
}
const svgTask = gulp.series(compileSvg);

/* ----------------------------------------- */
/*  Compile Sass
/* ----------------------------------------- */

// Small error handler helper function.
function handleError(err) {
  console.log(err.toString());
  this.emit('end');
}

const SYSTEM_SCSS = ["scss/**/*.scss"];
function compileScss() {
  // Configure options for sass output. For example, 'expanded' or 'nested'
  let options = {
    outputStyle: 'nested'
  };
  return gulp.src(SYSTEM_SCSS)
    .pipe(
      sass(options)
        .on('error', handleError)
    )
    .pipe(prefix({
      cascade: false
    }))
    .pipe(gulp.dest("./css"))
}
const css = gulp.series(compileScss);

/* ----------------------------------------- */
/*  Compile YAML
/* ----------------------------------------- */
const SYSTEM_YAML = ['./yaml/**/*.yml', './yaml/**/*.yaml'];
function compileYaml() {
  return gulp.src(SYSTEM_YAML)
    .pipe(yaml({ space: 2 }))
    .pipe(gulp.dest('./'))
}
const yamlTask = gulp.series(compileYaml);


/* ----------------------------------------- */
/*  Compile Vue
/* ----------------------------------------- */

const VUE_FILES = ["templates/vue/**/*.vue"];

function compileVue() {
  return gulp.src(VUE_FILES)
        .pipe(vueComponent({ loadCssMethod: 'VuePort.loadCss' }))
        .pipe(babel({ plugins: ['@babel/plugin-transform-modules-commonjs'] }))
        .pipe(wrap('Vue.component(<%= processComponentName(file.relative) %>, (function() {const exports = {}; <%= contents %>; return _default;})())', {}, {
            imports: {
                processComponentName: function (fileName) {
                    // Strip the extension and escape the output with JSON.stringify
                    return JSON.stringify(path.basename(fileName, '.js'));
                }
            }
        }))
        .pipe(declare({
            namespace: 'VuePort.Components',
            noRedeclare: true, // Avoid duplicate declarations
        }))
        .pipe(concat('vue-components.js'))

    .pipe(minify({ noSource: true, ext: ".min.js" }))
        .pipe(gulp.dest('dist/'));
}
const vueTask = gulp.series(compileVue);

/* ----------------------------------------- */
/*  Watch Updates
/* ----------------------------------------- */

function watchUpdates() {
  gulp.watch(SYSTEM_SCSS, css);
  gulp.watch(SYSTEM_YAML, yamlTask);
  gulp.watch(SYSTEM_IMAGES, imageTask);
  gulp.watch(SYSTEM_SVG, svgTask);
  gulp.watch(VUE_FILES, vueTask);
  // gulp.watch(SYSTEM_SCRIPTS, scripts);
}

/* ----------------------------------------- */
/*  Export Tasks
/* ----------------------------------------- */

exports.default = gulp.series(
  compileScss,
  compileYaml,
  compileImages,
  compileSvg,
  compileVue,
  watchUpdates
);
exports.images = imageTask;
exports.svg = svgTask;
exports.css = css;
exports.yaml = yamlTask;
exports.vue = vueTask;
// exports.cleanPacks = gulp.series(cleanPacks);
// exports.compilePacks = gulp.series(cleanPacks, compilePacks);
// exports.extractPacks = gulp.series(extractPacks);
exports.build = gulp.series(
  compileScss,
  compileYaml,
  compileImages,
  compileSvg,
  compileVue,
  // cleanPacks,
  // compilePacks
);
