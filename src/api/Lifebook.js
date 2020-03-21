var fs = require("fs");
var fsExtra = require("fs-extra");
var path = require("path");
var rimraf = require("rimraf");
var sharp = require('sharp');
var dateFormat = require('dateformat');
const Constants = require("../Constants");
var hash = require('object-hash');

const ORM = require("./ORM");


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

  log: function (req) {
    	
	console.log("--------------------------------------------------------------------");
    console.log("PATH: \t" + req.path);
    console.log("BODY: \t" + JSON.stringify(req.body));
    console.log("---");
	
	
  },


  /**
   * loadPage
   * @param {*} req 
   * @param {*} res 
   */
  loadPage: function (req, res) {

    Lifebook.log(req);



    req.body.path = req.body.path.split("\\").join("/");


    var fullIndexPath = path.join(LIFEBOOK_PATH, req.body.path, "index.md");
    var fullPath = path.join(LIFEBOOK_PATH, req.body.path);

    var content = "";
    if (fs.existsSync(fullIndexPath)) {
      content = fs.readFileSync(fullIndexPath) + "";
    }

    var files = [];

    var promises = [];

    var children = [];

    var metainfo = JSON.parse(fs.readFileSync(path.join(LIFEBOOK_PATH, req.body.path, "metainfo.json"), "utf8"));

    fs.readdirSync(fullPath, { withFileTypes: true }).forEach(function (dirent) {

      var obj = {};

      if (dirent.isFile()) {

        if (dirent.name !== "metainfo.json" && dirent.name !== "index.md") {
          const stats = fs.statSync(fullPath + path.sep + dirent.name);

          var day = dateFormat(stats.birthtime, "dd.mm.yyyy HH:MM");

          obj.name = dirent.name;
          obj.date = dirent.day;
          obj.size = stats.size;

          obj.type = dirent.name.split(".").pop().toUpperCase();

          obj.file = "http://lifebook:9080/api/file/" + req.body.path + "/" + dirent.name;

          if (dirent.name.toUpperCase().endsWith("JPG")) {
            promises.push(new Promise(function (resolve, reject) {
              obj.thumbnail = encodeURI("http://lifebook:9080/api/thumbnail?path=" + req.body.path + "&name=" + dirent.name);

              var absolutePath = path.join(LIFEBOOK_PATH, req.body.path, dirent.name);

              var s = sharp(absolutePath);
              s.metadata(function (err, info) {
                obj.height = info.height;
                obj.width = info.width;

                resolve();
              })
            }));
          }


          files.push(obj);
        }
      } else {
        children.push({ name: dirent.name });
      }
    });

    var p = new Promise(function (resolve, reject) {
      resolve();
    })

    if (promises.length > 0) {
      p = Promise.all(promises);
    }

    p.then(function () {
      var title = fullPath.split(path.sep).pop();
      var obj = { content: content, title: title, path: fullPath.replace(LIFEBOOK_PATH + path.sep, ""), files: files, children: children, metainfo: metainfo };

      ORM._run("Select * FROM page where page_id = ?", [metainfo.pageid]).then(function (data) {
        var page = data[0];
        obj.type = page.type;

        if (page.linked_entity) {

          var sql = "SELECT * FROM " + page.linked_entity + " WHERE page_id = ?";
          var values = [metainfo.pageid];

          ORM._run(sql, values).then(function (items) {
            if (items && items.length !== 0) {

              var foo = {};
              foo[page.linked_entity] = items[0]

              obj.linked_entity = foo;
            }
            buildResult(res, JSON.stringify(obj));
          })

        } else {
          buildResult(res, JSON.stringify(obj));
        }
      });


    });



  },

  /**
   * savePage
   * @param {*} req 
   * @param {*} res 
   */
  savePage: function (req, res) {
    Lifebook.log(req);

    var fullIndexPath = path.join(LIFEBOOK_PATH, req.body.path, "index.md");
    fs.writeFileSync(fullIndexPath, req.body.content);

    buildResult(res, JSON.stringify({}));
  },

  /**
   * renamePage
   * @param {*} req 
   * @param {*} res 
   */
  renamePage: function (req, res) {
    Lifebook.log(req);

    var fullPath = path.join(LIFEBOOK_PATH, req.body.path);

    var oldName = fullPath.split(path.sep).pop()
    var newPath = fullPath.replace(oldName, req.body.newTitle);

    var metainfo = JSON.parse(fs.readFileSync(path.join(fullPath, "metainfo.json"), "utf8"));

    ORM.updateEntity(
      {
        name: "page",
        id: ["page_id"],
        properties: [
          { name: "page_id", value: metainfo.pageid },
          { name: "title", value: req.body.newTitle }
        ]
      }).then(function (entity) {
        fsExtra.moveSync(fullPath, newPath);
        buildResult(res, JSON.stringify(entity));
      })


  },

  /**
   * deletePage
   * @param {*} req 
   * @param {*} res 
   */
  deletePage: function (req, res) {
    Lifebook.log(req);

    var absolutePath = path.join(LIFEBOOK_PATH, req.body.path);

    var metainfo = JSON.parse(fs.readFileSync(path.join(absolutePath, "metainfo.json"), "utf8"));

    ORM.deleteEntity(
      {
        name: "invoice",
        id: ["page_id"],
        properties: [
          { name: "page_id", value: metainfo.pageid },
        ]
      }
    ).then(function (data) {
      return {
        name: "page",
        id: ["page_id"],
        properties: [
          { name: "page_id", value: metainfo.pageid },
        ]
      }
    }).then(function (data) {
      rimraf.sync(absolutePath);
      Lifebook.tree(req, res);

    });

  },

  /**
   * copyPage
   * @param {*} req 
   * @param {*} res 
   */
  copyPage: function (req, res) {
    Lifebook.log(req);

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
    Lifebook.log(req);

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
    Lifebook.log(req);

    var absolutePath = path.join(LIFEBOOK_PATH, req.body.path);

    Lifebook._create(req.body.title, absolutePath, req.body.type, res).then(function (data) {
      buildResult(res, JSON.stringify(data));
    });

  },

  _create: function (title, sPath, type, res) {
    var fullPath = path.join(sPath, title);
    if (fs.existsSync(fullPath)) {
      res.status(500);
    }

    fs.mkdirSync(fullPath);

    var p = new Promise(function (resolve, reject) {

      ORM.createEntity({
        name: "page",
        properties: [
          { name: "title", value: title },
          { name: "type", value: type }]
      }).then(function (data) {

        var readEntity = {
          name: "page",
          id: ["page_id"],
          properties: [
            { name: "page_id", value: data[0].seq }
          ]
        };
        ORM.readEntity(readEntity).then(function (page) {

          console.log("RRRR: " + JSON.stringify(page));

          var metainfo = {
            pageid: page.page_id
          };

          fs.writeFileSync(path.join(fullPath, "metainfo.json"), JSON.stringify(metainfo));
          resolve(page);

        });

      })
    });


    return p;

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

            item.title = path
              .dirname(sPath)
              .split(path.sep)
              .pop();
            item.type = "page";
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



  metaInfoTree: function (req, res) {

    var arr = [];
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
            // item.metaInfo = );
            arr.push(JSON.parse(fs.readFileSync(sPath)));
          }
        }
      }
      return children;
    };

    // var directoryStructure = walkSync(LIFEBOOK_PATH);

    buildResult(res, JSON.stringify({ items: arr }));
  },


  deleteFile: function (req, res) {
    Lifebook.log(req);

    req.body.fileNames.forEach(function (fileName) {
      var absolutePath = path.join(LIFEBOOK_PATH, req.body.path, fileName);
      rimraf.sync(absolutePath);
    });

    Lifebook.loadPage(req, res);
  },

  resizeImage: function (req, res) {

    var absolutePath = path.join(LIFEBOOK_PATH, req.query.path, req.query.name);

    if (req.query.height && req.query.width) {
      sharp(absolutePath)
        .rotate()
        .resize({ height: parseInt(req.query.height, 10), width: parseInt(req.query.width, 10) })
        .pipe(res);

    } else if (req.query.percentage) {

      var s = sharp(absolutePath);

      s.metadata(function (err, info) {

        var percentage = parseInt(req.query.percentage, 10);

        s.rotate().resize({ height: parseInt(info.height * (percentage / 100), 10), width: parseInt(info.width * (percentage / 100), 10) })
          .pipe(res);
      })

    } else {
      sharp(absolutePath).pipe(res);
    }

  },


  thumbnail: function (req, res) {


    var absolutePath = path.join(LIFEBOOK_PATH, req.query.path, req.query.name);
	absolutePath = absolutePath.split("\\").join("/") ;
		
	var cachedFilePath = path.join(Constants.LIFEBOOK_CACHE_PATH,  hash(absolutePath) + ".jpg");
	
	try {
	  if (fs.existsSync(cachedFilePath)) {
		 res.sendFile(cachedFilePath);
	  } else {
		sharp(absolutePath)
		  .rotate()
		  .resize({ height: 300, width: 300 })
		  .toFile( cachedFilePath, function(err){
				if(err){
					res.sendStatus(500);
					return;
				}
				res.sendFile(cachedFilePath);
			});
			  
	  }
	} catch(err) {
	  console.error(err)
	}	
	


  },

  uploadFile: function (req, res) {

    var sPath = decodeURIComponent(req.path).replace("upload", "").substring(1);

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    var uploadFile = req.files["uploadFile[]"];

    var files = [];
    if (Array.isArray(uploadFile)) {
      files = uploadFile;
    } else {
      files.push(uploadFile);
    }


    var errMsg = null;
    files.forEach(function (file) {

      var absolutePath = path.join(LIFEBOOK_PATH, sPath, file.name)
      var absolutePathThumb = path.join(LIFEBOOK_PATH, sPath, "thumb_" + file.name);

      // Use the mv() method to place the file somewhere on your server
      file.mv(absolutePath, function (err) {
        if (err) {
          errMsg += err + "\n";
        }
      });
    })

    if (errMsg) {
      res.status(500).send(errMsg);
    } else {
      res.status(200).send("200");

    }

  },


  getFile: function (req, res) {

    var input = decodeURIComponent(req.path);
	

    var fullPath = path.join(LIFEBOOK_PATH, input.replace("/api/file/", ""));

    if (req.query.download) {
      res.download(fullPath);
    } else {
      res.sendFile(fullPath);
    }

  },

  renameFile: function (req, res) {
    Lifebook.log(req);

    var fullPath = path.join(LIFEBOOK_PATH, req.body.path);

    var oldName = fullPath.split(path.sep).pop()
    var newPath = fullPath.replace(oldName, req.body.newTitle);


    fsExtra.moveSync(fullPath, newPath);

    buildResult(res, JSON.stringify({}));
  },


  /**
 * copyFile
 * @param {*} req 
 * @param {*} res 
 */
  copyFile: function (req, res) {
    Lifebook.log(req);


    req.body.fileNames.forEach(function (fileName) {
      var src = path.join(LIFEBOOK_PATH, req.body.src, fileName);
      var dst = path.join(LIFEBOOK_PATH, req.body.dst, fileName);
      fsExtra.copySync(src, dst);
    });



    Lifebook.tree(req, res);
  },

  /**
 * moveFile
 * @param {*} req 
 * @param {*} res 
 */
  moveFile: function (req, res) {
    Lifebook.log(req);

    req.body.fileNames.forEach(function (fileName) {
      var src = path.join(LIFEBOOK_PATH, req.body.src, fileName);
      var dst = path.join(LIFEBOOK_PATH, req.body.dst, fileName);
      fsExtra.moveSync(src, dst);
    })

    Lifebook.tree(req, res);
  },

  loadMetainfo: function (req, res) {
    Lifebook.log(req);

    var metainfo = fs.readFileSync(path.join(LIFEBOOK_PATH, req.body.path, "metainfo.json"), "utf8");

    buildResult(res, JSON.stringify({ content: metainfo }));
  },


  saveMetainfo: function (req, res) {
    Lifebook.log(req);

    var fullIndexPath = path.join(LIFEBOOK_PATH, req.body.path, "metainfo.json");
    fs.writeFileSync(fullIndexPath, req.body.content);

    buildResult(res, JSON.stringify({}));
  },


  createInvoice: function (req, res) {
    Lifebook.log(req);

    var pageid = req.params.pageid;

    var entity = {
      name: "invoice",
      properties: [
        { name: "page_id", value: pageid },
        { name: "name", value: req.body.invoiceName },
        { name: "total", value: req.body.total },
        { name: "payed_by", value: req.body.payedBy },
        { name: "invoice_date", value: req.body.invoiceDate },
        { name: "payment_date", value: req.body.paymentDate },
        { name: "invoice_number", value: req.body.invoiceNumber },
      ]
    }


    ORM.updateEntity({
      name: "page",
      id: ["page_id"],
      properties: [
        { name: "page_id", value: pageid },
        { name: "linked_entity", value: "invoice" },
      ]
    }).then(function () {

      return ORM.createEntity(entity);
    }).then(function (data) {
      buildResult(res, JSON.stringify(data));
    });

  },

  updateInvoice: function (req, res) {
    Lifebook.log(req);

    var pageid = req.params.pageid;

    var entity = {
      name: "invoice",
      id: ["invoice_id"],
      properties: [
        { name: "page_id", value: pageid },
        { name: "invoice_id", value: req.body.invoiceId },
        { name: "name", value: req.body.invoiceName },
        { name: "total", value: req.body.total },
        { name: "payed_by", value: req.body.payedBy },
        { name: "invoice_date", value: req.body.invoiceDate },
        { name: "payment_date", value: req.body.paymentDate },
        { name: "invoice_number", value: req.body.invoiceNumber },
      ]
    }
    ORM.updateEntity(entity).then(function (data) {
      buildResult(res, JSON.stringify(data));
    });
  },


  loadInvoice: function (req, res) {
    Lifebook.log(req);
    var pageid = req.params.pageid;


    var entity = {
      name: "invoice",
      properties: [
        { name: "page_id", value: pageid }
      ]
    }

    ORM.searchEntity(entity).then(function (data) {


      data = data.map(function (item) {
        return {
          pageId: item.page_id,
          invoiceId: item.invoice_id,
          invoiceName: item.name,
          total: item.total,
          payedBy: item.payed_by,
          invoiceDate: item.invoice_date,
          paymentDate: item.payment_date,
          invoiceNumber: item.invoice_number
        }
      })


      buildResult(res, JSON.stringify(data));
    });

  },




  executeStatement: function (req, res) {
    var statement = req.body.statement;
    var params = req.body.params;

    var sql = statement;

    if (sql === undefined || sql === "") {
      buildResult(res, JSON.stringify({}));
    } else {
      ORM._run(sql, params).then(function (data) {
        if (data) {
          buildResult(res, JSON.stringify(data));
        } else {
          buildResult(res, JSON.stringify({}));
        }
      })
    }

  },

  listTables: function (req, res) {
    ORM.listTables().then(function (data) {
      buildResult(res, JSON.stringify(data));

    })
  },

  createEntity: function (req, res) {
    ORM.createEntity(req.body.entity).then(function (data) {
      buildResult(res, JSON.stringify(data));
    })
  },

  readEntity: function (req, res) {
    ORM.readEntity(req.body.entity).then(function (data) {
      buildResult(res, JSON.stringify(data));
    })
  },

  updateEntity: function (req, res) {
    ORM.updateEntity(req.body.entity).then(function (data) {
      buildResult(res, JSON.stringify(data));
    })
  },


  deleteEntity: function (req, res) {
    ORM.deleteEntity(req.body.entity).then(function (data) {
      buildResult(res, JSON.stringify(data));
    })
  },





};

module.exports = Lifebook;
