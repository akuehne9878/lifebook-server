var fs = require("fs");
var fsExtra = require("fs-extra");
var path = require("path");
var rimraf = require("rimraf");

function buildResult(res, data) {
  console.log(data);

  res.writeHead(200, { "Content-Type": "application/json" });
  res.write(data);
  res.end();
}

var Lifebook = {
  loadPage: function (req, res) {
    console.log(req.body);

    var fullIndexPath = req.body.path + "/index.md";

    var content = "";
    if (fs.existsSync(fullIndexPath)) {
      content = fs.readFileSync(fullIndexPath) + "";
    }

    var files = [];

    fs.readdirSync(req.body.path, { withFileTypes: true }).forEach(function (dirent) {
      if (dirent.isFile()) {
        if (dirent.name !== "metainfo.json" && dirent.name !== "index.md") {
          const stats = fs.statSync(req.body.path + "/" + dirent.name);

          files.push({ name: dirent.name, date: stats.birthtime });
        }
      }
    });

    var fullMetaPath = req.body.path + "/metainfo.json";
    // var metaInfo = JSON.parse(fs.readFileSync(fullMetaPath));

    var title = req.body.path.split(path.sep).pop();

    buildResult(res, JSON.stringify({ content: content, title: title, path: req.body.path, files: files }));
  },

  savePage: function (req, res) {
    console.log(req.body);

    var fullIndexPath = req.body.path + "/index.md";
    fs.writeFileSync(fullIndexPath, req.body.content);

    var fullMetaPath = req.body.path + "/metainfo.json";
    fs.writeFileSync(fullMetaPath, JSON.stringify({ title: req.body.title }));

    buildResult(res, JSON.stringify({}));
  },

  renamePage: function (req, res) {
    console.log(req.body);

    var oldName = req.body.path.split(path.sep).pop()
    var newPath = req.body.path.replace(oldName, req.body.newTitle);

    fs.renameSync(req.body.path, newPath, (err) => {
      if (err) {
        throw err;
      }});

    buildResult(res, JSON.stringify({}));
  },

  deletePage: function (req, res) {
    console.log(req.body);

    rimraf.sync(req.body.path);

    Lifebook.tree(req, res);
  },

  copyPage: function(req, res) {
    console.log(req.body);

    fsExtra.copySync(req.body.src, req.body.dst + path.sep + req.body.title);

    Lifebook.tree(req, res);
  },

  movePage: function(req, res) {
    console.log(req.body);

    fsExtra.moveSync(req.body.src, req.body.dst + path.sep + req.body.title);

    Lifebook.tree(req, res);
  },

  createPage: function (req, res) {
    console.log(req.body);

    Lifebook._create(req.body.title, req.body.path, res);

    Lifebook.tree(req, res);
  },

  _create: function (title, path, res) {
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

  tree: function (req, res) {
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
            // var metaInfo = JSON.parse(fs.readFileSync(dirFile));
            // item.title = metaInfo.title;
            // item.id = metaInfo.id;
            // item.type = "page";

            item.title = path
              .dirname(dirFile)
              .split(path.sep)
              .pop();
            item.type = "page";
            //item.id = 0;
          }
        }
      }
      return children;
    };

    var directoryStructure = walkSync("./wiki");

    directoryStructure = directoryStructure.map(function (item) {
      item.type = "lifebook";
      return item;
    });

    buildResult(res, JSON.stringify({ items: directoryStructure }));
  },

  deleteFile: function (req, res) {
    console.log(req.body);

    rimraf.sync(req.body.path + "/" + req.body.name);

    Lifebook.loadPage(req, res);
  }

};

module.exports = Lifebook;
