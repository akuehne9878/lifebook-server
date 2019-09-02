var path = require("path");

var Constants = {
  NAME: "wiki",
  PATH: path.join("D:", "dev", "lifebook-data")
};
Constants.LIFEBOOK_PATH = path.join(Constants.PATH, Constants.NAME);

module.exports = Constants;
