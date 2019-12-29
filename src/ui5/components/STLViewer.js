sap.ui.define([
    "sap/ui/core/Control"
], function (Control) {
    "use strict";
    return Control.extend("lifebook.components.STLViewer", {
        metadata: {
            properties: {
                filename: { type: "string", defaultValue: "" },
                width: { type: "string", defaultValue: "100%" },
                height: { type: "string", defaultValue: "100%" }
            }
        },
        init: function () {
        },

        onAfterRendering: function () {
                this._stlViewer = new StlViewer(document.getElementById(this.getId()), { models: [{ id: 0, filename: this.getFilename(), display: "flat"}], load_three_files: "/ui5/lib/stlviewer/" });
        },

        renderer: function (oRM, oControl) {
            var width = oControl.getProperty("width");
            var height = oControl.getProperty("height");

            oRM.write("<div id='" + oControl.getId() + "'  width='" + width + "' height='" + height + "'></div>");
        }
    });
});