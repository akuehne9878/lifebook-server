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
    "sap/base/Log",
    "sap/ui/core/format/NumberFormat"
  ],
  function (BaseController, RestModel, jQuery, MessageBox, JSONModel, MessageToast, Fragment, Controller, Log, NumberFormat) {
    return BaseController.extend("lifebook.view.main.detail.page.section.overview.Overview", {

      onInit: function (oEvent) {
        this.getOwnerComponent().registerController(this);
      },


      setup: function () {

      },

      onNavigateToChildPage: function (oEvent) {
        var object = oEvent.getSource().getBindingContext("currPage").getObject();
        var currPath = this.getOwnerComponent().getModel("currPage").getData().path;
        this.getController("lifebook.view.main.master.Master").reloadPage(currPath + "\\" + object.name);
      },

    });
  }
);
