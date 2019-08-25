sap.ui.define(
  [
    "lifebook/view/BaseView.controller",
    "lifebook/model/RestModel",
    "jquery.sap.global",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/core/mvc/Controller",
    "sap/base/Log"
  ],
  function (BaseView, RestModel, jQuery, MessageBox, JSONModel, MessageToast, Fragment, Controller, Log) {
    return BaseView.extend("lifebook.view.main.detail.edit.Edit", {
      onInit: function (oEvent) {
        this.getView().setModel(new JSONModel({ title: this.getOwnerComponent().getModel("currPage").getProperty("/title") }))
      },

      onClose: function (oEvent) {
        this.getController("lifebook.base.Base").closeSideContent();
      },

      onSave: function (oEvent) {
        var that = this;

        var oldTitle = this.getOwnerComponent().getModel("currPage").getProperty("/title");
        var path = this.getOwnerComponent().getModel("currPage").getProperty("/path");
        
        var newTitle = this.getModel().getProperty("/title");
        var newPath = path.substring(0,  path.lastIndexOf(oldTitle)) + newTitle

        var oRestModel = new RestModel();
       
        oRestModel.renamePage({ path: path, newTitle: newTitle }).then(function (data) {  
          that.getController("lifebook.view.main.master.Master").reloadPage(newPath, { reloadTree: true });
          that.onClose();
        });
      }
    });
  }
);
