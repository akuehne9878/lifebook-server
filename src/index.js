const express = require("express");
const Lifebook = require("./api/Lifebook");
const fileUpload = require("express-fileupload");

var fs = require("fs");

var path = require("path");

var app = express();

app.use(express.json());

// default options
app.use(fileUpload());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
  next();
});

function sendFile(fileName, res) {
  if (fs.existsSync(fileName)) {
    res.sendFile(fileName, function(err) {
      if (err) throw err;
      console.log("File sent:", fileName);
    });
  } else {
    res.status(404).send("Not found");
    console.log("Not found:", fileName);
  }
}
// UI5 bootstrapping
app.get("/", function(req, res) {
  sendFile(path.join(__dirname, "ui5/index.html"), res);
});

app.get("/ui5/*", function(req, res) {
  sendFile(path.join(__dirname, req.path), res);
});

app.get("/wiki/*", function(req, res) {
  sendFile(path.join(__dirname, "../", decodeURIComponent(req.path)), res);
});


app.get("/api/tree", Lifebook.tree);

app.post("/api/createPage", Lifebook.createPage);

app.post("/api/loadPage", Lifebook.loadPage);

app.post("/api/savePage", Lifebook.savePage);

app.post("/api/deletePage", Lifebook.deletePage);

app.post("/api/renamePage", Lifebook.renamePage);

app.post("/api/copyPage", Lifebook.copyPage);

app.post("/api/movePage", Lifebook.movePage);

app.post("/api/deleteFile", Lifebook.deleteFile);

app.post("*/upload", function(req, res) {
  //console.log(decodeURIComponent(req.path));
  //console.log(req.files); // the uploaded file object

  var path = decodeURIComponent(req.path)
    .replace("upload", "")
    .substring(1);

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let uploadFile = req.files.uploadFile;

  // Use the mv() method to place the file somewhere on your server
  uploadFile.mv(path + req.files.uploadFile.name, function(err) {
    if (err) return res.status(500).send(err);

    res.status(200).send("200");
  });
});

const port = 8080;
app.listen(port, () => {
  console.log("Example app listening on port 8080");
});
