sap.ui.define([
		"sap/ui/core/message/Message",
		"lifebook/view/BaseController" ], function(Message, BaseController) {
	"use strict";

	return BaseController.extend("lifebook.view.BasePopoverController", {

		onAfterClose: function(oEvent) {
			this.destroy();
		},

		getPopover: function() {
			return this.getView().getContent()[0];
		},

		onClosePopover: function() {
			var that = this;
			var p = new Promise(function(resolve, reject) {
				that._resolve = resolve;
			});
			return p;
		},

		closePopover: function(oObject) {
			if (this._resolve) {
				this._resolve(oObject);
			}
			this.getPopover().close();
		}

	});

});
