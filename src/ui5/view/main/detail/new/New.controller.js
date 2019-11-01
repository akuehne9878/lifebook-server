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
    return BaseController.extend("lifebook.view.main.detail.new.New", {
      onInit: function (oEvent) {
        this.getView().setModel(new JSONModel({ title: "Neue Seite" }))
      },

      onClose: function (oEvent) {
        this.getController("lifebook.view.baseLayout.BaseLayout").hideSideContent();
      },

      onSave: function (oEvent) {
        var that = this;
        var path = this.getOwnerComponent().getModel("currPage").getProperty("/path");
        
        var title = this.getModel().getProperty("/title");
        var newPath = path + "\\" + title;

        var oRestModel = new RestModel();
        oRestModel.createPage({ title: title, path: path }).then(function(data) {
          that.getController("lifebook.view.main.master.Master").reloadPage(newPath, { reloadTree: true });
          that.onClose();
        });
      }

    });
  }
);
