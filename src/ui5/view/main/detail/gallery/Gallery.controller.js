sap.ui.define(
  [
    "lifebook/view/BaseController.controller",
    "lifebook/model/RestModel",
    "jquery.sap.global",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/core/mvc/Controller",
    "sap/m/PDFViewer",
    "sap/base/Log"
  ],
  function (BaseController, RestModel, jQuery, MessageBox, JSONModel, MessageToast, Fragment, Controller, PDFViewer, Log) {
    return BaseController.extend("lifebook.view.main.detail.attachments.Attachments", {
      onInit: function (oEvent) {
        this.getView().setModel(new JSONModel({}), "meta");

        this._pdfViewer = new PDFViewer();
        this.getView().addDependent(this._pdfViewer);
      },

      onShowUpload: function (oEvent) {
        this._loadSideContentView("lifebook.view.main.detail.upload.Upload", "Upload");
      },

      onDeleteFile: function (oEvent) {
        var currFile = oEvent
          .getSource()
          .getParent()
          .getParent()
          .getParent()
          .getParent()
          .getBindingContext("currPage")
          .getObject();

        var currPage = this.getView()
          .getModel("currPage")
          .getData();

        var that = this;
        MessageBox.confirm(currFile.name + " löschen?", {
          actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.DELETE],
          title: "Attachment löschen",
          onClose: function (sAction) {
            if (sAction === sap.m.MessageBox.Action.DELETE) {
              var oRestModel = new RestModel();
              oRestModel.deleteFile({ path: currPage.path, name: currFile.name }).then(function (data) {
                that.getModel("currPage").setProperty("/", oRestModel.getData());
              });
            }
          }
        });
      },

      onDownload: function (oEvent) {
        var obj = oEvent.getSource().getBindingContext("currPage").getObject();

        var currPage = this.getView()
          .getModel("currPage")
          .getData();

        var that = this;

        window.location.href = "/api/downloadFile?path=" + currPage.path + "&" + "name=" + obj.name;

      },


      onViewPDF: function (oEvent) {

        var obj = oEvent.getSource().getBindingContext("currPage").getObject();

        var currPage = this.getView()
          .getModel("currPage")
          .getData();

        this._pdfViewer.setSource("/api/getFile?path=" + currPage.path + "&" + "name=" + obj.name);
        this._pdfViewer.setTitle(obj.name);
        this._pdfViewer.setShowDownloadButton(false);
        this._pdfViewer.open();

      },

      onCreateLink: function(oEvent) {

      }

    });
  }
);
