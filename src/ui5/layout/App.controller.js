sap.ui.define(["lifebook/view/BaseController.controller",  "lifebook/model/RestModel", "jquery.sap.global", "sap/m/MessageBox", "sap/ui/model/json/JSONModel", "sap/ui/core/Fragment", "sap/ui/core/mvc/Controller", "sap/base/Log"], function (
  BaseController,
  RestModel,
  jQuery,
  MessageBox,
  JSONModel,
  Fragment,
  Controller,
  Log
) {
  return BaseController.extend("lifebook.layout.App", {
    onInit: function (oEvent) {
/*
      this.getOwnerComponent().registerController(this);

      var that = this;

      var oLayoutController = null;
      this.getOwnerComponent()
        .loadView({ namespace:"lifebook.layout.Layout"})
        .then(function (oView) {
          oLayoutController = oView.getController();
          that
            .getView()
            .byId("app")
            .addPage(oView);

          var pMasterView = that.getOwnerComponent().loadView({ namespace: "lifebook.view.main.master.Master", parentView: that.getView() });
          var pDetailView = that.getOwnerComponent().loadView({ namespace: "lifebook.view.main.detail.Detail", parentView: that.getView() });
          var pEdit = that.getOwnerComponent().loadView({ namespace: "lifebook.view.main.detail.edit.Edit", parentView: that.getView() });
          
          Promise.all([pMasterView, pDetailView, pEdit]).then(function (values) {
            
            var oMasterView = values[0];
            var oDetailView = values[1];
            var oEditView = values[2];
            
            
            oLayoutController.setMasterView(oMasterView);
            oLayoutController.setDetailView(oDetailView);
            oLayoutController.setSideContentView(oEditView);
            
            that.getOwnerComponent().loadFragment({ namespace: "lifebook.view.main.detail.DetailHeader", parentView: oDetailView }).then(function(oDetailHeaderFragment){
              oLayoutController.setDetailHeaderView(oDetailHeaderFragment);
            });


            // oLayoutController.hidePage0Header();

            // oLayoutController.deviceSetup();
          });
        });

      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.getRoute("page").attachPatternMatched(this._onPageMatched, this);
      */
    },

    _onPageMatched: function (oEvent) {

      var model = new RestModel();

      var that = this;
      model.loadPage({ path: oEvent.getParameter("arguments").path }).then(function (data) {
        that.getModel("currPage").setProperty("/", data);
      });
    }


  });
});
