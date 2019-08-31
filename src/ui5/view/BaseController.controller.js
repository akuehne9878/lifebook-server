sap.ui.define(["jquery.sap.global", "sap/m/MessageBox", "sap/ui/model/json/JSONModel", "sap/ui/core/Fragment", "sap/ui/core/mvc/Controller", "sap/base/Log"], function (
  jQuery,
  MessageBox,
  JSONModel,
  Fragment,
  Controller,
  Log
) {
  return Controller.extend("lifebook.view.BaseController", {
    onInit: function (oEvent) {

    },

    getModel: function (sModelName) {
      return this.getView().getModel(sModelName);
    },

    setModel: function (oModel, sModelName) {
      return this.getView().setModel(oModel, sModelName);
    },

    registerController: function (oController) {
      this.getOwnerComponent().registerController(oController);
    },

    getController: function (sNamespace) {
      return this.getOwnerComponent().getController(sNamespace);
    }
  });
});
