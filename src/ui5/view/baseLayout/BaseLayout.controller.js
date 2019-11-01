sap.ui.define([
	"lifebook/view/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/Dialog",
	"sap/ui/Device",
	"sap/ui/core/BusyIndicator",
	"sap/ui/core/mvc/Controller"], function (BaseController, JSONModel, Dialog, Device, BusyIndicator, Controller) {
		"use strict";

		var _views = {};

		var BaseLayout = BaseController.extend("lifebook.view.baseLayout.BaseLayout", {

			onInit: function (oEvent) {

				this.hideSideContent(); // initially
				this.deviceSetup();
			},

			onBeforeRendering: function (oEvent) {
				if (this.isMobileOrTabletPortrait()) {
					this.hideMasterPage();
				}
			},

			isMobileOrTabletPortrait: function () {
				return (Device.system.phone || (Device.system.tablet && Device.orientation.portrait));
			},

			setPrimaryHeaderView: function (options) {
				options = jQuery.extend({
					targetId: "outerPage"
				}, options);
				return this._loadViewIntoHeaderTarget(options);
			},

			setSecondaryHeaderView: function (options) {
				options = jQuery.extend({
					targetId: "innerPage"
				}, options);
				return this._loadViewIntoHeaderTarget(options);
			},

			setMasterPage: function (options) {
				options = jQuery.extend({
					targetId: "masterPageContainer"
				}, options);
				return this._loadViewIntoContentTarget(options);
			},

			setMasterHeaderView: function (sViewId) {

			},

			setDetailPage: function (options) {
				options = jQuery.extend({
					targetId: "detailPageContainer"
				}, options);
				return this._loadViewIntoContentTarget(options);
			},

			setDetailHeaderView: function (options) {
				options = jQuery.extend({
					targetId: "detailPage"
				}, options);
				return this._loadViewIntoHeaderTarget(options);
			},

			setSideContentPage: function (oSideContentView, sTitleKey) {


				var that = this;
				this.getOwnerComponent().loadView({
					viewName: "lifebook.view.baseLayout.BaseSideContentLayout",
					parentView: this.getView()
				}).then(function (oBaseSideContentLayoutView) {
					oBaseSideContentLayoutView.getController().setSideContentView(oSideContentView);
					oBaseSideContentLayoutView.getController().setSideContentTitle(sTitleKey);

					that.getView().byId("sideContentPageContainer").removeAllContent();
					that.getView().byId("sideContentPageContainer").addContent(oBaseSideContentLayoutView);

					that.showSideContent();
				})
			},

			showSideContent: function () {

				var model = this.getModel("meta");
				if (!model) {
					model = new JSONModel();
					this.setModel(model, "meta");
				}

				if (Device.system.tablet && Device.orientation.landscape) {
					model.setProperty("/showSideContent", true);
					model.setProperty("/showSideContentSpace", true);
					model.setProperty("/showMainContent", true);

				} else if (Device.system.phone || (Device.system.tablet && Device.orientation.portrait)) {
					model.setProperty("/showSideContent", true);
					model.setProperty("/showSideContentSpace", true);
					model.setProperty("/showMainContent", false);

				} else {
					model.setProperty("/showSideContent", true);
					model.setProperty("/showSideContentSpace", true);
					model.setProperty("/showMainContent", true);

				}

			},

			deviceSetup: function () {

				if (Device.system.tablet && Device.orientation.landscape) {
					this.getModel("meta").setProperty("/showDetailHeader", false)
				} else if (Device.system.phone || (Device.system.tablet && Device.orientation.portrait)) {
					this.getModel("meta").setProperty("/showDetailHeader", false)
				} else {
					this.getModel("meta").setProperty("/showDetailHeader", true)
				}

			},

			hideSideContent: function () {

				var model = this.getModel("meta");
				if (!model) {
					model = new JSONModel();
					this.setModel(model, "meta");
				}

				if (Device.system.tablet && Device.orientation.landscape) {
					model.setProperty("/showSideContent", false);
					model.setProperty("/showSideContentSpace", false);
					model.setProperty("/showMainContent", true);

				} else if (Device.system.phone || (Device.system.tablet && Device.orientation.portrait)) {
					model.setProperty("/showSideContent", false);
					model.setProperty("/showSideContentSpace", false);
					model.setProperty("/showMainContent", true);

				} else {
					model.setProperty("/showSideContent", false);
					model.setProperty("/showSideContentSpace", true);
					model.setProperty("/showMainContent", true);
				}


			},

			loadViewAsDialog: function (oView, sTitleKey) {
				var oDialog = new Dialog({});
				oDialog.setContentHeight("400px");
				oDialog.removeAllContent();
				oDialog.addContent(oView.getContent());
				return oDialog;
			},

			hideMasterPage: function () {

				var oSplitContainer = this.getView().byId("splitContainer");

				if (Device.system.phone) {
					var oDetail = oSplitContainer.getDetailPages()[0];
					oSplitContainer.toDetail(oDetail);

				} else if (Device.system.tablet) {
					oSplitContainer.hideMaster();

				}

			},

			showMasterPage: function () {

				var oSplitContainer = this.getView().byId("splitContainer");

				if (Device.system.phone) {
					var oMaster = oSplitContainer.getMasterPages()[0];
					oSplitContainer.backMaster(oMaster);

				} else if (Device.system.tablet) {
					oSplitContainer.hideMaster();
					oSplitContainer.showMaster();
				}

			},

			toggleMasterPage: function () {
				var oSplitContainer = this.getView().byId("splitContainer");

				if (oSplitContainer.isMasterShown()) {
					this.hideMasterPage();
				} else {
					this.showMasterPage();
				}
			},

			_loadViewIntoContentTarget: function (options) {

				var that = this;
				var p = new Promise(function (resolve, reject) {
					if (_views[options.viewName]) {
						that.getView().byId(options.targetId).removeAllContent();
						that.getView().byId(options.targetId).addContent(_views[options.viewName]);
						resolve(_views[options.viewName]);
					} else {

						var parentView = that.getView(); // default
						if (options.parentView) {
							parentView = options.parentView;
						}

						that.getOwnerComponent().loadView({
							viewName: options.viewName,
							parentView: parentView
						}).then(function (oView) {
							_views[options.viewName] = oView;
							that.getView().byId(options.targetId).removeAllContent();
							that.getView().byId(options.targetId).addContent(oView);
							resolve(oView);
						});
					}
				})
				return p;
			},

			_loadViewIntoHeaderTarget: function (options) {

				var that = this;
				var p = new Promise(function (resolve, reject) {
					if (_views[options.viewName]) {
						that.getView().byId(options.targetId).removeAllHeaderContent();
						that.getView().byId(options.targetId).addHeaderContent(_views[options.viewName].getContent()[0]);
						resolve(_views[options.viewName]);
					} else {

						var parentView = that.getView(); // default
						if (options.parentView) {
							parentView = options.parentView;
						}

						that.getOwnerComponent().loadView({
							viewName: options.viewName,
							parentView: parentView
						}).then(function (oView) {
							_views[options.viewName] = oView;
							that.getView().byId(options.targetId).removeAllHeaderContent();
							that.getView().byId(options.targetId).addHeaderContent(oView.getContent()[0]);
							resolve(oView);
						});
					}
				})
				return p;
			},

			_loadFragment: function (options) {
				var that = this;
				var p = new Promise(function (resolve, reject) {
					that.getOwnerComponent().loadFragment({
						name: options.name,
						parentView: that.getView()
					}).then(function (oView) {
						resolve(oView);
					});
				})
				return p;
			}

		});

		return BaseLayout;

	});
