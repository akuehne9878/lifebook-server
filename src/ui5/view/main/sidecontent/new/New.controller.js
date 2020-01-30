sap.ui.define(
  [
    "lifebook/view/main/sidecontent/BaseSideContentController.controller",
    "lifebook/model/RestModel",
    "jquery.sap.global",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/core/mvc/Controller",
    "sap/base/Log"
  ],
  function (BaseSideContentController, RestModel, jQuery, MessageBox, JSONModel, MessageToast, Fragment, Controller, Log) {
    return BaseSideContentController.extend("lifebook.view.main.sidecontent.new.New", {
      onInit: function (oEvent) {
        this.getOwnerComponent().registerController(this);
      },

      setup: function (oOptions) {
        this.setModel(new JSONModel(oOptions), "options")
        this.setModel(new JSONModel({ placeholder: "Neue Seite", title: "" }))
      },


      onSave: function (oEvent) {
        var that = this;
        var path = this.getOwnerComponent().getModel("currPage").getProperty("/path");

        var title = this.getModel().getProperty("/title");
        var newPath = path + "\\" + title;

        var oRestModel = new RestModel();
        oRestModel.createPage({ title: title, path: path }).then(function (data) {
          that.getController("lifebook.view.main.master.Master").reloadPage(newPath, { reloadTree: true });
          that.getModel("mdsPage").setProperty("/showSideContent", false);
        });
      }
    });
  }
);