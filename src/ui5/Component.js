sap.ui.define(["sap/ui/Device", "sap/ui/core/UIComponent", "sap/ui/model/json/JSONModel", "sap/ui/model/resource/ResourceModel"], function(Device, UIComponent, JSONModel, ResourceModel) {
  return UIComponent.extend("lifebook.Component", {
    init: function() {
      // call the init function of the parent
      UIComponent.prototype.init.apply(this, arguments);

      this.setModel(new JSONModel(Device), "device");

      window.ownerComponent = this;
      this._controllers = {};

      this.setModel(new JSONModel(), "currPage");
      this.setModel(new JSONModel(), "tree");
    },

    isPhone: function() {
      return this.getModel("device").getProperty("/system/phone");
    },

    registerController: function(oController) {
      var sName = oController.getMetadata().getName();
      this._controllers[sName] = oController;
    },

    getController: function(sName) {
      return this._controllers[sName];
    },

    loadView: function(sNamespace, oParentView) {
      var that = this;
      var promise = new Promise(function(resolve, reject) {
        that.runAsOwner(function() {
          sap.ui
            .view({
              viewName: sNamespace,
              type: sap.ui.core.mvc.ViewType.XML,
              async: true
            })
            .loaded()
            .then(function(oView) {
              that.registerController(oView.getController());
              if (oParentView) {
                oParentView.addDependent(oView);
              }
              resolve(oView);
            });
        });
      });
      return promise;
    }
  });
});
