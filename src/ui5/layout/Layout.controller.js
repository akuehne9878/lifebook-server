sap.ui.define(["sap/ui/model/json/JSONModel", "lifebook/model/RestModel", "lifebook/layout/BaseLayout.controller"], function (JSONModel, RestModel, BaseLayout) {
    return BaseLayout.extend("lifebook.layout.Layout", {
        onInit: function (oEvent) {

            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("page").attachPatternMatched(this._handlePage, this);



            this.getOwnerComponent().registerController(this);

            var that = this;

            var pMasterView = that.getOwnerComponent().loadView({ namespace: "lifebook.view.main.master.Master", parentView: that.getView() });
            var pDetailView = that.getOwnerComponent().loadView({ namespace: "lifebook.view.main.detail.Detail", parentView: that.getView() });



            Promise.all([pMasterView, pDetailView]).then(function (values) {

                var oMasterView = values[0];
                var oDetailView = values[1];


                that.setMasterView(oMasterView);
                that.setDetailView(oDetailView);

                that.getOwnerComponent().loadFragment({ namespace: "lifebook.view.main.detail.DetailHeader", parentView: oDetailView }).then(function (oDetailHeaderFragment) {
                    that.setDetailHeaderView(oDetailHeaderFragment);

                    if (that._path) {
                        oDetailView.getController().reloadPage(that._path);
                    }

                });


                // oLayoutController.hidePage0Header();

                // oLayoutController.deviceSetup();
            });


        },

        _handlePage: function (oEvent) {
            this._path = oEvent.getParameter("arguments").path;
            var c = this.getOwnerComponent().getController("lifebook.view.main.detail.Detail");
            if (c) {
                c.reloadPage(this._path);
            }

        }

    });
});
