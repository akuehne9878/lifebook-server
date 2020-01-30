sap.ui.define([
    "sap/ui/core/Control"
], function (Control) {
    "use strict";
    return Control.extend("lifebook.components.DrawingBoard", {
        metadata: {
            properties: {
                width: { type: "string", defaultValue: "640px" },
                height: { type: "string", defaultValue: "360px" },
                color: { type: "string", defaultValue: "#a1a1a1" }
            }
        },
        init: function () {
        },

        onAfterRendering: function () {
            var defaultBoard = new DrawingBoard.Board(this.getId(), {
                controls: [

                ],
                size: 1,
                webStorage: false,
                enlargeYourContainer: false
            });

        },

        renderer: function (oRM, oControl) {
            oRM.write("<div id='" + oControl.getId() + "' style='width:" + oControl.getWidth() + ";height:" + oControl.getHeight() + "'></div>");
        }
    });
});