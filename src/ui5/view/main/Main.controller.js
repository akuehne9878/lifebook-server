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

                this.setModel(new JSONModel({
                }), "toolbar");

                this.setModel(new JSONModel({}), "breadcrumbs")

                this.resetViewMode();
            },

            resetViewMode: function () {
                this.getModel("toolbar").setProperty("/", {
                    menuButton: false,
                    newPage: false,
                    renamePage: false,
                    editor: false,
                    copyPage: false,
                    movePage: false,
                    deletePage: false,
                    upload: false,
                    properties: false,
                    savePage: false,
                    cancelEditor: false,
                    copyAttachment: false,
                    moveAttachment: false,
                    deleteAttachment: false,
                    renameAttachment: false,
                    copySelection: false,
                    moveSelection: false,
                    deleteSelection: false,
                    editInvoice: false
                });
            },


            setViewMode: function (sViewMode) {
                this.resetViewMode();
                var model = this.getModel("toolbar");

                if (sViewMode === "view") {
                    model.setProperty("/newPage", true);
                    model.setProperty("/renamePage", true);
                    model.setProperty("/editor", true);
                    model.setProperty("/copyPage", true);
                    model.setProperty("/movePage", true);
                    model.setProperty("/deletePage", true);
                    model.setProperty("/upload", true);
                    model.setProperty("/properties", true);

                } else if (sViewMode === "edit") {
                    model.setProperty("/savePage", true);
                    model.setProperty("/cancelEditor", true);

                } else if (sViewMode === "singleAttachment") {
                    model.setProperty("/copyAttachment", true);
                    model.setProperty("/moveAttachment", true);
                    model.setProperty("/deleteAttachment", true);
                    model.setProperty("/renameAttachment", true);

                } else if (sViewMode === "selection") {
                    model.setProperty("/copySelection", true);
                    model.setProperty("/moveSelection", true);
                    model.setProperty("/deleteSelection", true);
                }

                if (this.getModel("currPage").getProperty("/type") === "invoice") {
                    model.setProperty("/editInvoice", true);
                } else {
                    model.setProperty("/editInvoice", false);
                }
            },

            _changeSideContent: function (sViewName, sTitle) {
                this.getModel("mdsPage").setProperty("/sideContentViewName", sViewName);
                this.getModel("mdsPage").setProperty("/sideContentTitle", sTitle);
                this.getModel("mdsPage").setProperty("/showSideContent", true);
            },

            _loadSideContent: function (sSideContentViewName, sTitle, oSetupOptions) {
                this._changeSideContent(sSideContentViewName, sTitle);
                var oController = this.getController(sSideContentViewName);
                oController.setup(oSetupOptions)
            },

            onShowNewPage: function (oEvent) {
                this._loadSideContent("lifebook.view.main.sidecontent.new.New", "Neue Seite")
            },

            onShowRenamePage: function (oEvent) {
                this._loadSideContent("lifebook.view.main.sidecontent.edit.Edit", "Seite umbenennen", { mode: "page" });
            },

            onShowMovePage: function (oEvent) {
                this._loadSideContent("lifebook.view.main.sidecontent.move.Move", "Seite verschieben", { mode: "page" });
            },

            onShowCopyPage: function (oEvent) {
                this._loadSideContent("lifebook.view.main.sidecontent.copy.Copy", "Seite kopieren", { mode: "page" });
            },

            onShowUpload: function (oEvent) {
                this._loadSideContent("lifebook.view.main.sidecontent.upload.Upload", "Upload");
            },

            onShowProperties: function (oEvent) {
                this._loadSideContent("lifebook.view.main.detail.properties.Properties", "Eigenschaften");
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
                this._loadSideContent("lifebook.view.main.sidecontent.edit.Edit", "Attachment umbenennen", { mode: "attachment" });
            },

            onShowMoveAttachment: function (oEvent) {
                this._loadSideContent("lifebook.view.main.sidecontent.move.Move", "Attachment verschieben", { mode: "attachment" });
            },

            onShowCopyAttachment: function (oEvent) {
                this._loadSideContent("lifebook.view.main.sidecontent.copy.Copy", "Attachment kopieren", { mode: "attachment" });
            },

            onShowMoveSelection: function (oEvent) {
                this._loadSideContent("lifebook.view.main.sidecontent.move.Move", "Auswahl verschieben", { mode: "selection" });
            },

            onShowCopySelection: function (oEvent) {
                this._loadSideContent("lifebook.view.main.sidecontent.copy.Copy", "Auswahl kopieren", { mode: "attachment" });
            },

            onDeleteSelection: function (oEvent) {
                var currPage = this.getView()
                    .getModel("currPage")
                    .getData();

                var selectedAttachments = this.getOwnerComponent().getModel("selectedAttachments").getData();

                var fileNames = selectedAttachments.map(function (item) {
                    return item.name;
                })

                var that = this;
                MessageBox.confirm("Auswahl löschen?", {
                    actions: [sap.m.MessageBox.Action.NO, sap.m.MessageBox.Action.DELETE],
                    title: "Auswahl löschen",
                    onClose: function (sAction) {
                        if (sAction === sap.m.MessageBox.Action.DELETE) {
                            var oRestModel = new RestModel();
                            oRestModel.deleteFile({ path: currPage.path, fileNames: fileNames }).then(function (data) {
                                that.getModel("currPage").setProperty("/", oRestModel.getData());
                                that.getModel("mdsPage").setProperty("/showSideContent", false);
                            });
                        }
                    }
                });
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
                            oRestModel.deleteFile({ path: currPage.path, fileNames: [currAttachment.name] }).then(function (data) {
                                that.getModel("currPage").setProperty("/", oRestModel.getData());
                                that.getModel("mdsPage").setProperty("/showSideContent", false);
                            });
                        }
                    }
                });
            },

            onShowEditInvoice: function (oEvent) {
                this._loadSideContent("lifebook.view.main.sidecontent.invoice.Invoice", "Rechnung bearbeiten");
            },

            onAfterCloseSideContent: function (oEvent) {
                var name = oEvent.getParameter("value").getControllerName();

                if (name.indexOf("lifebook.view.main.detail.attachment") === 0) {
                    this.getModel("currAttachment").setProperty("/", null);
                    this.getController("lifebook.view.main.detail.AbstractPage").unselectAllAttachments();
                    this.setViewMode("view");
                }
            },

            onShowMenu: function (oEvent) {
                this.getModel("mdsPage").setProperty("/showMaster", true);
            }

        });
    });
