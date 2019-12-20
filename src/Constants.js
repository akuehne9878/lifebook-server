var path = require("path");

var Constants = {
  NAME: "lifebook",
  PATH: path.join("D:", "dev", "lifebook-data"),
  PAGES: "pages",
  DB: "db"
};
Constants.LIFEBOOK_PATH = path.join(Constants.PATH, Constants.NAME, Constants.PAGES);

Constants.LIFEBOOK_DB_PATH = path.join(Constants.PATH, Constants.NAME, Constants.DB);

module.exports = Constants;
