const express = require("express");
const Lifebook = require("./api/Lifebook");
const fileUpload = require("express-fileupload");
const Constants = require("./Constants");

var fs = require("fs");

var path = require("path");

var app = express();

app.use(express.json());

// default options
app.use(fileUpload());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
  next();
});

function sendFile(fileName, res) {
  if (fs.existsSync(fileName)) {
    res.sendFile(fileName, function (err) {
      if (err) throw err;
      console.log("File sent:", fileName);
    });
  } else {
    res.status(404).send("Not found");
    console.log("Not found:", fileName);
  }
}
// UI5 bootstrapping
app.get("/", function (req, res) {
  sendFile(path.join(__dirname, "ui5/index.html"), res);
});

app.get("/ui5/*", function (req, res) {
  sendFile(path.join(__dirname, req.path), res);
});

app.get("/" + Constants.NAME + "/*", function (req, res) {
  sendFile(path.join(Constants.PATH, decodeURIComponent(req.path)), res);
});


app.get("/api/tree", Lifebook.tree);

/* Page */

app.post("/api/createPage", Lifebook.createPage);

app.post("/api/loadPage", Lifebook.loadPage);

app.post("/api/savePage", Lifebook.savePage);

app.post("/api/deletePage", Lifebook.deletePage);

app.post("/api/renamePage", Lifebook.renamePage);

app.post("/api/copyPage", Lifebook.copyPage);

app.post("/api/movePage", Lifebook.movePage);


/* File */


app.post("/api/deleteFile", Lifebook.deleteFile);

app.post("/api/renameFile", Lifebook.renameFile);

app.post("/api/copyFile", Lifebook.copyFile);

app.post("/api/moveFile", Lifebook.moveFile);

app.post("*/upload", Lifebook.uploadFile);

app.get("/api/file/*",  Lifebook.getFile);

/* MISC */ 

app.get("/api/resize", Lifebook.resizeImage);

app.get("/api/thumbnail", Lifebook.thumbnail);


const port = 8080;
app.listen(port, () => {
  console.log("Example app listening on port 8080");
});
