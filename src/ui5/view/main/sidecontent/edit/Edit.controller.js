sap.ui.define(
  [
    "lifebook/view/main/sidecontent/BaseSideContentController.controller",
    "lifebook/model/RestModel",
    "jquery.sap.global",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/core/mvc/Controller",
    "sap/base/Log"
  ],
  function (BaseSideContentController, RestModel, jQuery, MessageBox, JSONModel, MessageToast, Fragment, Controller, Log) {
    return BaseSideContentController.extend("lifebook.view.main.sidecontent.edit.Edit", {
      onInit: function (oEvent) {
        this.getOwnerComponent().registerController(this);
      },

      setup: function (oOptions) {
        this.setModel(new JSONModel(oOptions), "options")

        if (oOptions.mode === "page") {
          this.setModel(new JSONModel({ title: this.getOwnerComponent().getModel("currPage").getProperty("/title") }))
        } else {
          this.setModel(new JSONModel({ title: this.getOwnerComponent().getModel("currAttachment").getProperty("/name") }))
        }
      },

      onSave: function(oEvent) {
        if (this.getModel("options").getProperty("/mode") === "page") {
          this._onSavePage(oEvent);
        } else {
          this._onSaveAttachment(oEvent);
        }
      },

      _onSavePage: function (oEvent) {
        var that = this;

        var oldTitle = this.getOwnerComponent().getModel("currPage").getProperty("/title");
        var path = this.getOwnerComponent().getModel("currPage").getProperty("/path");

        var newTitle = this.getModel().getProperty("/title");
        var newPath = path.substring(0, path.lastIndexOf(oldTitle)) + newTitle

        var oRestModel = new RestModel();

        oRestModel.renamePage({ path: path, newTitle: newTitle }).then(function (data) {
          that.getController("lifebook.view.main.master.Master").reloadPage(newPath, { reloadTree: true });
          that.getModel("mdsPage").setProperty("/showSideContent", false);
        });
      },

      _onSaveAttachment: function (oEvent) {
        var that = this;

        var oldTitle = this.getOwnerComponent().getModel("currAttachment").getProperty("/name");
        var path = this.getOwnerComponent().getModel("currPage").getProperty("/path") + "\\" + oldTitle;

        var newTitle = this.getModel().getProperty("/title");
        
        var pagePath = this.getOwnerComponent().getModel("currPage").getProperty("/path");
        
        var oRestModel = new RestModel();
        oRestModel.renameFile({ path: path, newTitle: newTitle }).then(function (data) {
          that.getController("lifebook.view.main.detail.AbstractPage").reloadPage(pagePath, "attachments");
          that.getModel("mdsPage").setProperty("/showSideContent", false);
        });
      }      
    });
  }
);
