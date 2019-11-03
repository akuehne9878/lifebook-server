sap.ui.define(
  [
    "lifebook/view/BaseController.controller",
    "lifebook/model/RestModel",
    "jquery.sap.global",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/PDFViewer",
    "sap/ui/core/Fragment",
    "sap/ui/core/mvc/Controller",
    "sap/base/Log"
  ],
  function (BaseController, RestModel, jQuery, MessageBox, JSONModel, MessageToast, PDFViewer, Fragment, Controller, Log) {
    return BaseController.extend("lifebook.view.main.detail.attachment.Attachment", {
      onInit: function (oEvent) {
        this.getOwnerComponent().registerController(this);

        this._pdfViewer = new PDFViewer();
        this.getView().addDependent(this._pdfViewer);
      },

      setup: function () {
        this.getView().setModel(new JSONModel({ title: this.getOwnerComponent().getModel("currAttachment").getProperty("/title") }))
      },

      onDownload: function (oEvent) {
        var obj = this.getOwnerComponent().getModel("currAttachment").getData();

        var currPage = this.getView()
          .getModel("currPage")
          .getData();

        var that = this;

        window.location.href = "/api/downloadFile?path=" + currPage.path + "&" + "name=" + obj.name;

      },


      onViewPDF: function (oEvent) {

        var obj = this.getOwnerComponent().getModel("currAttachment").getData();

        var currPage = this.getView()
          .getModel("currPage")
          .getData();

        this._pdfViewer.setSource("/api/getFile?path=" + currPage.path + "&" + "name=" + obj.name);
        this._pdfViewer.setTitle(obj.name);
        this._pdfViewer.setShowDownloadButton(false);
        this._pdfViewer.open();

      },

    });
  }
);
