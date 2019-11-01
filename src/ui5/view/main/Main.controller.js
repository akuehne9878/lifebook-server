sap.ui.define([
    "lifebook/view/BaseController",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/BusyIndicator",
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/mvc/View"], function (BaseController, Device, JSONModel, BusyIndicator, Controller, View) {
        "use strict";



        return BaseController.extend("lifebook.view.main.Main", {

            onInit: function (oEvent) {
                this.getOwnerComponent().getRouter().getRoute("page").attachPatternMatched(this.handlePage, this);

                var that = this;

                this._initPromise = new Promise(function (resolve, reject) {
                    that.getOwnerComponent().loadView({
                        viewName: "lifebook.view.baseLayout.BaseLayout",
                        parentView: that.getView()
                    }).then(function (oBaseLayout) {

                        oBaseLayout.getController().setMasterPage({
                            viewName: "lifebook.view.main.master.Master"
                        }).then(function (oView) {

                        });

                        oBaseLayout.getController().setDetailPage({
                            viewName: "lifebook.view.main.detail.Detail"
                        }).then(function (oView) {
                            oBaseLayout.getController().setDetailHeaderView({
                                viewName: "lifebook.view.main.detail.DetailHeader",
                                parentView: oView
                            });
                            resolve();  // resolve promise!!
                        })

                        oBaseLayout.getController().setPrimaryHeaderView({
                            viewName: "lifebook.view.main.PrimaryHeader"
                        });
                        // oBaseLayout.getController().setSecondaryHeaderView({
                        //     viewName: "lifebook.view.main.SecondaryHeader"
                        // });

                        that.getView().byId("mainPage").addContent(oBaseLayout);
                    });
                });





            },

            handlePage: function () {
                var that = this;

                var path = null;
                var tabKey = null;
                if (arguments.length > 0) {
                    path = arguments[0].getParameter("arguments").path;
                    tabKey = arguments[0].getParameter("arguments").tabKey;
                }


                this._initPromise.then(function () {
                    if (path) {
                        that.getController("lifebook.view.main.detail.Detail").reloadPage(path, "preview");
                    }
                })
            },

        });
    });
