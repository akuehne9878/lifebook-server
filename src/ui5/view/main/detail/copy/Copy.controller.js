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
    return BaseController.extend("lifebook.view.main.detail.copy.Copy", {
      onInit: function (oEvent) {
        this.getView().setModel(new JSONModel({}), "currTarget");        
      },

      onClose: function (oEvent) {
        this.getController("lifebook.view.baseLayout.BaseLayout").hideSideContent();
      },

      onPress: function (oEvent) {
        var oBindingContext = oEvent.getSource().getBindingContext("targetTree");

        var oObj = oBindingContext.getObject();
        this.getModel("currTarget").setProperty("/path", oObj.path);
        this.getModel("currTarget").setProperty("/title", oObj.title);
       
      },

      onSave: function (oEvent) {
        var oRestModel = new RestModel();

        var srcPath = this.getModel("currPage").getProperty("/path");
        var dstPath = this.getModel("currTarget").getProperty("/path");
        var title = this.getModel("currPage").getProperty("/title");
       
        var that = this;
        oRestModel.copyPage({ src: srcPath, dst: dstPath, title: title }).then(function (data) {  
          that.getController("lifebook.view.main.master.Master").reloadPage(srcPath, { reloadTree: true });
          that.onClose();
        });
      }
    });
  }
);
