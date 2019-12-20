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
    return BaseController.extend("lifebook.view.main.detail.views.Views", {
      onInit: function (oEvent) {
        this.getOwnerComponent().registerController(this);
      },

      setup: function () {
        var metainfo = new RestModel();
        metainfo.loadMetainfo({ path: this.getOwnerComponent().getModel("currPage").getProperty("/path") });
        this.setModel(metainfo, "metainfo");
      },

      onSave: function (oEvent) {
        var path = this.getOwnerComponent().getModel("currPage").getProperty("/path");
       
        var that = this;
        new RestModel().saveMetainfo({
          path: path,
          content: JSON.stringify(this.getModel("currPage").getProperty("/metainfo"))
        }).then(function() {
          that.getModel("mdsPage").setProperty("/showSideContent", false);
          that.getController("lifebook.view.main.detail.Detail").reloadPage(path);
        })
      },

      onDelete: function (oEvent) {
        var oBindingContext = oEvent.getSource().getBindingContext("currPage");
        var index = parseInt(oBindingContext.getPath().replace("/metainfo/views/", ""), 10);

        var metainfo = this.getModel("currPage").getProperty("/metainfo");

        var filteredViews= metainfo.views.filter(function (item, currIndex) {
          return currIndex !== index;
        })

        this.getModel("currPage").setProperty("/metainfo/views", filteredViews);

        this.onSave(oEvent);
      },

      onAdd: function (oEvent) {
        var views = this.getModel("currPage").getProperty("/metainfo/views");
        if (!views) {
          views = [];
        }

        var newView = { "title": "", "statement": "" };
        views.push(newView);
        this.getModel("currPage").setProperty("/metainfo/views", views);
      },

      factory: function (sId, oContext) {
        return this.byId("view").clone(sId);
      }

    });
  }
);
