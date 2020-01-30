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
    "sap/base/Log",
    "sap/ui/core/format/NumberFormat"
  ],
  function (BaseController, RestModel, jQuery, MessageBox, JSONModel, MessageToast, Fragment, Controller, Log, NumberFormat) {
    return BaseController.extend("lifebook.view.main.detail.page.section.markdown.Markdown", {

      onInit: function (oEvent) {
        this.getOwnerComponent().registerController(this);

        this.setModel(new JSONModel({ html: "" }), "showdown");

        var converter = new showdown.Converter();
        converter.setOption("tables", true);
        converter.setOption("emoji", true);
        this._converter = converter;
      },

      getShowdownConverter: function () {
        return this._converter;
      },

      setup: function() {
        var content = this.getModel("currPage").getData().content;
        this.setMarkdownContent("htmlViewer", content);
      },

      setMarkdownContent: function (sId, sMarkdownContent) {

        var currPage = this.getModel("currPage").getData();
        var lifebookName = this.getModel("tree").getData().name;

        var htmlStr = this.getShowdownConverter().makeHtml(sMarkdownContent);
        htmlStr = htmlStr.split("./").join("/" + lifebookName + "/" + currPage.path + "/");

        this.getModel("currPage").setProperty("/html", htmlStr);

        var htmlViewer = this.getView().byId(sId);
        $("#" + htmlViewer.getId()).html(htmlStr);
      },


      onLiveChange: function (oEvent) {
        this.setMarkdownContent("htmlViewer", oEvent.getParameter("value"));
      },

    });
  }
);
