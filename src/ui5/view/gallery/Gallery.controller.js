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
    return BaseController.extend("lifebook.view.gallery.Gallery", {
      onInit: function (oEvent) {
        this.getOwnerComponent().registerController(this);

      },

      onNavButtonPress: function (oEvent) {
        var app = this.getController("lifebook.view.App").getView().byId("app");
        app.to(app.getPages()[0]);
      },

      setStartIndex: function (iIndex) {
        var oPage = this.byId("carousel").getPages()[iIndex];
        this.byId("carousel").setActivePage(oPage);
      }

    });
  }
);
