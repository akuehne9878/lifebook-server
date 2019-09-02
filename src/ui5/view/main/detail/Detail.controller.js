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


        this.setViewMode("preview");

        var converter = new showdown.Converter();
        converter.setOption("tables", true);
        this._converter = converter;

      },

      getShowdownConverter: function () {
        return this._converter;
      },

      onAfterRendering: function (oEvent) {
      },

      onShowMaster() {
        this.getController("lifebook.layout.Layout").showMaster();
      },

      onSelectTab: function (oEvent) {
        var key = oEvent.getParameter("selectedKey");
        this.setViewMode(key);
      },

      onOpenDialog: function () {
        var oView = this.getView();

        var that = this;
        // create dialog lazily
        if (!that._fileUploadDialog) {
          // load asynchronous XML fragment
          Fragment.load({
            name: "lifebook.view.FileUpload",
            controller: this
          }).then(function (oDialog) {
            that._fileUploadDialog = oDialog;

            // connect dialog to the root view of this component (models, lifecycle)
            oView.addDependent(oDialog);
            oDialog.open();
          });
        } else {
          that._fileUploadDialog.open();
        }
      },

      onCloseDialog: function () {
        this._fileUploadDialog.close();
      },

      handleUploadComplete: function (oEvent) {
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

      reloadPage: function (sPath) {

        var model = new RestModel();

        var that = this;
        model.loadPage({ path: sPath }).then(function (data) {
          that.getModel("currPage").setProperty("/", data);

          that._setMarkdownContent("htmlViewer", data.content);
        });
      },

      _setMarkdownContent: function(sId, sMarkdownContent) {

        var currPage = this.getModel("currPage").getData();
        var lifebookName = this.getModel("tree").getData().name;

        var html = this.getShowdownConverter().makeHtml(sMarkdownContent);
        html = html.split("./").join("/" + lifebookName + "/" + currPage.path + "/");

        var htmlViewer = this.getView().byId(sId);
        htmlViewer.removeAllItems();

        var control = new sap.ui.core.HTML({ content: html });
        htmlViewer.addItem(control);
      },


      onShowEditMenu: function (oEvent) {

        var oButton = oEvent.getSource();

        // create popover
        if (!this._oPopover) {
          Fragment.load({
            name: "lifebook.view.main.detail.EditMenu",
            controller: this
          }).then(function (pPopover) {
            this._oPopover = pPopover;
            this.getView().addDependent(this._oPopover);
            this._oPopover.openBy(oButton);
          }.bind(this));
        } else {
          this._oPopover.openBy(oButton);
        }
      },


      onLiveChange: function(oEvent) {
        this._setMarkdownContent("editorPreview", oEvent.getParameter("value"));
      },


      onUploadPress: function (oEvent) {
        var oFileUploader = sap.ui.getCore().byId("fileUploader");
        oFileUploader.upload();
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

      onSavePage: function (oEvent) {
        var oRestModel = new RestModel();
        var currPage = this.getModel("currPage")
          .getData();
        var that = this;
        oRestModel.savePage({ path: currPage.path, title: currPage.title, content: currPage.content }).then(function (data) {
         
          that._setMarkdownContent("htmlViewer", currPage.content);
         

          that.setViewMode("preview");
        });
      },

      onDeletePage: function (oEvent) {

        this._oPopover.close();

        var oRestModel = new RestModel();
        var currPage = this.getView()
          .getModel("currPage")
          .getData();

        var that = this;
        MessageBox.confirm(currPage.title + " löschen?", {
          actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.DELETE],
          title: "Seite löschen",
          onClose: function (sAction) {
            if (sAction === sap.m.MessageBox.Action.DELETE) {
              oRestModel.deletePage({ path: currPage.path }).then(function (data) {
                that.getController("lifebook.view.main.master.Master")._prepareLifebookModel(data);
                that
                  .getView()
                  .getModel("tree")
                  .setProperty("/", data);

              });
            }
          }
        });
      },


      onShowUpload: function (oEvent) {
        this._loadSideContentView("lifebook.view.main.detail.upload.Upload");
      },

      onShowEdit: function (oEvent) {
        this._oPopover.close();
        this._loadSideContentView("lifebook.view.main.detail.edit.Edit");
      },

      onShowNew: function (oEvent) {
        this._loadSideContentView("lifebook.view.main.detail.new.New");
      },

      onShowCopy: function (oEvent) {
        this._oPopover.close();
        this._loadSideContentView("lifebook.view.main.detail.copy.Copy");
      },

      onShowMove: function (oEvent) {
        this._oPopover.close();
        this._loadSideContentView("lifebook.view.main.detail.move.Move");
      },

      setViewMode: function (sViewMode) {
        var model = this.getOwnerComponent().getModel("detailHeader");

        if (sViewMode === "preview") {
          model.setProperty("/newButton", true);
          model.setProperty("/editButton", true);
          model.setProperty("/uploadButton", false);
          model.setProperty("/copyButton", true);
          model.setProperty("/moveButton", true);
          model.setProperty("/deleteButton", true);
          model.setProperty("/saveButton", false);

        } else if (sViewMode === "edit") {
          model.setProperty("/newButton", false);
          model.setProperty("/editButton", false);
          model.setProperty("/uploadButton", false);
          model.setProperty("/copyButton", false);
          model.setProperty("/moveButton", false);
          model.setProperty("/deleteButton", false);
          model.setProperty("/saveButton", true);

        } else if (sViewMode === "attachments") {
          model.setProperty("/newButton", false);
          model.setProperty("/editButton", false);
          model.setProperty("/uploadButton", true);
          model.setProperty("/copyButton", false);
          model.setProperty("/moveButton", false);
          model.setProperty("/deleteButton", false);
          model.setProperty("/saveButton", false);
        }

        model.refresh();

      },


      _loadSideContentView: function (sView) {
        var pView = this.getOwnerComponent().loadView({ namespace: sView, parentView: this.getView() });



        var that = this;
        pView.then(function (oView) {
          that.getController("lifebook.layout.Layout").setSideContentView(oView);
        });
      }



    });
  }
);
