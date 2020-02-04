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
    return BaseSideContentController.extend("lifebook.view.main.sidecontent.invoice.Invoice", {
      onInit: function (oEvent) {
        this.getOwnerComponent().registerController(this);
        this.setModel(new JSONModel());
      },

      setup: function (oOptions) {
        this.setModel(new JSONModel(oOptions), "options")
        var pageid = this.getModel("currPage").getProperty("/metainfo/pageid");


        this._bUpdate = false;

        var that = this;
        var oRestModel = new RestModel();
        oRestModel.loadInvoice(pageid).then(function (data) {
          if (data.length === 1) {
            that._bUpdate = true;
            that.getModel().setProperty("/", data[0])
          } else {
            that.setModel(new JSONModel({ invoiceName: "", invoiceNumber: "", invoiceDate: "", paymentDate: "", payedBy: "", total: null }));
          }
        });

      },


      onSave: function (oEvent) {
        var that = this;
        // var path = this.getOwnerComponent().getModel("currPage").getProperty("/path");

        // var title = this.getModel().getProperty("/title");
        // var type = this.getModel().getProperty("/type");
        // var newPath = path + "\\" + title;

        var obj = this.getModel().getProperty("/");
        var pageid = this.getModel("currPage").getProperty("/metainfo/pageid");

        var pagePath = this.getModel("currPage").getProperty("/path");


        var oRestModel = new RestModel();
        if (that._bUpdate) {


          oRestModel.updateInvoice(pageid, obj).then(function (data) {
            that.getController("lifebook.view.main.detail.AbstractPage").reloadPage(pagePath);
            that.getModel("mdsPage").setProperty("/showSideContent", false);
          })
        } else {

          oRestModel.createInvoice(pageid, obj).then(function (data) {
            that.getController("lifebook.view.main.detail.AbstractPage").reloadPage(pagePath);
            that.getModel("mdsPage").setProperty("/showSideContent", false);
          });
        }



      }
    });
  }
);