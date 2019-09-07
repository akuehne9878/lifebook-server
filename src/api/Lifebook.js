var fs = require("fs");
var fsExtra = require("fs-extra");
var path = require("path");
var rimraf = require("rimraf");
var sharp = require('sharp');
var dateFormat = require('dateformat');
const Constants = require("../Constants");

function buildResult(res, data) {
  console.log(data);

  res.writeHead(200, { "Content-Type": "application/json" });
  res.write(data);
  res.end();
}


var NAME = Constants.NAME;
var PATH = Constants.PATH;
var LIFEBOOK_PATH = Constants.LIFEBOOK_PATH;

var Lifebook = {
  /**
   * loadPage
   * @param {*} req 
   * @param {*} res 
   */
  loadPage: function (req, res) {
    console.log(req.body);

    var fullIndexPath = path.join(LIFEBOOK_PATH, req.body.path, "index.md");

    var fullPath = path.join(LIFEBOOK_PATH, req.body.path);

    var content = "";
    if (fs.existsSync(fullIndexPath)) {
      content = fs.readFileSync(fullIndexPath) + "";
    }

    var files = [];

    fs.readdirSync(fullPath, { withFileTypes: true }).forEach(function (dirent) {
      if (dirent.isFile()) {
        if (dirent.name !== "metainfo.json" && dirent.name !== "index.md") {
          const stats = fs.statSync(fullPath + path.sep + dirent.name);



          var day = dateFormat(stats.birthtime, "dd.mm.yyyy HH:MM");

          var obj = { name: dirent.name, date: day }

          obj.type = dirent.name.split(".").pop().toUpperCase();

          if (dirent.name.toUpperCase().endsWith("JPG")) {
            obj.thumbnail = encodeURI("/api/resize?path=" + req.body.path + "&name=" + dirent.name + "&size=240");
            obj.original = encodeURI("/api/resize?path=" + req.body.path + "&name=" + dirent.name);
          }


          files.push(obj);
        }
      }
    });

    //var fullMetaPath = path.join(fullPath,"metainfo.json");
    // var metaInfo = JSON.parse(fs.readFileSync(fullMetaPath));



    var title = fullPath.split(path.sep).pop();
    buildResult(res, JSON.stringify({ content: content, title: title, path: fullPath.replace(LIFEBOOK_PATH + path.sep, ""), files: files }));
  },

  /**
   * savePage
   * @param {*} req 
   * @param {*} res 
   */
  savePage: function (req, res) {
    console.log(req.body);

    var fullIndexPath = path.join(LIFEBOOK_PATH, req.body.path, "index.md");
    fs.writeFileSync(fullIndexPath, req.body.content);

    var fullMetaPath = path.join(LIFEBOOK_PATH, req.body.path, "metainfo.json");
    fs.writeFileSync(fullMetaPath, JSON.stringify({ title: req.body.title }));

    buildResult(res, JSON.stringify({}));
  },

  /**
   * renamePage
   * @param {*} req 
   * @param {*} res 
   */
  renamePage: function (req, res) {
    console.log(req.body);

    var fullPath = path.join(LIFEBOOK_PATH, req.body.path);

    var oldName = fullPath.split(path.sep).pop()
    var newPath = fullPath.replace(oldName, req.body.newTitle);


    fsExtra.moveSync(fullPath, newPath);

    buildResult(res, JSON.stringify({}));
  },

  /**
   * deletePage
   * @param {*} req 
   * @param {*} res 
   */
  deletePage: function (req, res) {
    console.log(req.body);

    var absolutePath = path.join(LIFEBOOK_PATH, req.body.path);

    rimraf.sync(absolutePath);

    Lifebook.tree(req, res);
  },

  /**
   * copyPage
   * @param {*} req 
   * @param {*} res 
   */
  copyPage: function (req, res) {
    console.log(req.body);

    var src = path.join(LIFEBOOK_PATH, req.body.src);
    var dst = path.join(LIFEBOOK_PATH, req.body.dst, req.body.title);

    fsExtra.copySync(src, dst);

    Lifebook.tree(req, res);
  },

  /**
   * movePage
   * @param {*} req 
   * @param {*} res 
   */
  movePage: function (req, res) {
    console.log(req.body);

    var src = path.join(LIFEBOOK_PATH, req.body.src);
    var dst = path.join(LIFEBOOK_PATH, req.body.dst, req.body.title);

    fsExtra.moveSync(src, dst);

    Lifebook.tree(req, res);
  },

  /**
   * createPage
   * @param {*} req 
   * @param {*} res 
   */
  createPage: function (req, res) {
    console.log(req.body);

    var absolutePath = path.join(LIFEBOOK_PATH, req.body.path);

    Lifebook._create(req.body.title, absolutePath, res);

    Lifebook.tree(req, res);
  },

  _create: function (title, sPath, res) {
    var fullPath = path.join(sPath, title);
    if (fs.existsSync(fullPath)) {
      res.status(500);
    }

    fs.mkdirSync(fullPath);

    var metainfo = {
      title: title,
      id: 0
    };

    fs.writeFileSync(path.join(fullPath, "metainfo.json"), JSON.stringify(metainfo));
  },

  tree: function (req, res) {
    const walkSync = (dir, item) => {
      const files = fs.readdirSync(dir);
      var children = [];
      for (const file of files) {
        const sPath = path.join(dir, file);
        const dirent = fs.statSync(sPath);



        if (dirent.isDirectory()) {
          var child = {
            path: sPath.replace(LIFEBOOK_PATH + path.sep, "")
          };

          child.items = walkSync(sPath, child);

          children.push(child);
        } else {
          if (sPath.endsWith("metainfo.json") && item != null) {
            // var metaInfo = JSON.parse(fs.readFileSync(dirFile));
            // item.title = metaInfo.title;
            // item.id = metaInfo.id;
            // item.type = "page";

            item.title = path
              .dirname(sPath)
              .split(path.sep)
              .pop();
            item.type = "page";
            //item.id = 0;
          }
        }
      }
      return children;
    };

    var directoryStructure = walkSync(LIFEBOOK_PATH);

    directoryStructure = directoryStructure.map(function (item) {
      item.type = "lifebook";
      return item;
    });

    buildResult(res, JSON.stringify({ items: directoryStructure, name: NAME }));
  },

  deleteFile: function (req, res) {
    console.log(req.body);

    var absolutePath = path.join(LIFEBOOK_PATH, req.body.path, req.body.name);

    rimraf.sync(absolutePath);

    Lifebook.loadPage(req, res);
  },

  resizeImage: function (req, res) {

    var absolutePath = path.join(LIFEBOOK_PATH, req.query.path, req.query.name);

    if (req.query.size) {
      sharp(absolutePath).resize(parseInt(req.query.size, 10)).pipe(res);
    } else{
      sharp(absolutePath).pipe(res);
    }

  },

  uploadFile: function (req, res) {

    var sPath = decodeURIComponent(req.path).replace("upload", "").substring(1);

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let uploadFile = req.files.uploadFile;

    var absolutePath = path.join(LIFEBOOK_PATH, sPath, req.files.uploadFile.name)

    var absolutePathThumb = path.join(LIFEBOOK_PATH, sPath, "thumb_" + req.files.uploadFile.name);


    // Use the mv() method to place the file somewhere on your server
    uploadFile.mv(absolutePath, function (err) {


      if (err) return res.status(500).send(err);

      res.status(200).send("200");
    });
  },

  downloadFile: function (req, res) {
    console.log(req.query);
    var fullPath = path.join(LIFEBOOK_PATH, req.query.path, req.query.name);
    res.download(fullPath);
  },

  renameFile: function (req, res) {
    console.log(req.body);

    var fullPath = path.join(LIFEBOOK_PATH, req.body.path);

    var oldName = fullPath.split(path.sep).pop()
    var newPath = fullPath.replace(oldName, req.body.newTitle);


    fsExtra.moveSync(fullPath, newPath);

    buildResult(res, JSON.stringify({}));
  },



};

module.exports = Lifebook;
