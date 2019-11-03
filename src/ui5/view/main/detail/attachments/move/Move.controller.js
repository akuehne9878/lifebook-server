sap.ui.define(
  [
    "lifebook/view/BaseController.controller",
    "lifebook/model/RestModel",
    "jquery.sap.global",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/core/mvc/Controller",
    "sap/base/Log"
  ],
  function (BaseController, RestModel, jQuery, MessageBox, JSONModel, MessageToast, Fragment, Controller, Log) {
    return BaseController.extend("lifebook.view.main.detail.attachments.move.Move", {
      onInit: function (oEvent) {
        this.getView().setModel(new JSONModel({}), "currTarget");
      },

      onPress: function (oEvent) {
        var oBindingContext = oEvent.getSource().getBindingContext("tree");

        var oObj = oBindingContext.getObject();
        this.getModel("currTarget").setProperty("/path", oObj.path);
        this.getModel("currTarget").setProperty("/title", oObj.title);

      },

      onSave: function (oEvent) {
        var oRestModel = new RestModel();

        var srcPath = this.getModel("currPage").getProperty("/path");
        var dstPath = this.getModel("currTarget").getProperty("/path");

        var that = this;
        oRestModel.moveFile({ src: srcPath, dst: dstPath, fileName: this.getOwnerComponent().getModel("currAttachment").getProperty("/name") }).then(function (data) {
          that.getController("lifebook.view.main.detail.Detail").reloadPage(srcPath, "attachments");
          that.onClose();
        });
      }
    });
  }
);
