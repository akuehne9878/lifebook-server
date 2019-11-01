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
    return BaseController.extend("lifebook.view.main.detail.attachments.edit.Edit", {
      onInit: function (oEvent) {
        this.getView().setModel(new JSONModel({ title: this.getOwnerComponent().getModel("currAttachment").getProperty("/name") }))
      },

      onClose: function (oEvent) {
        this.getController("lifebook.view.baseLayout.BaseLayout").hideSideContent();
      },

      onSave: function (oEvent) {
        var that = this;

        var oldTitle = this.getOwnerComponent().getModel("currAttachment").getProperty("/name");
        var path = this.getOwnerComponent().getModel("currPage").getProperty("/path") + "\\" + oldTitle;

        var newTitle = this.getModel().getProperty("/title");
        
        var pagePath = this.getOwnerComponent().getModel("currPage").getProperty("/path");
        
        var oRestModel = new RestModel();
        oRestModel.renameFile({ path: path, newTitle: newTitle }).then(function (data) {
          that.getController("lifebook.view.main.detail.Detail").reloadPage(pagePath, "attachments");
          that.onClose();
        });
      }
    });
  }
);
