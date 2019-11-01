sap.ui.define([
		"sap/ui/core/message/Message",
		"lifebook/view/BaseController" ], function(Message, BaseController) {
	"use strict";

	return BaseController.extend("lifebook.view.BaseDialogController", {

		onAfterClose: function(oEvent) {
			this.destroy();
		},

		getDialog: function() {
			return this.getView().getContent()[0];
		},

		onCloseDialog: function() {
			var that = this;
			var p = new Promise(function(resolve, reject) {
				that._resolve = resolve;
			});
			return p;
		},

		closeDialog: function(oObject) {
			if (this._resolve) {
				this._resolve(oObject);
			}
			this.getDialog().close();
		},

	});

});
