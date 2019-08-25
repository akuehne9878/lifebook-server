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
        this.getOwnerComponent().registerController(this);
        this.reloadLifebookTree();
      },

      reloadLifebookTree: function() {
        var that = this;
        var oRestModel = new RestModel();
        return oRestModel.tree().then(function(data) {
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
          this.getModel("currPage").setProperty("/path", oObj.path);
          this.reloadPage(oObj.path);
        }
      },

      _navToPage: function(sPath) {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("page", {
          path: sPath
        });
      },

      reloadPage: function(sPath, options) {
        var that = this;
        if (options && options.reloadTree) {
          this.reloadLifebookTree().then(function() {
            that._navToPage(sPath);
          })
        } else {
          this._navToPage(sPath);
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
