const sqlite3 = require('sqlite3').verbose();
var sqliteParser = require('sqlite-parser');
var path = require("path");
const Constants = require("../Constants");

var ORM = {


    listTables: function () {
        var p = new Promise(function (resolve, reject) {
            var sql = "SELECT name FROM sqlite_master WHERE type='table'"
            ORM._run(sql).then(function (items) {
                resolve({ tables: items })
            })
        });
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
                    resolve({ error: "" + err });
                } else {
                    if (sql.toUpperCase().indexOf("INSERT") === 0 || sql.toUpperCase().indexOf("UPDATE") === 0 || sql.toUpperCase().indexOf("DELETE") === 0) {
                        stmt.run(values, function (err) {
                            resolve(err);
                        });
                    } else {
                        stmt.all(values, function (err, rows) {
                            console.log(rows);
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

    createEntity: function (entity) {
        var p = new Promise(function (resolve, reject) {
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

            ORM._run(sql, values).then(function () {
                return ORM._run("select seq from sqlite_sequence where name = ?", [entity.name]);
            }).then(function (data) {
                resolve(data);
            })

        });
        return p;
    },

    readEntity: function (entity) {
        var p = new Promise(function (resolve, reject) {

            var keyNames = [];
            var keyValues = [];
            entity.id.forEach(function (id) {
                entity.properties.forEach(function (item) {
                    if (item.name === id) {
                        keyNames.push(item.name);
                        keyValues.push(item.value);
                    }
                });
            })

            var primaryKeyStr = keyNames.map(function (name) {
                return "AND " + name + " = ?";
            }).join(" ");

            var sql = "SELECT * FROM " + entity.name + " WHERE 1=1 " + primaryKeyStr;

            ORM._run(sql, keyValues).then(function (items) {
                resolve(items[0]);
            });

        });
        return p;
    },


    searchEntity: function (entity) {
        var p = new Promise(function (resolve, reject) {

            var cols = entity.properties.map(function (item) {
                return "AND " + item.name + " = ?";
            }).join(" ");

            var sql = "SELECT * FROM " + entity.name + " WHERE 1=1 " + cols;

            var values = entity.properties.map(function (item) {
                return item.value;
            })

            ORM._run(sql, values).then(function (items) {
                resolve(items);
            });
        });
        return p;
    },

    updateEntity: function (entity) {

        var p = new Promise(function (resolve, reject) {


            var props2Update = entity.properties.filter(function (prop) {
                return (prop.value !== null && prop.value !== undefined)
            })

            var cols = props2Update.map(function (item) {
                return item.name + " = ?";
            }).join(", ");

            var values = props2Update.map(function (item) {
                return item.value;
            })

            var keyNames = [];
            var keyValues = [];
            var keyProperties = [];
            entity.id.forEach(function (id) {
                entity.properties.forEach(function (item) {
                if (item.name === id) {
                        keyNames.push(item.name);
                        keyValues.push(item.value);
                        keyProperties.push(item);
                    }
                });
            })


            var primaryKeyStr = keyNames.map(function (name) {
                return "AND " + name + " = ?";
            }).join(" ");



            var sql = "UPDATE " + entity.name + " SET " + cols + " WHERE 1=1 " + primaryKeyStr;
            ORM._run(sql, values.concat(keyValues)).then(function () {
                return ORM.readEntity(
                    {
                        name: entity.name,
                        id: entity.id,
                        properties: keyProperties
                    });
            }).then(function (data) {
                resolve(data);
            })

        });
        return p;

    },

    deleteEntity: function (entity) {
        var p = new Promise(function (resolve, reject) {

            var keyNames = [];
            var keyValues = [];
            entity.id.forEach(function (id) {
                entity.properties.forEach(function (item) {
                    if (item.name === id) {
                        keyNames.push(item.name);
                        keyValues.push(item.value);
                    }
                });
            })

            var primaryKeyStr = keyNames.map(function (name) {
                return "AND " + name + " = ?";
            }).join(" ");



            var sql = "DELETE FROM " + entity.name + " WHERE 1=1 " + primaryKeyStr;
            ORM._run(sql, keyValues).then(function () {
                resolve({});
            })
        });
        return p;
    },


};

module.exports = ORM;