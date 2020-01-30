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
    return BaseController.extend("lifebook.view.main.detail.page.section.attachments.Attachments", {

      onInit: function (oEvent) {
        this.getOwnerComponent().registerController(this);
      },

      onPress: function (oEvent) {

        this.unselectAllAttachments();
        var oBindingContext = oEvent.getSource().getBindingContext("currPage");
        oBindingContext.getModel().setProperty(oBindingContext.getPath() + "/selected", true);

        var currObject = oBindingContext.getObject();
        this.getOwnerComponent().getModel("currAttachment").setProperty("/", currObject);
        // this.getController("lifebook.view.gallery.Gallery").setStartIndex(parseInt(oBindingContext.getPath().replace("/files/", ""), 10));

        var sideContent = "lifebook.view.main.sidecontent.attachment.AttachmentDefault";


        if (currObject.type === "PDF") {
          sideContent = "lifebook.view.main.sidecontent.attachment.AttachmentPdf";
        } else if (currObject.type === "JPG") {
          sideContent = "lifebook.view.main.sidecontent.attachment.AttachmentImage";
        } else if (currObject.type === "MP4") {
          sideContent = "lifebook.view.main.sidecontent.attachment.AttachmentVideo";
        } else if (currObject.type === "STL") {
          sideContent = "lifebook.view.main.sidecontent.attachment.AttachmentSTL";
        }

        var mainController = this.getController("lifebook.view.main.Main");
        mainController.setViewMode("singleAttachment");
        mainController._changeSideContent(sideContent, currObject.name);

      },



      onSelectionChange: function (oEvent) {

        var mainController = this.getController("lifebook.view.main.Main");

        var selectedAttachments = this.getSelectedAttachments();
        this.getOwnerComponent().getModel("selectedAttachments").setProperty("/", selectedAttachments);

        if (selectedAttachments.length === 0) {
          // close
          this.getModel("mdsPage").setProperty("/showSideContent", false);
          this.getOwnerComponent().getModel("currAttachment").setProperty("/", null);

          mainController.setViewMode("view");
        } else if (selectedAttachments.length === 1) {
          // load single

          var oBindingContext = oEvent.getSource().getBindingContext("currPage");

          var currObject = selectedAttachments[0];
          this.getOwnerComponent().getModel("currAttachment").setProperty("/", currObject);
          // this.getController("lifebook.view.gallery.Gallery").setStartIndex(parseInt(oBindingContext.getPath().replace("/files/", ""), 10));
          
          var sideContent = "lifebook.view.main.detail.sidecontent.AttachmentDefault";

          if (currObject.type === "PDF") {
            sideContent = "lifebook.view.main.detail.sidecontent.AttachmentPdf";
          } else if (currObject.type === "JPG") {
            sideContent = "lifebook.view.main.detail.sidecontent.AttachmentImage";
          } else if (currObject.type === "MP4") {
            sideContent = "lifebook.view.main.detail.sidecontent.AttachmentVideo";
          } else if (currObject.type === "STL") {
            sideContent = "lifebook.view.main.detail.sidecontent.AttachmentSTL";
          }

          mainController.setViewMode("singleAttachment");
          mainController._changeSideContent(sideContent, currObject.name);
        } else {
          // load multiple
          mainController.setViewMode("selection");
          mainController._changeSideContent("lifebook.view.main.sidecontent.attachment.AttachmentMultiple", "");
        }

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


      getSelectedAttachments: function () {
        var data = this.getModel("currPage").getData();
        return data.files.filter(function (item) {
          return item.selected === true;
        });
      },


      unselectAllAttachments() {
        var data = this.getModel("currPage").getData();
        data.files.forEach(function (item) {
          item.selected = false;
        })
        this.getModel("currPage").setProperty("/", data);
      },

    });
  }
);
