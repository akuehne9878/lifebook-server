sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel" ], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("lifebook.view.App", {
		onInit: function(oEvent) {
			this.getView().setModel(new JSONModel({
				showSideContent: false,
				currentSideContentViewName: "lifebook.view.main.detail.copy.Copy"
			}),"metaInfo")

			this.getOwnerComponent().registerController(this);


		},


		// onShowNewPage: function(oEvent) {
		// 	this.getView().getModel("metaInfo").setProperty("/currentSideContentViewName", "lifebook.view.main.detail.new.New");
		// 	this.getView().getModel("metaInfo").setProperty("/showSideContent", true);
		// },

		// onShowRenamePage: function(oEvent) {
		// 	this.getView().getModel("metaInfo").setProperty("/currentSideContentViewName", "lifebook.view.main.detail.edit.Edit");
		// 	this.getView().getModel("metaInfo").setProperty("/showSideContent", true);
		// }

	});

});
