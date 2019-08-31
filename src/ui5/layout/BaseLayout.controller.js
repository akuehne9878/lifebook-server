sap.ui.define(["sap/ui/model/json/JSONModel", "sap/ui/core/mvc/Controller"], function(JSONModel, Controller) {
  return Controller.extend("lifebook.layout.BaseLayout", {
    onInit: function(oEvent) {
      this.getOwnerComponent().registerController(this);
    },

    getMasterDetailDSC: function() {
      return this.getView().byId("masterDetailDSC");
    },

    getDetailDSC: function() {
      return this.getView().byId("detailDSC");
    },

    getMainPage: function() {
      return this.getView().byId("mainPage");
    },

    getDetailPage: function() {
      return this.getView().byId("detailPage");
    },

    getSplitContainer: function() {
      return this.getView().byId("splitContainer");
    },

    setMasterView: function(oView) {
      oView.setHeight("100%");

      this.getSplitContainer().removeAllMasterPages();
      this.getSplitContainer().addMasterPage(oView);
    },

    setDetailView: function(oView) {
      oView.setHeight("100%");

      this.getDetailDSC().removeAllMainContent();
      this.getDetailDSC().addMainContent(oView);
      this.getDetailDSC().setShowSideContent(false);
    },

    setSideContentView: function(oView) {
      oView.setHeight("100%");

      this.getDetailDSC().removeAllSideContent();
      this.getDetailDSC().addSideContent(oView);
      this.getDetailDSC().setShowSideContent(true);
    },

    hideMainHeader: function() {
      this.getMainPage().setShowHeader(false);
    },

    showMainHeader: function() {
      this.getMainPage().setShowHeader(true);
    },

    setMainHeaderView: function(oFragment) {
      this.getMainPage().setCustomHeader(oFragment);
    },

    hideDetailHeader: function() {
      this.getDetailPage().setShowHeader(false);
    },

    showDetailHeader: function() {
      this.getDetailPage().setShowHeader(true);
    },

    setDetailHeaderView: function(oFragment) {
      this.getDetailPage().setCustomHeader(oFragment);
    },

    closeSideContent: function() {
      this.getDetailDSC().setShowSideContent(false);
    },

    showMaster: function() {
      this.getMasterDetailDSC().setShowSideContent(true);
    },

    hideMaster: function() {
      this.getMasterDetailDSC().setShowSideContent(false);
    },

    deviceSetup: function() {
      if (this.getOwnerComponent().isPhone()) {
        this.hideMaster();
      }
    }
  });
});
