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
    return BaseController.extend("lifebook.view.main.detail.upload.Upload", {
      onInit: function (oEvent) { },

      handleUploadPress: function (oEvent) {
        var oFileUploader = this.byId("fileUploader");
        if (!oFileUploader.getValue()) {
          MessageToast.show("Choose a file first");
          return;
        }
        sap.ui.core.BusyIndicator.show();
        oFileUploader.upload();
      },

      handleUploadComplete: function (oEvent) {
        sap.ui.core.BusyIndicator.hide();
        var sResponse = oEvent.getParameter("response");
        var sMsg = "Upload Error";
        if (sResponse) {
          if (sResponse.startsWith("200")) {
            sMsg = "Upload Success";

            var that = this;
            var oRestModel = new RestModel();
            oRestModel.loadPage({ path: this.getModel("currPage").getProperty("/path") }).then(function (data) {
              that.getModel("currPage").setProperty("/", oRestModel.getData());
              that.getModel("mdsPage").setProperty("/showSideContent", false);
            });
          } else {
            sMsg = "Return Code: " + sResponse + " (Upload Error)";
          }
        }
        MessageToast.show(sMsg);

        var oFileUploader = this.byId("fileUploader");
        oFileUploader.clear();
      }
    });
  }
);
