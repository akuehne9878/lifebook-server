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
    "sap/ui/core/format/DateFormat",
    'sap/ui/model/Filter',
    'sap/ui/model/Sorter'
  ],
  function (BaseController, RestModel, jQuery, MessageBox, JSONModel, MessageToast, Fragment, Controller, Log, NumberFormat, DateFormat, Filter, Sorter) {
    return BaseController.extend("lifebook.view.main.detail.page.section.invoiceoverview.InvoiceOverview", {

      onInit: function (oEvent) {
        this.getOwnerComponent().registerController(this);
        this._mViewSettingsDialogs = [];
      },

      setup: function () {
        var oRestModel = new RestModel();
        oRestModel.executeStatement({ statement: "Select * from invoice" }).then(function (data) {
          oRestModel.setProperty("/items", data);
        })

        this.setModel(oRestModel, "table");
      },

      currencyFormatter: function (total) {
        return NumberFormat.getCurrencyInstance({ minFractionDigits: 2 }).format(total);
      },

      dateFormatter: function (data) {

        if (data) {
          var d = new Date(data)
          return DateFormat.getDateInstance({ pattern: "dd.MM.yyyy" }).format(d);
        }
        return data;
      },


      createViewSettingsDialog: function (sDialogFragmentName) {
        var oDialog = this._mViewSettingsDialogs[sDialogFragmentName];

        if (!oDialog) {
          oDialog = sap.ui.xmlfragment(sDialogFragmentName, this);
          this._mViewSettingsDialogs[sDialogFragmentName] = oDialog;
        }
        return oDialog;
      },

      onSortButtonPressed: function () {
        this.createViewSettingsDialog("lifebook.view.main.detail.page.section.invoiceoverview.SortDialog").open();
      },

      onFilterButtonPressed: function () {
        this.createViewSettingsDialog("lifebook.view.main.detail.page.section.invoiceoverview.FilterDialog").open();
      },

      onSortDialogConfirm: function (oEvent) {
        var oTable = this.byId("invoiceOverview");
        var mParams = oEvent.getParameters();
        var oBinding = oTable.getBinding("items");
        var sPath = mParams.sortItem.getKey();
        var bDescending = mParams.sortDescending;
        var aSorters = [];

        aSorters.push(new Sorter(sPath, bDescending));

        // apply the selected sort and group settings
        oBinding.sort(aSorters);
      },

      onFilterDialogConfirm: function (oEvent) {
        var oTable = this.byId("invoiceOverview");
        var mParams = oEvent.getParameters();
        var oBinding = oTable.getBinding("items");
        var aFilters = [];

        mParams.filterItems.forEach(function (oItem) {
          var aSplit = oItem.getKey().split("___"),
            sPath = aSplit[0],
            sOperator = aSplit[1],
            sValue1 = aSplit[2],
            sValue2 = aSplit[3],
            oFilter = new Filter(sPath, sOperator, sValue1, sValue2);
          aFilters.push(oFilter);
        });

        // apply filter settings
        oBinding.filter(aFilters);

        // update filter bar
        this.byId("vsdFilterBar").setVisible(aFilters.length > 0);
        this.byId("vsdFilterLabel").setText(mParams.filterString);
      },

      handleDateRangeChange: function (oEvent) {
        var oNewValue = oEvent.getParameter("value");
        debugger;

        oEvent.getSource().getParent();

        // oCustomFilter = this._oDialog.getFilterItems()[0];

        // Set the custom filter's count and selected properties
        // if the value has changed
        if (oNewValue !== this.filterPreviousValue) {
          oCustomFilter.setFilterCount(1);
          oCustomFilter.setSelected(true);
        } else {
          oCustomFilter.setFilterCount(0);
          oCustomFilter.setSelected(false);
        }
      }



    });
  }
);
