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
  function(BaseView, RestModel, jQuery, MessageBox, JSONModel, MessageToast, Fragment, Controller, Log) {
    return BaseView.extend("lifebook.view.main.detail.attachments.Attachments", {
      onInit: function(oEvent) {
        this.getView().setModel(new JSONModel({}), "meta");
      },

      onDeleteFile: function(oEvent) {
        var currFile = oEvent
          .getSource()
          .getParent()
          .getParent()
          .getParent()
          .getParent()
          .getBindingContext("currPage")
          .getObject();

        //debugger;
        var oRestModel = new RestModel();
        var currPage = this.getView()
          .getModel("currPage")
          .getData();
        var that = this;
        oRestModel.deleteFile({ path: currPage.path, name: currFile.name }).then(function(data) {
          that.getModel("currPage").setProperty("/", oRestModel.getData());
        });
      }
    });
  }
);
