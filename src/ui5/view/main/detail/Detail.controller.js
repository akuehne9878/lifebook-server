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
    "sap/base/Log"
  ],
  function (BaseController, RestModel, jQuery, MessageBox, JSONModel, MessageToast, Fragment, Controller, Log) {
    return BaseController.extend("lifebook.view.main.detail.Detail", {



      onInit: function (oEvent) {
        this.getView().setModel(new JSONModel({ newLifebook: false, viewMode: true }), "meta");

        this.setModel(new JSONModel({ html: "" }), "showdown");

        var converter = new showdown.Converter();
        converter.setOption("tables", true);
        this._converter = converter;

        this.getOwnerComponent().registerController(this);
      },

      getShowdownConverter: function () {
        return this._converter;
      },

      reloadPage: function (sPath) {
        var model = new RestModel();
        var that = this;
        model.loadPage({ path: sPath }).then(function (data) {

          data.files.forEach(function (item) {
            item.selected = false;
          });

          that.getModel("currPage").setProperty("/", data);
          that._setMarkdownContent("htmlViewer", data.content);
        });
      },

      _setMarkdownContent: function (sId, sMarkdownContent) {

        var currPage = this.getModel("currPage").getData();
        var lifebookName = this.getModel("tree").getData().name;

        var htmlStr = this.getShowdownConverter().makeHtml(sMarkdownContent);
        htmlStr = htmlStr.split("./").join("/" + lifebookName + "/" + currPage.path + "/");

        this.getModel("currPage").setProperty("/html", htmlStr);

        var htmlViewer = this.getView().byId(sId);
        $("#" + htmlViewer.getId()).html(htmlStr);
      },


      onLiveChange: function (oEvent) {
        this._setMarkdownContent("htmlViewer", oEvent.getParameter("value"));
      },


      onDownloadAttachment: function (oEvent) {
        var that = this;
        var oBindingContext = oEvent.getSource().getBindingContext("currPage");

        var oObj = oBindingContext.getObject();

        var path = decodeURIComponent(
          this.getModel("currPage")
            .getProperty("/path")
        );
        window.open(path + "/" + oObj.name, "_blank");
      },

      onPress: function (oEvent) {

        this.unselectAllAttachments();
        var oBindingContext = oEvent.getSource().getBindingContext("currPage");
        oBindingContext.getModel().setProperty(oBindingContext.getPath() + "/selected", true);

        var currObject = oBindingContext.getObject();
        this.getOwnerComponent().getModel("currAttachment").setProperty("/", currObject);

        var sideContent = "lifebook.view.main.detail.attachment.AttachmentDefault";

        if (currObject.type === "PDF") {
          sideContent = "lifebook.view.main.detail.attachment.AttachmentPdf";
        } else if (currObject.type === "JPG") {
          sideContent = "lifebook.view.main.detail.attachment.AttachmentImage";
        }

        var mainController = this.getController("lifebook.view.main.Main");
        mainController.setViewMode("singleAttachment");
        mainController._changeSideContent(sideContent, currObject.name);

      },

      

      onSelectionChange: function(oEvent) {

        var mainController = this.getController("lifebook.view.main.Main");

        var selectedAttachments = this.getSelectedAttachments();
        if (selectedAttachments.length === 0) {
          // close
          this.getModel("mdsPage").setProperty("/showSideContent", false);
          this.getOwnerComponent().getModel("currAttachment").setProperty("/", null);

          mainController.setViewMode("view");
        } else if (selectedAttachments.length === 1) {
          // load single

          var currObject = selectedAttachments[0];
          this.getOwnerComponent().getModel("currAttachment").setProperty("/", currObject);

          var sideContent = "lifebook.view.main.detail.attachment.AttachmentDefault";

          if (currObject.type === "PDF") {
            sideContent = "lifebook.view.main.detail.attachment.AttachmentPdf";
          } else if (currObject.type === "JPG") {
            sideContent = "lifebook.view.main.detail.attachment.AttachmentImage";
          }
  
          mainController.setViewMode("singleAttachment");
          mainController._changeSideContent(sideContent, currObject.name);
        } else {
          // load multiple
          mainController.setViewMode("selection");
          mainController._changeSideContent("lifebook.view.main.detail.attachment.AttachmentMultiple", "");
        }

      },


      getSelectedAttachments: function() {
        var data = this.getModel("currPage").getData();
        return data.files.filter(function(item){
          return item.selected === true;
        });
      },


      unselectAllAttachments() {
        var data = this.getModel("currPage").getData();
        data.files.forEach(function(item){
          item.selected = false;
        })
        this.getModel("currPage").setProperty("/", data);
      }

    });
  }
);
