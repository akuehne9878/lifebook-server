var fs = require("fs");
var path = require("path");

function handleResult(rows, res) {
  console.log(rows);
  res.setHeader("Content-Type", "application/json");
  res.send(rows);
}

function buildResult(res, data, mime) {
  if (!mime) {
    mime = "text/*";
  }

  res.writeHead(200, { "Content-Type": mime });
  res.write(data);
  res.end();
}

var Page = {
  create: function(req, res) {
    console.log(req.query);

    var dir = "./wiki";

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    var title = req.query.title;
    var parent = req.query.parent;

    /* var dir = "./tmp";
  
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  
    fs.writeFile("mynewfile3.txt", "Hello content!", function(err) {
      if (err) throw err;
      console.log("Saved!");
    });
  
    */

    res.send("file Created");
  }
};

module.exports = Page;
