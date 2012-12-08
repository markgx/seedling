var fs = require('fs')
  , path = require('path')
  , liquid = require('liquid-node')
  , _ = require('underscore')
  , contentFile = require('./content_file');

var defaults = {
  outputDir: './_site',
  publicDir: './public',
  templateDir: './templates'
};

var seedling = module.exports = function(siteDir, options) {
  this.siteDir = siteDir;
  this.options = _.extend(defaults, options);
  this.templates = {};
};

seedling.prototype.generate = function() {
  var self = this;

  // delete output folder if it exists so that we can regenerate it
  if (fs.existsSync(self.options.outputDir)) {
    deleteFolderRecursive(self.options.outputDir);
  }

  fs.mkdir(self.options.outputDir, function(error) {
    if (error) {
      console.log(error);
      process.exit(1);
    }
  });

  self.loadTemplates();

  // process 'public' files
  if (fs.existsSync(self.options.publicDir)) {
    self.processFolder(self.options.publicDir, '/');
  }
}

seedling.prototype.loadTemplates = function() {
  var self = this;

  if (!fs.existsSync(self.options.templateDir)) {
    return;
  }

  var files = fs.readdirSync(self.options.templateDir);

  files.forEach(function loadTemplate(file) {
    var srcPath = path.join(self.options.templateDir, file);

    if (fs.statSync(srcPath).isFile() && path.extname(file).toLowerCase() === '.html') {
      // add to templates store
      var templateName = file.replace(/\.html$/i, '');
      console.log('template: ' + templateName);
      self.templates[templateName] = liquid.Template.parse(fs.readFileSync(srcPath, 'utf8'));
    }
  });
};

seedling.prototype.processFolder = function(filePath, relativePath) {
  var self = this;

  fs.readdir(filePath, function(err, files) {
    files.forEach(function(el) {
      var srcPath = path.join(filePath, el);
      var fstat = fs.statSync(srcPath);

      if (fstat.isDirectory()) {
        console.log('dir: ' + srcPath);

        var dstPath = path.join(self.options.outputDir, relativePath, el);
        fs.mkdirSync(dstPath);
        self.processFolder(srcPath, path.join(relativePath, el));
      } else if (fstat.isFile()) {
        console.log('file: ' + srcPath);
        contentFile.process(srcPath, path.join(self.options.outputDir, relativePath), self.templates);
      }
    });
  });
};

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
