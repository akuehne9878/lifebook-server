sap.ui.define(
  [
    "lifebook/view/BaseView.controller",
    "lifebook/model/RestModel",
    "jquery.sap.global",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/base/Log"
  ],
  function(BaseView, RestModel, jQuery, MessageBox, JSONModel, MessageToast, Fragment, Log) {
    return BaseView.extend("lifebook.view.main.settings.Settings", {
      onInit: function(oEvent) {},

      onClose: function(oEvent) {
        this.getController("lifebook.base.Base").closeSideContent();
      }
    });
  }
);
