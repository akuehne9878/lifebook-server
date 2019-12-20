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
    return BaseController.extend("lifebook.view.main.detail.properties.Properties", {
      onInit: function (oEvent) {
        this.getOwnerComponent().registerController(this);
      },

      setup: function () {
        var metainfo = new RestModel();
        metainfo.loadMetainfo({ path: this.getOwnerComponent().getModel("currPage").getProperty("/path") });
        this.setModel(metainfo, "metainfo");
      },

      onSave: function (oEvent) {
       var that = this;
        new RestModel().saveMetainfo({
          path: this.getOwnerComponent().getModel("currPage").getProperty("/path"),
          content: JSON.stringify(this.getModel("currPage").getProperty("/metainfo"))
        }).then(function(){
          that.getModel("mdsPage").setProperty("/showSideContent", false);
          that.getController("lifebook.view.main.detail.Detail").reloadPage(path);
        });
      },

      onDelete: function (oEvent) {
        var oBindingContext = oEvent.getSource().getBindingContext("currPage");
        var index = parseInt(oBindingContext.getPath().replace("/metainfo/properties/", ""), 10);


        var metainfo = this.getModel("currPage").getProperty("/metainfo");

        var filteredProperties = metainfo.properties.filter(function (item, currIndex) {
          return currIndex !== index;
        })

        this.getModel("currPage").setProperty("/metainfo/properties", filteredProperties);


        this.onSave(oEvent);
      },

      onAdd: function (oEvent) {

        var properties = this.getModel("currPage").getProperty("/metainfo/properties");

        if (!properties) {
          properties = [];
        }

        var newProp = { "id": "", "type": "", "label": "", "value": "" };
        properties.push(newProp);


        this.getModel("currPage").setProperty("/metainfo/properties", properties);
      },

      factory: function (sId, oContext) {
        var oUIControl;

        // Decide based on the data which dependant to clone
        // if (oContext.getProperty("UnitsInStock") === 0 && oContext.getProperty("Discontinued")) {
        // The item is discontinued, so use a StandardListItem
        oUIControl = this.byId("simple").clone(sId);
        // } else {
        // The item is available, so we will create an ObjectListItem
        // oUIControl = this.byId("productExtended").clone(sId);

        // The item is temporarily out of stock, so we will add a status
        //   if (oContext.getProperty("UnitsInStock") < 1) {
        //     oUIControl.addAttribute(new ObjectAttribute({
        //       text : {
        //         path: "i18n>outOfStock"
        //       }
        //     }));
        //   }
        // }

        return oUIControl;
      }


    });
  }
);
