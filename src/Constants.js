var path = require("path");

var Constants = {
  NAME: "lifebook",
  PATH: path.join("/home", "pi", "lifebook-data"),
  CACHE:  "cache",
  PAGES: "pages",
  DB: "db"
};
Constants.LIFEBOOK_PATH = path.join(Constants.PATH, Constants.NAME, Constants.PAGES);

Constants.LIFEBOOK_DB_PATH = path.join(Constants.PATH, Constants.NAME, Constants.DB);

Constants.LIFEBOOK_CACHE_PATH = path.join(Constants.PATH, Constants.NAME, Constants.CACHE);

module.exports = Constants;
