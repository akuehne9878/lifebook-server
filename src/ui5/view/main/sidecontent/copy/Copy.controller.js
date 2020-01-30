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
    return BaseSideContentController.extend("lifebook.view.main.sidecontent.copy.Copy", {
      onInit: function (oEvent) {
        this.getOwnerComponent().registerController(this);
      },

      setup: function (oOptions) {
        this.setModel(new JSONModel(oOptions), "options")
        this.setModel(new JSONModel({}), "currTarget");
      },

      onPress: function (oEvent) {
        var oBindingContext = oEvent.getSource().getBindingContext("targetTree");

        var oObj = oBindingContext.getObject();
        this.getModel("currTarget").setProperty("/path", oObj.path);
        this.getModel("currTarget").setProperty("/title", oObj.title);

      },

      onSave: function (oEvent) {
        if (this.getModel("options").getProperty("/mode") === "page") {
          this._onSavePage(oEvent);
        } else {
          this._onSaveAttachment(oEvent);
        }
      },

      _onSavePage: function (oEvent) {
        var oRestModel = new RestModel();

        var srcPath = this.getModel("currPage").getProperty("/path");
        var dstPath = this.getModel("currTarget").getProperty("/path");
        var title = this.getModel("currPage").getProperty("/title");

        var that = this;
        oRestModel.copyPage({ src: srcPath, dst: dstPath, title: title }).then(function (data) {
          that.getController("lifebook.view.main.master.Master").reloadPage(srcPath, { reloadTree: true });
          that.getModel("mdsPage").setProperty("/showSideContent", false);
        });
      },

      _onSaveAttachment: function (oEvent) {
        var oRestModel = new RestModel();

        var srcPath = this.getModel("currPage").getProperty("/path");
        var dstPath = this.getModel("currTarget").getProperty("/path");


        var arr = this.getOwnerComponent().getModel("selectedAttachments").getData();
        if (arr === {}) {
          arr = [];
          arr.push(this.getOwnerComponent().getModel("currAttachment").getProperty("/"));
        };

        var fileNames = arr.map(function (item) {
          return item.name;
        })

        var that = this;
        oRestModel.copyFile({ src: srcPath, dst: dstPath, fileNames: fileNames }).then(function (data) {
          that.getController("lifebook.view.main.detail.AbstractPage").reloadPage(srcPath, "attachments");
          that.getModel("mdsPage").setProperty("/showSideContent", false);

          that.getOwnerComponent().getModel("selectedAttachments").setProperty("/", null);

        });
      },

    });
  }
);
