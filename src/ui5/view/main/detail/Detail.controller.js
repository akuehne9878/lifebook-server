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
        converter.setOption("emoji", true);


        this._converter = converter;

        this.getOwnerComponent().registerController(this);

      },


      onNavigateToChildPage: function (oEvent) {
        var object = oEvent.getSource().getBindingContext("currPage").getObject();

        var currPath = this.getOwnerComponent().getModel("currPage").getData().path;

        this.getController("lifebook.view.main.master.Master")._navToPage(currPath + "\\" + object.name);

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

          var views = [];
          that.setModel(new JSONModel(views), "views");

          if (data.metainfo.views && data.metainfo.views.length > 0) {



            data.metainfo.views.forEach(function (view) {

              var sqlModel = new RestModel();
              sqlModel.executeStatement({ statement: view.statement }).then(function () {

                if (sqlModel.getProperty("/error")) {
                  MessageBox.show(sqlModel.getProperty("/error"), {
                    icon: MessageBox.Icon.ERROR,
                    title: "Fehler",
                    actions: [MessageBox.Action.OK]
                  });
                } else {

                  var obj = {};
                  var keys = Object.keys(sqlModel.getProperty("/0/"))
                  obj.columns = keys.map(function (item) {
                    return { name: item };
                  })

                  var items = sqlModel.getProperty("/").map(function (item) {
                    var obj = {};
                    obj.cells = keys.map(function (key) {
                      return { value: item[key] };
                    });
                    return obj;
                  });
                  obj.items = items;
                  obj.title = view.title;

                  views.push(obj);
                  that.setModel(new JSONModel(views), "views");
                }
              })
            });

          }

          that.getController("lifebook.view.main.Main").setViewMode("view");

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
        // this.getController("lifebook.view.gallery.Gallery").setStartIndex(parseInt(oBindingContext.getPath().replace("/files/", ""), 10));

        var sideContent = "lifebook.view.main.detail.attachment.AttachmentDefault";

        if (currObject.type === "PDF") {
          sideContent = "lifebook.view.main.detail.attachment.AttachmentPdf";
        } else if (currObject.type === "JPG") {
          sideContent = "lifebook.view.main.detail.attachment.AttachmentImage";
        } else if (currObject.type === "MP4") {
          sideContent = "lifebook.view.main.detail.attachment.AttachmentVideo";
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

          var sideContent = "lifebook.view.main.detail.attachment.AttachmentDefault";

          if (currObject.type === "PDF") {
            sideContent = "lifebook.view.main.detail.attachment.AttachmentPdf";
          } else if (currObject.type === "JPG") {
            sideContent = "lifebook.view.main.detail.attachment.AttachmentImage";
          } else if (currObject.type === "MP4") {
            sideContent = "lifebook.view.main.detail.attachment.AttachmentVideo";
          }

          mainController.setViewMode("singleAttachment");
          mainController._changeSideContent(sideContent, currObject.name);
        } else {
          // load multiple
          mainController.setViewMode("selection");
          mainController._changeSideContent("lifebook.view.main.detail.attachment.AttachmentMultiple", "");
        }

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
      }

    });
  }
);
