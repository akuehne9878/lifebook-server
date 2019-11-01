sap.ui.define([
		"sap/ui/core/message/Message",
		"sap/ui/core/mvc/Controller" ], function(Message, Controller) {
	"use strict";

	return Controller.extend("com.blum.pai036.view.BaseController", {

		getRouter: function() {
			return this.getOwnerComponent().getRouter();
		},

		getConfig: function() {
			return this.getOwnerComponent().getMetadata().getConfig();
		},

		getModel: function(sName) {
			return this.getView().getModel(sName);
		},

		setModel: function(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		getResourceBundle: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		navTo: function(target, parameters) {
			return this.getRouter().navTo(target, parameters);
		},

		_showDesktopVersion: function() {
			return sap.ui.Device.system.desktop && sap.ui.Device.resize.width > 1300;
		},

		getController: function(sNamespace) {
			return this.getOwnerComponent().getController(sNamespace);
		}

	});

});
