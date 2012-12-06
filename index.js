var path = require('path'),
  fs = require('fs'),
  markdown = require('markdown');

var OUTPUT_DIR = './_site',
  PUBLIC_DIR = './public';

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

// TODO: process 'templates'

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

        // TODO: handle layouts

        switch (fileExt) {
          case '.md':
            fs.readFile(srcPath, 'utf8', function(err, data) {
              if (err) throw err;
              var html = markdown.markdown.toHTML(data);
              var dstFilename = el.replace(/\.md$/i, '.html');
              dstPath = path.join(OUTPUT_DIR, relativePath, dstFilename);

              fs.writeFile(dstPath, html);
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
