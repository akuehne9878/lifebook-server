sap.ui.define(
  [
    "lifebook/view/BaseView.controller",
    "lifebook/model/RestModel",
    "jquery.sap.global",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/core/mvc/Controller",
    "sap/base/Log"
  ],
  function (BaseView, RestModel, jQuery, MessageBox, JSONModel, MessageToast, Fragment, Controller, Log) {
    return BaseView.extend("lifebook.view.main.detail.Page1Header", {
      onInit: function (oEvent) {
        this.getView().setModel(new JSONModel({ newLifebook: false, viewMode: true }), "meta");
      },

      onShowMaster() {
        this.getController("lifebook.base.Base").showMaster();
      },

      onShowUpload: function (oEvent) {
        this._loadSideContentView("lifebook.view.main.detail.upload.Upload");
      },

      onShowEdit: function (oEvent) {
         this._loadSideContentView("lifebook.view.main.detail.edit.Edit");
      },

      onShowNew: function(oEvent) {
        this._loadSideContentView("lifebook.view.main.detail.new.New");
      },

      onShowCopy: function(oEvent) {
        this._loadSideContentView("lifebook.view.main.detail.copy.Copy");
      },

      onShowMove: function(oEvent) {
        this._loadSideContentView("lifebook.view.main.detail.move.Move");
      },

      onDelete: function(oEvent) {
        var oRestModel = new RestModel();
        var currPage = this.getView()
          .getModel("currPage")
          .getData();

        var that = this;
        MessageBox.confirm(currPage.title + " löschen?", {
          actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.DELETE],
          title: "Seite löschen",
          onClose: function(sAction) {
            if (sAction === sap.m.MessageBox.Action.DELETE) {
              oRestModel.deletePage({ path: currPage.path }).then(function(data) {
                that.getController("lifebook.view.main.master.Master")._prepareLifebookModel(data);
                that
                  .getView()
                  .getModel("tree")
                  .setProperty("/", data);               
              });
            }
          }
        });
      },

      _loadSideContentView: function(sView) {
        var pView = this.getOwnerComponent().loadView(sView);

        var that = this;
        pView.then(function (oView) {
          that.getController("lifebook.base.Base").setSideContentView(oView);
        });
      }
    });
  }
);
