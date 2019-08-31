sap.ui.define(["sap/ui/model/json/JSONModel", "lifebook/model/RestModel", "lifebook/layout/BaseLayout.controller"], function (JSONModel, RestModel, BaseLayout) {
    return BaseLayout.extend("lifebook.layout.Layout", {
        onInit: function (oEvent) {

            
            this.getOwnerComponent().registerController(this);

            var that = this;

            var pMasterView = that.getOwnerComponent().loadView({ namespace: "lifebook.view.main.master.Master", parentView: that.getView() });
            var pDetailView = that.getOwnerComponent().loadView({ namespace: "lifebook.view.main.detail.Detail", parentView: that.getView() });
            var pEdit = that.getOwnerComponent().loadView({ namespace: "lifebook.view.main.detail.edit.Edit", parentView: that.getView() });

            Promise.all([pMasterView, pDetailView, pEdit]).then(function (values) {

                var oMasterView = values[0];
                var oDetailView = values[1];
                var oEditView = values[2];


                that.setMasterView(oMasterView);
                that.setDetailView(oDetailView);
                that.setSideContentView(oEditView);

                that.getOwnerComponent().loadFragment({ namespace: "lifebook.view.main.detail.DetailHeader", parentView: oDetailView }).then(function (oDetailHeaderFragment) {
                    that.setDetailHeaderView(oDetailHeaderFragment);
                });


                // oLayoutController.hidePage0Header();

                // oLayoutController.deviceSetup();
            });


            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("page").attachPatternMatched(this._onPageMatched, this);
        },

        _onPageMatched: function (oEvent) {

            var model = new RestModel();

            var that = this;
            model.loadPage({ path: oEvent.getParameter("arguments").path }).then(function (data) {
                that.getView().getModel("currPage").setProperty("/", data);
            });
        }
    });
});
