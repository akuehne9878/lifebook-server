sap.ui.define([
    "lifebook/model/RestModel",
    "lifebook/view/BaseController.controller",
    "sap/m/MessageBox",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/BusyIndicator",
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/mvc/View"], function (RestModel, BaseController, MessageBox, Device, JSONModel, BusyIndicator, Controller, View) {
        "use strict";


        return BaseController.extend("lifebook.view.main.Main", {

            onInit: function (oEvent) {
                this.getOwnerComponent().registerController(this);
                this.getOwnerComponent().getRouter().getRoute("page").attachPatternMatched(this.handlePage, this);

                this.setModel(new JSONModel({
                    newPage: true,
                    renamePage: true,
                    editor: true,
                    copyPage: true,
                    movePage: true,
                    deletePage: true,
                    upload: true,
                    savePage: false,
                    cancelEditor: false,
                    copyAttachment: false,
                    moveAttachment: false,
                    deleteAttachment: false,
                    renameAttachment: false,
                    copySelection: false,
                    moveSelection: false,
                    deleteSelection: false,
                }), "toolbar");
            },

            setViewMode: function (sViewMode) {
                var model = this.getModel("toolbar");

                if (sViewMode === "view") {
                    model.setProperty("/newPage", true);
                    model.setProperty("/renamePage", true);
                    model.setProperty("/editor", true);
                    model.setProperty("/copyPage", true);
                    model.setProperty("/movePage", true);
                    model.setProperty("/deletePage", true);
                    model.setProperty("/upload", true);
                    model.setProperty("/savePage", false);
                    model.setProperty("/cancelEditor", false);

                    model.setProperty("/copyAttachment", false);
                    model.setProperty("/moveAttachment", false);
                    model.setProperty("/deleteAttachment", false);
                    model.setProperty("/renameAttachment", false);

                    model.setProperty("/copySelection", false);
                    model.setProperty("/moveSelection", false);
                    model.setProperty("/deleteSelection", false);

                } else if (sViewMode === "edit") {
                    model.setProperty("/newPage", false);
                    model.setProperty("/renamePage", false);
                    model.setProperty("/editor", false);
                    model.setProperty("/copyPage", false);
                    model.setProperty("/movePage", false);
                    model.setProperty("/deletePage", false);
                    model.setProperty("/upload", false);
                    model.setProperty("/savePage", true);
                    model.setProperty("/cancelEditor", true);

                    model.setProperty("/copyAttachment", false);
                    model.setProperty("/moveAttachment", false);
                    model.setProperty("/deleteAttachment", false);
                    model.setProperty("/renameAttachment", false);

                    model.setProperty("/copySelection", false);
                    model.setProperty("/moveSelection", false);
                    model.setProperty("/deleteSelection", false);

                } else if (sViewMode === "singleAttachment") {
                    model.setProperty("/newPage", false);
                    model.setProperty("/renamePage", false);
                    model.setProperty("/editor", false);
                    model.setProperty("/copyPage", false);
                    model.setProperty("/movePage", false);
                    model.setProperty("/deletePage", false);
                    model.setProperty("/upload", false);
                    model.setProperty("/savePage", false);
                    model.setProperty("/cancelEditor", false);

                    model.setProperty("/copyAttachment", true);
                    model.setProperty("/moveAttachment", true);
                    model.setProperty("/deleteAttachment", true);
                    model.setProperty("/renameAttachment", true);

                    model.setProperty("/copySelection", false);
                    model.setProperty("/moveSelection", false);
                    model.setProperty("/deleteSelection", false);

                } else if (sViewMode === "selection") {
                    model.setProperty("/newPage", false);
                    model.setProperty("/renamePage", false);
                    model.setProperty("/editor", false);
                    model.setProperty("/copyPage", false);
                    model.setProperty("/movePage", false);
                    model.setProperty("/deletePage", false);
                    model.setProperty("/upload", false);
                    model.setProperty("/savePage", false);
                    model.setProperty("/cancelEditor", false);

                    model.setProperty("/copyAttachment", false);
                    model.setProperty("/moveAttachment", false);
                    model.setProperty("/deleteAttachment", false);
                    model.setProperty("/renameAttachment", false);

                    model.setProperty("/copySelection", true);
                    model.setProperty("/moveSelection", true);
                    model.setProperty("/deleteSelection", true);
                }
            },

            handlePage: function () {

                var path = null;
                if (arguments.length > 0) {
                    path = arguments[0].getParameter("arguments").path;
                }

                if (path) {
                    this.getController("lifebook.view.main.detail.Detail").reloadPage(path);
                }
            },

            _changeSideContent: function (sViewName, sTitle) {
                this.getModel("mdsPage").setProperty("/sideContentViewName", sViewName);
                this.getModel("mdsPage").setProperty("/sideContentTitle", sTitle);
                this.getModel("mdsPage").setProperty("/showSideContent", true);
            },

            onShowNewPage: function (oEvent) {
                this._changeSideContent("lifebook.view.main.detail.new.New", "Neue Seite");
            },

            onShowRenamePage: function (oEvent) {
                this._changeSideContent("lifebook.view.main.detail.edit.Edit", "Seite umbenennen");
                this.getController("lifebook.view.main.detail.edit.Edit").setup();
            },

            onShowMovePage: function (oEvent) {
                this._changeSideContent("lifebook.view.main.detail.move.Move", "Seite verschieben");
            },

            onShowCopyPage: function (oEvent) {
                this._changeSideContent("lifebook.view.main.detail.copy.Copy", "Seite kopieren");

            },

            onShowUpload: function (oEvent) {
                this._changeSideContent("lifebook.view.main.detail.upload.Upload", "Upload");
            },

            onShowEditor: function (oEvent) {
                this.setViewMode("edit");
                this.getModel("mdsPage").setProperty("/showSideContent", false);
            },

            onCancelEditor: function (oEvent) {
                this.setViewMode("view");
            },

            onSavePage: function (oEvent) {
                var model = new RestModel();
                var that = this;
                model.savePage(this.getModel("currPage").getData()).then(function (data) {
                    that.setViewMode("view");
                });
            },

            onDeletePage: function (oEvent) {
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
                                that
                                    .getView()
                                    .getModel("tree")
                                    .setProperty("/", data);

                            });
                        }
                    }
                });
            },





            onShowRenameAttachment: function (oEvent) {
                this._changeSideContent("lifebook.view.main.detail.attachments.edit.Edit", "Attachment umbenennen");
                this.getController("lifebook.view.main.detail.attachments.edit.Edit").setup();
            },

            onShowMoveAttachment: function (oEvent) {
                this._changeSideContent("lifebook.view.main.detail.attachments.move.Move", "Attachment verschieben");
            },

            onShowCopyAttachment: function (oEvent) {
                this._changeSideContent("lifebook.view.main.detail.attachments.copy.Copy", "Attachment kopieren");
            },

            onDeleteAttachment: function (oEvent) {
                var currPage = this.getView()
                    .getModel("currPage")
                    .getData();

                var currAttachment = this.getModel("currAttachment").getData();

                var that = this;
                MessageBox.confirm(currAttachment.name + " löschen?", {
                    actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.DELETE],
                    title: "Attachment löschen",
                    onClose: function (sAction) {
                        if (sAction === sap.m.MessageBox.Action.DELETE) {
                            var oRestModel = new RestModel();
                            oRestModel.deleteFile({ path: currPage.path, name: currAttachment.name }).then(function (data) {
                                that.getModel("currPage").setProperty("/", oRestModel.getData());
                                that.getModel("mdsPage").setProperty("/showSideContent", false);
                            });
                        }
                    }
                });
            },

            onAfterCloseSideContent: function (oEvent) {
                var name = oEvent.getParameter("value").getControllerName();

                if (name.indexOf("lifebook.view.main.detail.attachment") === 0) {
                    this.getModel("currAttachment").setProperty("/", null);
                    this.getController("lifebook.view.main.detail.Detail").unselectAllAttachments();
                }
            }

        });
    });
