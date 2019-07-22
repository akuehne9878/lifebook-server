var fs = require("fs");
var path = require("path");
var rimraf = require("rimraf");

function buildResult(res, data) {
  console.log(data);

  res.writeHead(200, { "Content-Type": "application/json" });
  res.write(data);
  res.end();
}

var Lifebook = {
  loadPage: function(req, res) {
    console.log(req.body);

    var fullIndexPath = req.body.path + "/index.md";

    var content = "";
    if (fs.existsSync(fullIndexPath)) {
      content = fs.readFileSync(fullIndexPath) + "";
    }

    var files = [];

    fs.readdirSync(req.body.path).forEach(file => {
      files.push({ name: file });
    });

    var fullMetaPath = req.body.path + "/metainfo.json";
    var metaInfo = JSON.parse(fs.readFileSync(fullMetaPath));

    buildResult(res, JSON.stringify({ content: content, title: metaInfo.title, path: req.body.path, files: files }));
  },

  savePage: function(req, res) {
    console.log(req.body);

    var fullIndexPath = req.body.path + "/index.md";
    fs.writeFileSync(fullIndexPath, req.body.content);

    var fullMetaPath = req.body.path + "/metainfo.json";
    fs.writeFileSync(fullMetaPath, JSON.stringify({ title: req.body.title }));

    buildResult(res, JSON.stringify({}));
  },

  deletePage: function(req, res) {
    console.log(req.body);

    rimraf.sync(req.body.path);

    Lifebook.tree(req, res);
  },

  createPage: function(req, res) {
    console.log(req.body);

    Lifebook._create(req.body.title, req.body.path, res);

    Lifebook.tree(req, res);
  },

  _create: function(title, path, res) {
    if (!path) {
      path = "./wiki";
    }

    var fullPath = path + "/" + title;
    if (fs.existsSync(fullPath)) {
      res.status(500);
    }

    fs.mkdirSync(fullPath);

    var metainfo = {
      title: title,
      id: 0
    };

    fs.writeFileSync(fullPath + "/metainfo.json", JSON.stringify(metainfo));
  },

  tree: function(req, res) {
    const walkSync = (dir, item) => {
      const files = fs.readdirSync(dir);
      var children = [];
      for (const file of files) {
        const dirFile = path.join(dir, file);
        const dirent = fs.statSync(dirFile);

        if (dirent.isDirectory()) {
          var child = {
            path: dirFile
          };

          child.items = walkSync(dirFile, child);

          children.push(child);
        } else {
          if (dirFile.endsWith("metainfo.json") && item != null) {
            var metaInfo = JSON.parse(fs.readFileSync(dirFile));
            item.title = metaInfo.title;
            item.id = metaInfo.id;
            item.type = "page";
            //item.a = metaInfo;
          }
        }
      }
      return children;
    };

    var directoryStructure = walkSync("./wiki");

    directoryStructure = directoryStructure.map(function(item) {
      item.type = "lifebook";
      return item;
    });

    buildResult(res, JSON.stringify({ items: directoryStructure }));
  },

  nextSeq: function(req, res) {
    var nextSeq = 1;
    var seqFileName = "seq.txt";

    function write() {
      fs.writeFile(seqFileName, nextSeq, function(err) {
        if (err) throw err;
        buildResult(res, nextSeq + "");
      });
    }

    if (fs.existsSync(seqFileName)) {
      fs.readFile(seqFileName, function(err, data) {
        nextSeq = parseInt(data, 10) + 1;

        write();
      });
    } else {
      write();
    }
  }
};

module.exports = Lifebook;
