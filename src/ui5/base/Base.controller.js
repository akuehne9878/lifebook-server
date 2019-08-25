sap.ui.define(["sap/ui/model/json/JSONModel", "sap/ui/core/mvc/Controller"], function(JSONModel, Controller) {
  return Controller.extend("lifebook.base.Base", {
    onInit: function(oEvent) {
      this.getOwnerComponent().registerController(this);
    },

    getMasterDetailDSC: function() {
      return this.getView().byId("masterDetailDSC");
    },

    getDetailDSC: function() {
      return this.getView().byId("detailDSC");
    },

    getPage0: function() {
      return this.getView().byId("page0");
    },

    getPage1: function() {
      return this.getView().byId("page1");
    },

    setMasterView: function(oView) {
      oView.setHeight("100%");

      this.getMasterDetailDSC().removeAllSideContent();
      this.getMasterDetailDSC().addSideContent(oView);
      this.getMasterDetailDSC().setShowSideContent(true);
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

    hidePage0Header: function() {
      this.getPage0().setShowHeader(false);
    },

    showPage0Header: function() {
      this.getPage0().setShowHeader(true);
    },

    setPage0HeaderView: function(oView) {
      this.getPage0().setCustomHeader(oView.getContent()[0]);
    },

    hidePage1Header: function() {
      this.getPage1().setShowHeader(false);
    },

    showPage1Header: function() {
      this.getPage1().setShowHeader(true);
    },

    setPage1HeaderView: function(oView) {
      this.getPage1().setCustomHeader(oView.getContent()[0]);
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
