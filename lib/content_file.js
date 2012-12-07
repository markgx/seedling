var fs = require('fs'),
  path = require('path'),
  markdown = require('markdown'),
  frontMatter = require('front-matter');

exports.process = function(srcFile, dstFolder, templates) {
  var filename = path.basename(srcFile);
  var fileExt = path.extname(filename).toLowerCase();

  // process special markup files
  if (fileExt === '.md' || fileExt === '.markdown' ||
      fileExt === '.htm' || fileExt === '.html') {
    fs.readFile(srcFile, 'utf8', function(err, data) {
      if (err) throw err;

      var extract = frontMatter(data);
      var html;

      if (fileExt === '.md' || fileExt === '.markdown') {
        html = markdown.markdown.toHTML(extract.body);
      } else {
        html = extract.body;
      }

      var dstFilename = filename.replace(/\.[a-z]+$/i, '.html');
      var dstPath = path.join(dstFolder, dstFilename);

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
  } else {
    // copy file to output directory
    var dstPath = path.join(dstFolder, filename);
    fs.createReadStream(srcFile).pipe(fs.createWriteStream(dstPath));
  }
};
