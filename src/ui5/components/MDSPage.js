sap.ui.define(['sap/ui/core/XMLComposite'], function (XMLComposite) {
    "use strict";


    return XMLComposite.extend("lifebook.components.MDSPage", {
        metadata: {
            properties: {
                showPrimaryHeader: { type: "boolean", defaultValue: true },
                showSecondaryHeader: { type: "boolean", defaultValue: true },
                showDetailHeader: { type: "boolean", defaultValue: true },
                showSideContent: { type: "boolean", defaultValue: true },
                showMainContent: { type: "boolean", defaultValue: true },
                showSideContentSpace: { type: "boolean", defaultValue: true },
                sideContentTitle: { type: "string", defaultValue: "" },
                sideContentViewName: { type: "string", defaultValue: "" }
            },

            events: {
                afterCloseSideContent : {
                    parameters : {
                      opener : "sap.ui.core.Control"
                    }
                  }
            },
            aggregations: {
                items: {
                    type: "sap.ui.core.Control",
                    invalidate: true
                },
                primaryHeader: {
                    type: "sap.m.IBar",
                    multiple: false,
                    forwarding: {
                        idSuffix: "--primaryPage",
                        aggregation: "customHeader"
                    }
                },

                secondaryHeader: {
                    type: "sap.m.IBar",
                    multiple: false,
                    forwarding: {
                        idSuffix: "--secondaryPage",
                        aggregation: "customHeader"
                    }
                },

                detailHeader: {
                    type: "sap.m.IBar",
                    multiple: false,
                    forwarding: {
                        idSuffix: "--detailContainer",
                        aggregation: "customHeader"
                    }
                },

                masterPage: {
                    type: "sap.ui.core.Control",
                    multiple: false,
                    forwarding: {
                        idSuffix: "--masterPageContainer",
                        aggregation: "content"
                    }
                },

                detailPage: {
                    type: "sap.ui.core.Control",
                    multiple: false,
                    forwarding: {
                        idSuffix: "--detailPageContainer",
                        aggregation: "content"
                    }
                },

                sideContent: {
                    type: "sap.ui.core.Control",
                    multiple: true,
                    forwarding: {
                        idSuffix: "--sideContentNavContainer",
                        aggregation: "pages"
                    }
                }

            },

            defaultAggregation: "items",
        },

        fragment: "lifebook.components.MDSPage",

        // setCurrentSideContentPage: function (sViewName, sTitle) {
        //     var navContainer = this.byId("sideContentNavContainer");
        //     var page = this.getSideContentPage(sViewName);
        //     navContainer.to(page.getId(), "show");

        //     this.setSideContentTitle(sTitle);
        //     this.setShowSideContent(true);
        // },

        setSideContentViewName: function (sViewName) {
            var navContainer = this.byId("sideContentNavContainer");
            var page = this.getSideContentPage(sViewName);
            if (page) {
                navContainer.to(page.getId(), "show");
            }
        },

        getMasterPage: function () {
            this.byId("masterPageContainer").getContent()[0];
        },

        getDetailPage: function () {
            this.byId("detailPageContainer").getContent()[0];
        },

        getSideContentPage: function (sViewName) {
            var navContainer = this.byId("sideContentNavContainer");
            var page = navContainer.getPages().filter(function (page) {
                return page.getViewName() === sViewName;
            })[0]
            return page;
        },

        onCloseSideContent: function (oEvent) {
            this.setShowSideContent(false);

            var navContainer = this.byId("sideContentNavContainer");
            this.fireEvent("afterCloseSideContent", {value: navContainer.getCurrentPage()});
        }

    });
});
