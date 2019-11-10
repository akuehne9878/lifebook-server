sap.ui.define(
  [
    "lifebook/view/BaseController.controller",
    "lifebook/model/RestModel",
    "jquery.sap.global",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    "sap/base/Log"
  ],
  function (BaseController, RestModel, jQuery, MessageBox, JSONModel, MessageToast, Fragment, Filter, FilterOperator, Log) {
    return BaseController.extend("lifebook.view.main.master.Master", {
      onInit: function (oEvent) {
        this.getOwnerComponent().registerController(this);

        this.reloadLifebookTree();
      },

      reloadLifebookTree: function () {
        var that = this;
        var oRestModel = new RestModel();
        return oRestModel.tree().then(function (data) {
          oRestModel.setProperty("/", data);
          
          that.getModel("targetTree").setProperty("/", data);
          that.getModel("tree").setProperty("/", data);

          that.expandTreeItem(localStorage.getItem("lifebook.currPage.path"));
        });
      },

      onSelectionChange: function (oEvent) {
        var oBindingContext = oEvent.getParameter("listItem").getBindingContext("tree");
        var oObj = oBindingContext.getObject();

        if (oObj.type === "add") {
          oBindingContext.getModel().setProperty(oBindingContext.getPath() + "/type", "addConfirm");
        }

        if (oObj.type === "lifebook" || oObj.type === "page") {
          this.reloadPage(oObj.path);
          this.getModel("mdsPage").setProperty("/showSideContent", false);
        }
      },

      _navToPage: function (sPath) {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("page", {
          path: sPath
        });


        var mainController = this.getController("lifebook.view.main.Main");
        mainController.setViewMode("view");
      },

      onClose: function(oEvent) {
        this.getModel("mdsPage").setProperty("/showMaster", false);
      },

      reloadPage: function (sPath, options) {
        this.getModel("currPage").setProperty("/path", sPath);
        localStorage.setItem("lifebook.currPage.path", sPath)
        var that = this;
        if (options && options.reloadTree) {
          this.reloadLifebookTree().then(function () {
            that._navToPage(sPath);
          })
        } else {
          this._navToPage(sPath);
        }

      },

      onCreatePage: function (oEvent) {
        var that = this;
        var oBindingContext = oEvent.getSource().getBindingContext("tree");

        var oObj = oBindingContext.getObject();

        var oRestModel = new RestModel();
        oRestModel.createPage({ title: oObj.title, path: oObj.path }).then(function (data) {
          that._prepareLifebookModel(data);
          that.getModel("tree").setProperty("/", data);

          that.reloadPage(oObj.path + "\\" + oObj.title);

        });
      },

      onCancelCreatePage: function (oEvent) {
        var oBindingContext = oEvent.getSource().getBindingContext("tree");
        oBindingContext.getModel().setProperty(oBindingContext.getPath() + "/type", "add");
        oBindingContext.getModel().setProperty(oBindingContext.getPath() + "/title", "Neue Seite");
      },

      expandTreeItem: function (sPath) {

        if (!sPath) {
          return;
        }

        var paths = [];
        
        var parts = sPath.split("\\");
        
        var temp = parts[0];
        
        for (var i = 1; i <= parts.length; i++) {
          paths.push(temp);
          
          if (parts[i]){
            temp += "\\" + parts[i];
          }
        }
        
        var that = this;
        paths.forEach(function (path) {
          var items = that.getView().byId("lifebookTree").getItems();
          items.forEach(function (item, index) {
            if (path === item.getBindingContext("tree").getObject("path")) {
              that.getView().byId("lifebookTree").expand(index);

            }
          })
        });


      
      },

      onFilter : function (oEvent) {

        // build filter array
        var aFilter = [];
        var sQuery = oEvent.getParameter("query");

        if (!sQuery) {
          sQuery = oEvent.getParameter("newValue");
        }

        if (sQuery) {
          aFilter.push(new Filter("title", FilterOperator.Contains, sQuery));
        }
  
        // filter binding
        var oList = this.getView().byId("lifebookTree");
        var oBinding = oList.getBinding("items");
        oBinding.filter(aFilter);
        oBinding.expand(0);
      },

      onExpandAll: function(oEvent) {
        var oTree = this.getView().byId("lifebookTree");
        oTree.expandToLevel(10);

      },

      onCollapseAll: function(oEvent) {
        var oTree = this.getView().byId("lifebookTree");
        oTree.collapseAll();

      }


    });
  }
);
