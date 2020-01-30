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


    _getTableStructure: function (table) {
        var p = new Promise(function (resolve, reject) {
            var sql = "SELECT sql FROM sqlite_master WHERE  name = ?";
            var values = [table];
            ORM._run(sql, values).then(function (items) {
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
                return ORM.readEntity({ name: entity.name, id: data[0].seq });
            }).then(function (data) {
                resolve(data);
            })

        });
        return p;
    },

    readEntity: function (entity) {
        var p = new Promise(function (resolve, reject) {
            ORM._getTableStructure(entity.name).then(function (ast) {

                var pk = ORM._handlePrimaryKey(ast);

                console.log("PK: " + JSON.stringify(pk));

                var cols = ORM._handleColumns(ast);

                var sql = "SELECT " + cols + " FROM " + entity.name + " WHERE " + pk[0].name + " = ?";
                var values = [entity.id];

                ORM._run(sql, values).then(function (items) {

                    // if (items.length === 0) {
                    //     resolve(ORM._map({}, ast));
                    // } else {
                    //     var list = items.map(function (item) {
                    //         return ORM._map(item, ast);
                    //     });
                        resolve(items[0]);
                    // }

                });

            });
        });
        return p;
    },

    updateEntity: function (entity) {

        var p = new Promise(function (resolve, reject) {

            ORM._getTableStructure(entity.name).then(function (ast) {
                var pk = ORM._handlePrimaryKey(ast);

                var props2Update = entity.properties.filter(function (prop) {
                    return (prop.value !== null && prop.value !== undefined)
                })


                console.log("QQQ: " + JSON.stringify(entity.properties));

                var cols = props2Update.map(function (item) {
                    return item.name + " = ?";
                }).join(", ");

                var values = props2Update.map(function (item) {
                    return item.value;
                })

                values.push(entity.id);


                var sql = "UPDATE " + entity.name + " SET " + cols + " WHERE " + pk[0].name + " = ?"
                ORM._run(sql, values).then(function () {
                    return ORM.readEntity({ name: entity.name, id: entity.id });
                }).then(function (data) {
                    resolve(data);
                })

            });
        });
        return p;

    },

    deleteEntity: function (entity) {
        var p = new Promise(function (resolve, reject) {
            ORM._getTableStructure(entity.name).then(function (ast) {
                var pk = ORM._handlePrimaryKey(ast);

                var sql = "DELETE FROM " + entity.name + " WHERE " + pk[0].name + " = ?";
                var values = [entity.id]
                ORM._run(sql, values).then(function () {
                    resolve({});
                })
            });
        });
        return p;
    },

    duplicateEntity: function(entity) {
        var p = new Promise(function (resolve, reject) {
            ORM._getTableStructure(entity.name).then(function (ast) {
                var pk = ORM._handlePrimaryKey(ast);

                var sql = "DELETE FROM " + entity.name + " WHERE " + pk[0].name + " = ?";
                var values = [entity.id]
                ORM._run(sql, values).then(function () {
                    resolve({});
                })
            });
        });
        return p;
    },


    _handlePrimaryKey: function (ast) {

        var columns = ast.statement[0].definition.filter(function (a) {
            return a.variant === "column";
        })

        console.log(JSON.stringify(ast.statement[0].definition));

        var pk = [];
        columns.forEach(function (column) {
            column.definition.forEach(function(definition){
                if (definition.variant === "primary key") {
                    pk.push(column);
                };
            })
        })

        return pk
    },

    _handleColumns: function (ast) {
        var columns = ast.statement[0].definition.filter(function (a) {
            return a.variant === "column";
        })

        var cols = columns.map(function (item) {
            return item.name;
        }).join(", ");

        return cols;
    },

    _map: function (item, ast) {

        var name = ast.statement[0].name.name;
        var pk = ORM._handlePrimaryKey(ast);

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



};

module.exports = ORM;