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
    return BaseController.extend("lifebook.view.main.detail.AbstractPage", {

      _pageTypeMap: {
        "standard": "lifebook.view.main.detail.page.type.standard.Standard",
        "invoice": "lifebook.view.main.detail.page.type.invoice.Invoice"
      },

      onInit: function (oEvent) {
        this.getOwnerComponent().registerController(this);
        this.getView().setModel(new JSONModel({ newLifebook: false, viewMode: true }), "meta");
      },


      onNavigateToChildPage: function (oEvent) {
        var object = oEvent.getSource().getBindingContext("currPage").getObject();
        var currPath = this.getOwnerComponent().getModel("currPage").getData().path;
        this.getController("lifebook.view.main.master.Master").reloadPage(currPath + "\\" + object.name);

      },

      reloadPage: function (sPath) {
        var model = new RestModel();
        var that = this;
        model.loadPage({ path: sPath }).then(function (data) {

          data.files.forEach(function (item) {
            item.selected = false;
          });

          that.getModel("currPage").setProperty("/", data);

          var navContainer = that.byId("navContainer");
          var navContainerPage = navContainer.getPages().filter(function (view) {
            return view.getViewName() === that._pageTypeMap[data.type];
          })[0];
          navContainer.to(navContainerPage.getId(), "show");
          navContainerPage.getController().setup();

          that.getController("lifebook.view.main.master.Master").expandTreeItem(localStorage.getItem("lifebook.currPage.path"));
          that.getController("lifebook.view.main.Main").setViewMode("view");

        });
      },

      onLinkPress: function (oEvent) {
        var object = oEvent.getSource().getBindingContext("breadcrumbs").getObject();
        this.getController("lifebook.view.main.master.Master").reloadPage(object.path);
      }

    });
  }
);
