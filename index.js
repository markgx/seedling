var path = require('path'),
  fs = require('fs'),
  markdown = require('markdown'),
  frontMatter = require('front-matter'),
  liquid = require('liquid-node');

var OUTPUT_DIR = './_site',
  PUBLIC_DIR = './public',
  TEMPLATE_DIR = './templates';

console.log('Seedling v.0.0');
console.log('Generating site for path: ' + path.resolve('.'));

var deleteFolderRecursive = function(path) {
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
};

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

var processTemplates = function(filePath) {
  var files = fs.readdirSync(filePath);
  var templates = {};

  files.forEach(function(el) {
    var srcPath = path.join(filePath, el);
    if (fs.statSync(srcPath).isFile() && path.extname(el).toLowerCase() === '.html') {
      // add to templates store
      var templateName = el.replace(/\.html$/i, '');
      console.log('template: ' + templateName);
      templates[templateName] = liquid.Template.parse(fs.readFileSync(srcPath, 'utf8'));
    }
  });

  return templates;
};

var templates = {};

if (fs.existsSync(TEMPLATE_DIR)) {
  templates = processTemplates(TEMPLATE_DIR);
}

var processFolder = function(filePath, relativePath) {
  fs.readdir(filePath, function(err, files) {
    files.forEach(function(el) {
      var srcPath = path.join(filePath, el);
      var dstPath = path.join(OUTPUT_DIR, relativePath, el);
      var fstat = fs.statSync(srcPath);

      if (fstat.isDirectory()) {
        console.log('dir: ' + srcPath);

        fs.mkdirSync(dstPath);
        processFolder(srcPath, path.join(relativePath, el));
      } else if (fstat.isFile()) {
        console.log('file: ' + srcPath);

        // process special markup files
        var fileExt = path.extname(el).toLowerCase();

        // handle layouts

        switch (fileExt) {
          case '.md':
            fs.readFile(srcPath, 'utf8', function(err, data) {
              if (err) throw err;

              var extract = frontMatter(data);
              var html = markdown.markdown.toHTML(extract.body);

              var dstFilename = el.replace(/\.md$/i, '.html');
              dstPath = path.join(OUTPUT_DIR, relativePath, dstFilename);

              if (extract.attributes.template && templates[extract.attributes.template]) {
                // use template if defined in metadata
                var render = templates[extract.attributes.template].render({
                  'content': html
                });

                render.done(function(renderedHtml) {
                  fs.writeFile(dstPath, renderedHtml);
                });
              } else {
                fs.writeFile(dstPath, html);
              }
            });

            break;
          default:
            fs.createReadStream(srcPath).pipe(fs.createWriteStream(dstPath));
        }
      }
    });
  });
};

// process 'public' files
if (fs.existsSync(PUBLIC_DIR)) {
  processFolder(PUBLIC_DIR, '/');
}
