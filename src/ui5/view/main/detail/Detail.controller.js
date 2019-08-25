sap.ui.define(
  [
    "lifebook/view/BaseView.controller",
    "lifebook/model/RestModel",
    "jquery.sap.global",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/core/mvc/Controller",
    "sap/base/Log"
  ],
  function(BaseView, RestModel, jQuery, MessageBox, JSONModel, MessageToast, Fragment, Controller, Log) {
    return BaseView.extend("lifebook.view.main.detail.Detail", {
      onInit: function(oEvent) {
        this.getView().setModel(new JSONModel({ newLifebook: false, viewMode: true }), "meta");
      },

      onShowMaster() {
        this.getController("lifebook.base.Base").showMaster();
      },

      onOpenDialog: function() {
        var oView = this.getView();

        var that = this;
        // create dialog lazily
        if (!that._fileUploadDialog) {
          // load asynchronous XML fragment
          Fragment.load({
            name: "lifebook.view.FileUpload",
            controller: this
          }).then(function(oDialog) {
            that._fileUploadDialog = oDialog;

            // connect dialog to the root view of this component (models, lifecycle)
            oView.addDependent(oDialog);
            oDialog.open();
          });
        } else {
          that._fileUploadDialog.open();
        }
      },

      onCloseDialog: function() {
        this._fileUploadDialog.close();
      },

      handleUploadComplete: function(oEvent) {
        var sResponse = oEvent.getParameter("response");
        if (sResponse) {
          var sMsg = "";
          var m = /^\[(\d\d\d)\]:(.*)$/.exec(sResponse);
          if (m[1] == "200") {
            sMsg = "Return Code: " + m[1] + "\n" + m[2] + "(Upload Success)";
            oEvent.getSource().setValue("");
          } else {
            sMsg = "Return Code: " + m[1] + "\n" + m[2] + "(Upload Error)";
          }

          MessageToast.show(sMsg);
        }
      },

      onUploadPress: function(oEvent) {
        var oFileUploader = sap.ui.getCore().byId("fileUploader");
        oFileUploader.upload();
      },

      onDownloadAttachment: function(oEvent) {
        var that = this;
        var oBindingContext = oEvent.getSource().getBindingContext("currPage");

        var oObj = oBindingContext.getObject();

        var path = decodeURIComponent(
          this.getView()
            .getModel("currPage")
            .getProperty("/path")
        );
        window.open(path + "/" + oObj.name, "_blank");
      },

      onSavePage: function(oEvent) {
        var oRestModel = new RestModel();
        var currPage = this.getView()
          .getModel("currPage")
          .getData();
        var that = this;
        oRestModel.savePage({ path: currPage.path, title: currPage.title, content: that.getToastEditor().getValue() }).then(function(data) {
          that.getToastViewer().setValue(that.getToastEditor().getValue());
          that.onSwitchMode(oEvent);
        });
      },

      onDeletePage: function(oEvent) {
        var oRestModel = new RestModel();
        var currPage = this.getView()
          .getModel("currPage")
          .getData();

        var that = this;
        MessageBox.confirm(currPage.title + " löschen?", {
          actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.DELETE],
          title: "Seite löschen",
          onClose: function(sAction) {
            if (sAction === sap.m.MessageBox.Action.DELETE) {
              oRestModel.deletePage({ path: currPage.path }).then(function(data) {
                that.getController("lifebook.view.main.master.Master")._prepareLifebookModel(data);
                that
                  .getView()
                  .getModel("tree")
                  .setProperty("/", data);

                that.onSwitchMode(oEvent);
              });
            }
          }
        });
      }
    });
  }
);
