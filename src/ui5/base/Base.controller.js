sap.ui.define(["sap/ui/model/json/JSONModel", "sap/ui/core/mvc/Controller"], function(JSONModel, Controller) {
  return Controller.extend("lifebook.base.Base", {
    onInit: function(oEvent) {
      this.getOwnerComponent().registerController(this);
    },

    getSplitContainer: function() {
      return this.getView().byId("splitApp");
    },

    getMainDynamicSideConent: function() {
      return this.getView().byId("mainDSC");
    },

    getDynamicSideConent: function() {
      return this.getView().byId("dsc");
    },

    setMasterView: function(oView) {
      oView.setHeight("100%");

      this.getMainDynamicSideConent().removeAllSideContent();
      this.getMainDynamicSideConent().addSideContent(oView);
      this.getMainDynamicSideConent().setShowSideContent(true);
    },

    setDetailView: function(oView) {
      oView.setHeight("100%");

      this.getDynamicSideConent().removeAllMainContent();
      this.getDynamicSideConent().addMainContent(oView);
      this.getDynamicSideConent().setShowSideContent(false);
    },

    setSideContentView: function(oView) {
      oView.setHeight("100%");

      this.getDynamicSideConent().removeAllSideContent();
      this.getDynamicSideConent().addSideContent(oView);
      this.getDynamicSideConent().setShowSideContent(true);
    },

    closeSideContent: function() {
      this.getDynamicSideConent().setShowSideContent(false);
    },

    showMaster: function() {
      this.getMainDynamicSideConent().setShowSideContent(true);
    },

    hideMaster: function() {
      this.getMainDynamicSideConent().setShowSideContent(false);
    },

    deviceSetup: function() {
      if (this.getOwnerComponent().isPhone()) {
        this.hideMaster();
      }
    }
  });
});
