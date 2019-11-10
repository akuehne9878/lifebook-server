sap.ui.define(
  [
    "lifebook/view/baseLayout/BaseDialogController",
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
  function (BaseDialog, RestModel, jQuery, MessageBox, JSONModel, MessageToast, Fragment, Controller, PDFViewer, Log) {
    return BaseDialog.extend("lifebook.view.main.detail.attachments.PhotoDialog", {
      onInit: function (oEvent) {
      },

      setupDialog: function (options) {
        this._options = options;

        var arr = options.imageArray.slice(1, 10)

        this.setModel(new JSONModel(arr), "images");

        this.setModel(new JSONModel({ path: options.imageArray[options.currIndex].file }), "currentImage");


      },

      open: function () {
        this.getDialog().open();

        //this.getView().byId("carousel").next();
        // for (var i = 0; i < this._options.currIndex; i++) {
        //   this.getView().byId("carousel").next();
        // }

      },

      onPageChanged: function (oEvent) {
      },


      onFullscreen: function (oEvent) {
        var id = this.getView().byId("image").getId();
        this.openFullscreen(id);

        $("#"+id).keydown(function (evt) {
          if (evt.keyCode == sap.ui.events.KeyCodes.ARROW_LEFT) {
            evt.preventDefault();
            alert('left');
          }
        });

        $("#"+id).keydown(function (evt) {
          if (evt.keyCode == sap.ui.events.KeyCodes.ARROW_RIGHT) {
            evt.preventDefault();
            alert('right');
          }
        });
      },

      /* Get the element you want displayed in fullscreen mode (a video in this example): */

      /* When the openFullscreen() function is executed, open the video in fullscreen.
      Note that we must include prefixes for different browsers, as they don't support the requestFullscreen method yet */
      openFullscreen: function (id) {
        var elem = document.getElementById(id);
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) { /* Firefox */
          elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
          elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE/Edge */
          elem.msRequestFullscreen();
        }
      }

    });
  }
);
