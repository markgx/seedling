var path = require('path'),
  fs = require('fs');

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

// process 'public' files
if (fs.existsSync(PUBLIC_DIR)) {
  fs.readdir(PUBLIC_DIR, function (err, files) {
    // TODO: something
  });
}
