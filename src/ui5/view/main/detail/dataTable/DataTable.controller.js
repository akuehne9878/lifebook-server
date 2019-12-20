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
    return BaseController.extend("lifebook.view.main.detail.dataTable.DataTable", {
      onInit: function (oEvent) {
        this.getOwnerComponent().registerController(this);
      },

      setup: function () {
        var restmodel = new RestModel();
        restmodel.listTables().then(function () {
          restmodel.setProperty("/selected", "");
        })
        this.setModel(restmodel, "tables");
        this.setModel(new JSONModel(), "entity");
      },

      onSelectionChange: function (oEvent) {
        var name = oEvent.getParameter("selectedItem").getProperty("key");
        var id = this.getModel("currPage").getProperty("/metainfo/id");

        this._readEntity(name, id)
      },

      _readEntity: function (name, id) {
        var restmodel = new RestModel();
        var entity = { name: name, id: id }
        restmodel.readEntity({ entity: entity }).then(function () {
          var index = -1;
          restmodel.getProperty("/properties").filter(function (item, i) {
            if (item.isPrimaryKey) {
              index = i;
            }
          })

          restmodel.setProperty("/properties/" + index + "/value", id)
        });
        this.setModel(restmodel, "entity");
      },


      onAdd: function (oEvent) {
        var that = this;
        var entity = this.getModel("entity").getData()
        var id = this.getModel("currPage").getProperty("/metainfo/id");

        var restmodel = new RestModel();
        restmodel.createEntity({ entity: entity }).then(function () {
          var oView = {title: entity.name, statement: "Select * from " + entity.name + " where id = '" + id + "'"};
          var views =  that.getOwnerComponent().getModel("currPage").getProperty("/metainfo/views");
          if (!views) {
            views = [];
          }
          views.push(oView);
          that.getOwnerComponent().getModel("currPage").setProperty("/metainfo/views", views);
  
  
          new RestModel().saveMetainfo({
            path: that.getOwnerComponent().getModel("currPage").getProperty("/path"),
            content: JSON.stringify(that.getModel("currPage").getProperty("/metainfo"))
          }).then(function(){
            that.getModel("mdsPage").setProperty("/showSideContent", false);
            that.getController("lifebook.view.main.detail.Detail").reloadPage(path);
          });
        })




      },

      onUpdate: function (oEvent) {
        var that = this;
        var entity = this.getModel("entity").getData()

        var restmodel = new RestModel();
        restmodel.updateEntity({ entity: entity }).then(function () {
          that._readEntity(entity.name, entity.id);
        })

      },

      onDelete: function (oEvent) {
        var that = this;
        var entity = this.getModel("entity").getData()

        var restmodel = new RestModel();
        restmodel.deleteEntity({ entity: entity }).then(function () {
          that._readEntity(entity.name, entity.id);
        })

      },


    });
  }
);
