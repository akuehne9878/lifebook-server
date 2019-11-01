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
    return BaseController.extend("lifebook.view.main.detail.PrimaryHeader", {
      onInit: function (oEvent) {

      },
      onShowMaster() {
        this.getController("lifebook.view.baseLayout.BaseLayout").toggleMasterPage();
      },

      pageTitleFormatter: function (path) {

        if (path) {
          return path.split("\\").join(" / ");
        }
        return "";

      },


    });
  }
);
