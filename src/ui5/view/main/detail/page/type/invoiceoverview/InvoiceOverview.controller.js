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
    "sap/ui/core/format/NumberFormat",
    "sap/ui/core/format/DateFormat"
  ],
  function (AbstractPage, RestModel, jQuery, MessageBox, JSONModel, MessageToast, Fragment, Controller, Log, NumberFormat, DateFormat) {
    return AbstractPage.extend("lifebook.view.main.detail.page.type.invoiceoverview.InvoiceOverview", {

      onInit: function (oEvent) {
        this.getOwnerComponent().registerController(this);
      },

      setup: function () {
        this.getOwnerComponent().getController("lifebook.view.main.detail.page.section.markdown.Markdown").setup(this.getModel("currPage").getProperty("/content"));
      },

      currencyFormatter: function (total) {
        return NumberFormat.getCurrencyInstance({ minFractionDigits: 2 }).format(total, "EUR");
      },

      dateFormatter: function (data) {

        if (data) {
          var d = new Date(data)
          return DateFormat.getDateInstance({ pattern: "dd.MM.yyyy" }).format(d);
        }
        return data;
      }


    });
  }
);
