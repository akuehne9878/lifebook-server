sap.ui.define(
  [
    "lifebook/view/BaseView.controller",
    "lifebook/model/RestModel",
    "jquery.sap.global",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/base/Log"
  ],
  function(BaseView, RestModel, jQuery, MessageBox, JSONModel, MessageToast, Fragment, Log) {
    return BaseView.extend("lifebook.view.main.master.Master", {
      onInit: function(oEvent) {
        this.reloadLifebookTree();
      },

      reloadLifebookTree: function() {
        var that = this;
        var oRestModel = new RestModel();
        oRestModel.tree().then(function(data) {
          that._prepareLifebookModel(data);
          oRestModel.setProperty("/", data);
          that.getModel("tree").setProperty("/", oRestModel.getData());
        });
      },

      _prepareLifebookModel: function(obj) {
        if (!obj.items) {
          obj.items = [];
        }
        var that = this;
        obj.items.forEach(function(item) {
          that._prepareLifebookModel(item);
        });

        obj.items.push({ type: "add", title: "Neue Seite", path: obj.path });
      },

      onClose: function(oEvent) {
        this.getController("lifebook.base.Base").hideMaster();
      },

      onPress: function(oEvent) {
        var oBindingContext = oEvent.getSource().getBindingContext("tree");

        var oObj = oBindingContext.getObject();

        if (oObj.type === "add") {
          oBindingContext.getModel().setProperty(oBindingContext.getPath() + "/type", "addConfirm");
        }

        if (oObj.type === "lifebook" || oObj.type === "page") {
          var that = this;
          var oRestModel = new RestModel();
          that.getModel("currPage").setProperty("/path", oObj.path.replace("/metainfo.json", ""));
          oRestModel.loadPage({ path: oObj.path }).then(function(data) {
            that.getModel("currPage").setProperty("/", oRestModel.getData());

            var oDetailController = that.getController("lifebook.view.main.detail.Detail");
            oDetailController.getToastEditor().setValue(data.content);

            if (that.getOwnerComponent().isPhone()) {
              that.getController("lifebook.base.Base").hideMaster();
            }
          });
        }
      },

      onCreatePage: function(oEvent) {
        var that = this;
        var oBindingContext = oEvent.getSource().getBindingContext("tree");

        var oObj = oBindingContext.getObject();

        var oRestModel = new RestModel();
        oRestModel.createPage({ title: oObj.title, path: oObj.path }).then(function(data) {
          that._prepareLifebookModel(data);
          that.getModel("tree").setProperty("/", data);
        });
      },

      onCancelCreatePage: function(oEvent) {
        var oBindingContext = oEvent.getSource().getBindingContext("tree");
        oBindingContext.getModel().setProperty(oBindingContext.getPath() + "/type", "add");
        oBindingContext.getModel().setProperty(oBindingContext.getPath() + "/title", "Neue Seite");
      }
    });
  }
);
