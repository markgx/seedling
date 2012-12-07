var path = require('path'),
  fs = require('fs'),
  liquid = require('liquid-node'),
  contentFile = require('./lib/content_file.js');

var OUTPUT_DIR = './_site',
  PUBLIC_DIR = './public',
  TEMPLATE_DIR = './templates';

console.log('Seedling v.0.0');
console.log('Generating site for path: ' + path.resolve('.'));

// delete output folder if it exists so that we can regenerate it
if (fs.existsSync(OUTPUT_DIR)) {
  deleteFolderRecursive(OUTPUT_DIR);
}

fs.mkdir(OUTPUT_DIR, function(error) {
  if (error) {
    console.log(error);
    process.exit(1);
  }
});

var templates = {};

if (fs.existsSync(TEMPLATE_DIR)) {
  templates = loadTemplates(TEMPLATE_DIR);
}

// process 'public' files
if (fs.existsSync(PUBLIC_DIR)) {
  processFolder(PUBLIC_DIR, '/', templates);
}

function deleteFolderRecursive(path) {
  var files = [];

  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);

    files.forEach(function(file) {
      var curPath = path + '/' + file;

      if (fs.statSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });

    fs.rmdirSync(path);
  }
}

function loadTemplates(filePath) {
  var files = fs.readdirSync(filePath);
  var templates = {};

  files.forEach(function loadTemplate(file) {
    var srcPath = path.join(filePath, file);

    if (fs.statSync(srcPath).isFile() && path.extname(file).toLowerCase() === '.html') {
      // add to templates store
      var templateName = file.replace(/\.html$/i, '');
      console.log('template: ' + templateName);
      templates[templateName] = liquid.Template.parse(fs.readFileSync(srcPath, 'utf8'));
    }
  });

  return templates;
};

function processFolder(filePath, relativePath, templates) {
  fs.readdir(filePath, function(err, files) {
    files.forEach(function(el) {
      var srcPath = path.join(filePath, el);
      var fstat = fs.statSync(srcPath);

      if (fstat.isDirectory()) {
        console.log('dir: ' + srcPath);

        var dstPath = path.join(OUTPUT_DIR, relativePath, el);
        fs.mkdirSync(dstPath);
        processFolder(srcPath, path.join(relativePath, el), templates);
      } else if (fstat.isFile()) {
        console.log('file: ' + srcPath);
        contentFile.process(srcPath, path.join(OUTPUT_DIR, relativePath), templates);
      }
    });
  });
}
