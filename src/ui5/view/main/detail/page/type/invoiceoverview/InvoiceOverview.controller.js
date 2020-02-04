sap.ui.define(
  [
    "lifebook/view/main/detail/AbstractPage.controller",
    "lifebook/model/RestModel",
    "jquery.sap.global",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/core/mvc/Controller",
    "sap/base/Log",
  ],
  function (AbstractPage, RestModel, jQuery, MessageBox, JSONModel, MessageToast, Fragment, Controller, Log, NumberFormat, DateFormat) {
    return AbstractPage.extend("lifebook.view.main.detail.page.type.invoiceoverview.InvoiceOverview", {

      onInit: function (oEvent) {
        this.getOwnerComponent().registerController(this);
      },

      setup: function () {
        this.getOwnerComponent().getController("lifebook.view.main.detail.page.section.markdown.Markdown").setup(this.getModel("currPage").getProperty("/content"));
        this.getOwnerComponent().getController("lifebook.view.main.detail.page.section.invoiceoverview.InvoiceOverview").setup();
      },


    });
  }
);
