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
  function(BaseView, RestModel, jQuery, MessageBox, JSONModel, MessageToast, Fragment, Controller, Log) {
    return BaseView.extend("lifebook.view.main.Main", {
      onInit: function(oEvent) {
        this.getOwnerComponent().registerController(this);

        var that = this;

        var oBase = null;
        this.getOwnerComponent()
          .loadView("lifebook.base.Base")
          .then(function(oView) {
            oBase = oView.getController();
            that
              .getView()
              .byId("lifebook")
              .addContent(oView);

            var pMasterView = that.getOwnerComponent().loadView("lifebook.view.main.master.Master", that.getView());
            var pDetailView = that.getOwnerComponent().loadView("lifebook.view.main.detail.Detail", that.getView());
            var pPage1HeaderView = that.getOwnerComponent().loadView("lifebook.view.main.detail.Page1Header", that.getView());
            Promise.all([pMasterView, pDetailView, pPage1HeaderView]).then(function(values) {
              oBase.setMasterView(values[0]);
              oBase.setDetailView(values[1]);
              oBase.setPage1HeaderView(values[2]);

              oBase.hidePage0Header();

              oBase.deviceSetup();
            });
          });

          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.getRoute("page").attachPatternMatched(this._onPageRouteMatched, this);

      },

      _onPageRouteMatched: function(oEvent) {

        var path = oEvent.getParameter("arguments").path;

        var that = this;
        var oRestModel = new RestModel();        
        oRestModel.loadPage({ path: path }).then(function(data) {
          that.getModel("currPage").setProperty("/", oRestModel.getData());

          if (that.getOwnerComponent().isPhone()) {
            that.getController("lifebook.base.Base").hideMaster();
          }
        });        

        
      }



    });
  }
);
