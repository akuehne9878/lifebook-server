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
    "sap/ui/core/format/NumberFormat",
    "sap/ui/Device",
    "sap/ui/core/BusyIndicator"
  ],

  function (BaseController, RestModel, jQuery, MessageBox, JSONModel, MessageToast, Fragment, Controller, Log, NumberFormat, Device, BusyIndicator) {
    return BaseController.extend("lifebook.view.main.detail.AbstractPage", {

      _pageTypeMap: {
        "standard": "lifebook.view.main.detail.page.type.standard.Standard",
        "invoice": "lifebook.view.main.detail.page.type.invoice.Invoice",
        "invoice_overview": "lifebook.view.main.detail.page.type.invoiceoverview.InvoiceOverview",
      },

      onInit: function (oEvent) {
        this.getOwnerComponent().registerController(this);
        this.getView().setModel(new JSONModel({ newLifebook: false, viewMode: true }), "meta");
      },

      onAfterRendering: function (oEvent) {
        BusyIndicator.hide();
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

          if (Device.system.phone) {
            that.getModel("mdsPage").setProperty("/showMaster", false);
            that.getModel("mdsPage").setProperty("/showSideContentSpace", false);
            that.getModel("mdsPage").setProperty("/showMainContent", true);

          }



        });
      },

      onLinkPress: function (oEvent) {
        var object = oEvent.getSource().getBindingContext("breadcrumbs").getObject();
        this.getController("lifebook.view.main.master.Master").reloadPage(object.path);
      }

    });
  }
);
