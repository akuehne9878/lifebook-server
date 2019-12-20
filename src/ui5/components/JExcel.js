sap.ui.define([
    "sap/ui/core/Control",
    "sap/m/RatingIndicator",
    "sap/m/Label",
    "sap/m/Button"

], function (Control, RatingIndicator, Label, Button) {
    "use strict";
    return Control.extend("lifebook.components.JExcel", {
        metadata: {
            properties: {
                src: { type: "string", defaultValue: "" },
                width: { type: "int", defaultValue: 640 },
                height: { type: "int", defaultValue: 360 },
                poster: { type: "string", defaultValue: "" }
            }
        },
        init: function () {

        },

        renderer: function (oRM, oControl) {
            var width = oControl.getProperty("width");
            var height = oControl.getProperty("height");
            var poster = oControl.getProperty("poster");
            var src = oControl.getProperty("src");

            oRM.write("<video class='video-js' controls='controls' preload='metadata' width='" + width + "' height='" + height + "'>");
            oRM.write("<source src='" + src + "#t=0.1' type='video/mp4'>");
            oRM.write("</video>");
        }
    });
});