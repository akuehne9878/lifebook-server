sap.ui.define(["jquery.sap.global", "sap/ui/model/json/JSONModel", "sap/ui/model/resource/ResourceModel"], function(jquery, JSONModel, ResourceModel) {
  return JSONModel.extend("lifebook.model.RestModel", {
    tree: function() {
      return this._get("/api/tree");
    },

    createPage: function(data) {
      return this._post("/api/createPage", data);
    },

    loadPage: function(data) {
      return this._post("/api/loadPage", data);
    },

    savePage: function(data) {
      return this._post("/api/savePage", data);
    },

    deletePage: function(data) {
      return this._post("/api/deletePage", data);
    },

    renamePage: function(data) {
      return this._post("/api/renamePage", data);
    },

    copyPage: function(data) {
      return this._post("/api/copyPage", data);
    },

    movePage: function(data) {
      return this._post("/api/movePage", data);
    },

    deleteFile: function(data) {
      return this._post("/api/deleteFile", data);
    },

    _get: function(url) {
      return this._ajax(url, "GET");
    },

    _post: function(url, data) {
      return this._ajax(url, "POST", data);
    },

    _put: function(url) {
      return this._ajax(url, "PUT");
    },

    _delete: function(url) {
      return this._ajax(url, "DELETE");
    },

    _ajax: function(url, method, data) {
      var that = this;
      var promise = new Promise(function(resolve, reject) {
        jquery.ajax({
          url: url,
          method: method,
          dataType: "json",
          data: JSON.stringify(data),
          contentType: "application/json",
          success: function(result) {
            that.setProperty("/", result);
            resolve(result);
          },
          error: function(err) {
            reject();
          },
          timeout: 10000
        });
      });

      return promise;
    }
  });
});
