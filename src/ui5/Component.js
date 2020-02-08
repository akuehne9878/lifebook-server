sap.ui.define(["sap/ui/core/BusyIndicator","sap/ui/Device", "sap/ui/core/UIComponent", "sap/ui/model/json/JSONModel", "sap/ui/model/resource/ResourceModel"], function (BusyIndicator, Device, UIComponent, JSONModel, ResourceModel) {
  return UIComponent.extend("lifebook.Component", {
    metadata: {
      "includes": ["css/style.css", "css/gfm.css"], //custom css file path
    },

    init: function () {
      // call the init function of the parent
      UIComponent.prototype.init.apply(this, arguments);

      // create the views based on the url/hash
      this.getRouter().initialize();

      sap.ui.getCore().getConfiguration().setLanguage("de");


      this.setModel(new JSONModel(Device), "device");

      window.ownerComponent = this;
      this._controllers = {};

      this.setModel(new JSONModel(), "currPage");
      this.setModel(new JSONModel(), "tree");
      this.setModel(new JSONModel(), "targetTree");
      this.setModel(new JSONModel(), "detailHeader");

      this.setModel(new JSONModel(), "currAttachment");
      this.setModel(new JSONModel(), "selectedAttachments");

      this.setModel(new JSONModel({
        sideContentViewName: "",
        sideContentTitle: "",
        showSideContentSpace: !Device.system.phone,
        showSideContent: false,
        showMaster: !Device.system.phone
      }), "mdsPage");

      BusyIndicator.show();

    },

    isPhone: function () {
      return this.getModel("device").getProperty("/system/phone");
    },

    registerController: function (oController) {
      var sName = oController.getMetadata().getName();
      this._controllers[sName] = oController;
    },

    getController: function (sName) {
      return this._controllers[sName];
    },

    loadFragment: function (options) {

      var that = this;
      var promise = new Promise(function (resolve, reject) {
        sap.ui.core.Fragment.load({
          type: "XML",
          controller: options.parentView.getController(),
          name: options.namespace
        }).then(function (oFragment) {

          options.parentView.addDependent(oFragment);

          resolve(oFragment);
        });
      });

      return promise;
    },

    loadView: function (options) {
      var that = this;
      var promise = new Promise(function (resolve, reject) {
        that.runAsOwner(function () {
          sap.ui
            .view({
              viewName: options.viewName,
              type: sap.ui.core.mvc.ViewType.XML,
              async: true
            })
            .loaded()
            .then(function (oView) {
              that.registerController(oView.getController());
              if (options.parentView) {
                options.parentView.addDependent(oView);
              }
              resolve(oView);
            });
        });
      });
      return promise;
    }
  });
});
