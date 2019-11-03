sap.ui.define([
		"lifebook/view/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/BusyIndicator",
		"sap/ui/core/mvc/Controller" ], function(BaseController, JSONModel, BusyIndicator, Controller) {
	"use strict";

	var BaseSideContentLayout = BaseController.extend("lifebook.view.baseLayout.BaseSideContentLayout", {

		onInit: function(oEvent) {
			this.setModel(new JSONModel({
				title: ""
			}), "meta")

		},

		setSideContentView: function(oView) {
			this.getView().byId("baseSideContentPage").removeAllContent();
			this.getView().byId("baseSideContentPage").addContent(oView);
		},
		
		setSideContentTitle: function(sTitle) {
			this.getModel("meta").setProperty("/title", this.getResourceBundle().getText(sTitle));
		},

		onCloseSideContent: function(oEvent) {
			this.getOwnerComponent().getController("lifebook.view.baseLayout.BaseLayout").hideSideContent();
		}

	});

	return BaseSideContentLayout;

});
