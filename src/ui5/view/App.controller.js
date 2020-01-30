sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel" ], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("lifebook.view.App", {
		onInit: function(oEvent) {
			this.getOwnerComponent().registerController(this);

			this.getOwnerComponent().getRouter().getRoute("page").attachPatternMatched(this.handlePage, this);
			this.getOwnerComponent().getRouter().getRoute("main").attachPatternMatched(this.handleMain, this);
		},


		handleMain: function () {
			this.getOwnerComponent().getController("lifebook.view.main.master.Master").reloadLifebookTree();			
			this._masterLoaded = true;
		},

		handlePage: function () {

			var path = null;
			if (arguments.length > 0) {
			  path = arguments[0].getParameter("arguments").path;
			}

			if (!this._masterLoaded) {
				this.handleMain();
			}

			if (path) {
			  this.getOwnerComponent().getController("lifebook.view.main.detail.AbstractPage").reloadPage(path);
			}
		  },

	});

});
