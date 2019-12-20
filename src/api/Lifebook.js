var fs = require("fs");
var fsExtra = require("fs-extra");
var path = require("path");
var rimraf = require("rimraf");
var sharp = require('sharp');
var dateFormat = require('dateformat');
const Constants = require("../Constants");
const sqlite3 = require('sqlite3').verbose();
var sqliteParser = require('sqlite-parser');

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

          obj.file = "/api/file/" + req.body.path + "/" + dirent.name;

          if (dirent.name.toUpperCase().endsWith("JPG")) {
            promises.push(new Promise(function (resolve, reject) {
              obj.thumbnail = encodeURI("/api/thumbnail?path=" + req.body.path + "&name=" + dirent.name);

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


    if (promises.length > 0) {
      Promise.all(promises).then(function () {
        var title = fullPath.split(path.sep).pop();
        buildResult(res, JSON.stringify({ content: content, title: title, path: fullPath.replace(LIFEBOOK_PATH + path.sep, ""), files: files, children: children, metainfo: metainfo }));
      });
    } else {
      var title = fullPath.split(path.sep).pop();
      buildResult(res, JSON.stringify({ content: content, title: title, path: fullPath.replace(LIFEBOOK_PATH + path.sep, ""), files: files, children: children, metainfo: metainfo }));

    }

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
    console.log(req.body);

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

    sharp(absolutePath)
      .rotate()
      .resize({ height: 300, width: 300 })
      .pipe(res);

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
    console.log(req.body);

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
    console.log(req.body);


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
    console.log(req.body);

    req.body.fileNames.forEach(function (fileName) {
      var src = path.join(LIFEBOOK_PATH, req.body.src, fileName);
      var dst = path.join(LIFEBOOK_PATH, req.body.dst, fileName);
      fsExtra.moveSync(src, dst);
    })

    Lifebook.tree(req, res);
  },

  loadMetainfo: function (req, res) {
    console.log(req.body.path);

    var metainfo = fs.readFileSync(path.join(LIFEBOOK_PATH, req.body.path, "metainfo.json"), "utf8");

    buildResult(res, JSON.stringify({ content: metainfo }));
  },


  saveMetainfo: function (req, res) {
    console.log(req.body.path);

    var fullIndexPath = path.join(LIFEBOOK_PATH, req.body.path, "metainfo.json");
    fs.writeFileSync(fullIndexPath, req.body.content);

    buildResult(res, JSON.stringify({}));
  },


  executeStatement: function (req, res) {
    var statement = req.body.statement;

    var sql = statement;

    if (sql === undefined || sql === "") {
      buildResult(res, JSON.stringify({}));
    } else {
      Lifebook._run(sql).then(function (items) {
        if (items) {
          buildResult(res, JSON.stringify(items));
        } else {
          buildResult(res, JSON.stringify({}));
        }
      })
    }

  },

  listTables: function (req, res) {
    var sql = "SELECT name FROM sqlite_master WHERE type='table'"
    Lifebook._run(sql).then(function (items) {
      buildResult(res, JSON.stringify({ tables: items }));
    })
  },


  _getTableStructure: function (table) {
    var p = new Promise(function (resolve, reject) {
      var sql = "SELECT sql FROM sqlite_master WHERE  name = ?";
      var values = [table];
      Lifebook._run(sql, values).then(function (items) {
        resolve(sqliteParser(items[0].sql))
      })
    })
    return p;
  },


  _run: function (sql, values) {

    var p = new Promise(function (resolve, reject) {
      console.log("EXECUTE STATEMENT:");
      console.log("\t" + sql);
      console.log("\t" + values);

      let db = new sqlite3.Database(path.join(Constants.LIFEBOOK_DB_PATH, "lifebook.db"));
      var stmt;
      db.on("error", function (error) {
        console.log("Getting an error : ", error);
        stmt.finalize();
        db.close();
      });


      stmt = db.prepare(sql, function (err) {
        if (err) {
          console.log("PREPARE ERR: " + err)
          resolve({error: ""+ err});
        } else {
          if (sql.toUpperCase().indexOf("INSERT") === 0 || sql.toUpperCase().indexOf("UPDATE") === 0 || sql.toUpperCase().indexOf("DELETE") === 0) {
            stmt.run(values, function (err) {
              resolve(err);
            });
          } else {
            stmt.all(values, function (err, rows) {
              console.log(err);
              resolve(rows);
            })
          }
        }
        stmt.finalize();
        db.close()
      });

    });

    return p;

  },

  createEntity: function (req, res) {
    var entity = req.body.entity;



    var properties = entity.properties.map(function (item) {
      return item.name;
    }).join(", ");

    var values = entity.properties.map(function (item) {
      return item.value;
    })

    var placeholders = entity.properties.map(function (item) {
      return "?";
    }).join(", ");


    var sql = "INSERT INTO " + entity.name + " (" + properties + ") values (" + placeholders + ")";

    Lifebook._run(sql, values).then(function () {
      buildResult(res, JSON.stringify({}));
    })

  },


  _handlePrimaryKey: function (ast) {

    var constraints = ast.statement[0].definition.filter(function (a) {
      return a.variant === "constraint";
    })

    var pk = null;
    constraints.forEach(function (a) {
      if (a.definition[0].variant === "primary key") {
        pk = a.columns;
      }
    })

    if (!pk) {
      pk = ast.statement[0].definition.filter(function (item) {
        return (item.definition.length > 0 && item.definition[0].variant === "primary key");
      });
    }

    return pk
  },

  _handleForeignKey: function (ast) {

    var constraints = ast.statement[0].definition.filter(function (a) {
      return a.variant === "constraint";
    })

    console.log(JSON.stringify(ast));

    var pk = null;
    constraints.forEach(function (a) {
      if (a.definition[0].variant === "foreign key") {
        pk = a.columns;
      }
    })

    // if (!pk) {
    //   pk = ast.statement[0].definition.filter(function(item){
    //     return (item.definition.length > 0 && item.definition[0].variant === "foreign key");
    //   });
    // }

    return pk
  },

  _handleColumns: function (ast) {
    var columns = ast.statement[0].definition.filter(function (a) {
      return a.variant === "column";
    })

    var cols = columns.map(function (item) {
      return item.name;
    }).join(", ");

    console.log("QQQQ: " + cols);

    return cols;
  },

  _map: function (item, ast) {

    var name = ast.statement[0].name.name;
    var pk = Lifebook._handlePrimaryKey(ast);

    var columns = ast.statement[0].definition.filter(function (a) {
      return a.variant === "column";
    })

    var id = null;
    var properties = columns.map(function (a) {
      if (a.name === pk[0].name) {
        id = item[a.name];
      }
      return {
        name: a.name,
        value: item[a.name],
        type: a.datatype.variant,
        affinity: a.datatype.affinity,
        isPrimaryKey: a.name === pk[0].name
      }
    });

    var entity = {
      name: name,
      id: id,
      properties: properties
    }
    return entity;
  },

  readEntity: function (req, res) {

    var entity = req.body.entity;

    Lifebook._getTableStructure(entity.name).then(function (ast) {

      var pk = Lifebook._handlePrimaryKey(ast);
      var fk = Lifebook._handleForeignKey(ast);

      console.log("FK: " + JSON.stringify(fk));

      var cols = Lifebook._handleColumns(ast);

      var sql = "SELECT " + cols + " FROM " + entity.name + " WHERE " + pk[0].name + " = ?";
      var values = [entity.id];

      Lifebook._run(sql, values).then(function (items) {

        if (items.length === 0) {
          buildResult(res, JSON.stringify(Lifebook._map({}, ast)));
        } else {
          var list = items.map(function (item) {
            return Lifebook._map(item, ast);
          });
          buildResult(res, JSON.stringify(list[0]));
        }

      });

    })

  },

  updateEntity: function (req, res) {
    var entity = req.body.entity;
    Lifebook._getTableStructure(entity.name).then(function (ast) {
      var pk = Lifebook._handlePrimaryKey(ast);

      var props2Update = entity.properties.filter(function (prop) {
        return (prop.isPrimaryKey === false && prop.value !== null && prop.value !== undefined)
      })

      var cols = props2Update.map(function (item) {
        return item.name + " = ?";
      }).join(", ");

      var values = props2Update.map(function (item) {
        return item.value;
      })

      values.push(entity.id);


      var sql = "UPDATE " + entity.name + " SET " + cols + " WHERE " + pk[0].name + " = ?"
      Lifebook._run(sql, values).then(function () {
        buildResult(res, JSON.stringify({}));
      });
    });

  },

  deleteEntity: function (req, res) {
    var entity = req.body.entity;
    Lifebook._getTableStructure(entity.name).then(function (ast) {
      var pk = Lifebook._handlePrimaryKey(ast);

      var sql = "DELETE FROM " + entity.name + " WHERE " + pk[0].name + " = ?";
      var values = [entity.id]
      Lifebook._run(sql, values).then(function () {
        buildResult(res, JSON.stringify({}));
      })
    })
  },


};

module.exports = Lifebook;
