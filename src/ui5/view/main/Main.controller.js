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
    return BaseView.extend("lifebook.view.main.Main", {
      onInit: function(oEvent) {
        this.getOwnerComponent().registerController(this);

        var that = this;

        var oBase = null;
        this.getOwnerComponent()
          .loadView("lifebook.base.Base")
          .then(function(oView) {
            oBase = oView.getController();
            that
              .getView()
              .byId("lifebook")
              .addItem(oView);

            var pMasterView = that.getOwnerComponent().loadView("lifebook.view.main.master.Master");
            var pDetailView = that.getOwnerComponent().loadView("lifebook.view.main.detail.Detail");

            Promise.all([pMasterView, pDetailView]).then(function(values) {
              oBase.setMasterView(values[0]);
              oBase.setDetailView(values[1]);

              oBase.deviceSetup();
            });
          });
      }
    });
  }
);
