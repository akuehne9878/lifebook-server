sap.ui.define([
		"lifebook/view/baseLayout/BaseDialogController",
		"sap/ui/Device",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/BusyIndicator",
		"sap/ui/core/mvc/Controller",
		"sap/ui/core/mvc/View" ], function(BaseDialogController, Device, JSONModel, BusyIndicator, Controller, View) {
	"use strict";

	return BaseDialogController.extend("lifebook.view.baseLayout.messageDialog.MessageDialog", {

		onInit: function(oEvent) {
			this.setModel(new JSONModel({
				title: "",
				message: ""
			}));
		},

		showDeleteDialog: function(options) {
			this._options = options;

			this.setModel(new JSONModel({
				title: options.title,
				message: options.message,
			}));

			this.getDialog().open();
		},

		onDelete: function(oEvent) {
			this._options.onClose.call(this, "DELETE");
			this.onClose();
		},

		showErrorDialog: function(options) {
			this._options = options;

			this.setModel(new JSONModel({
				title: options.title,
				message: options.message,
			}));

			this.getDialog().open();
		},
		
		onCancel: function(oEvent) {
			this.closeDialog();
		}

	})

});
