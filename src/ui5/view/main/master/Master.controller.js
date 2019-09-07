sap.ui.define(
  [
    "lifebook/view/BaseController.controller",
    "lifebook/model/RestModel",
    "jquery.sap.global",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/base/Log"
  ],
  function (BaseController, RestModel, jQuery, MessageBox, JSONModel, MessageToast, Fragment, Log) {
    return BaseController.extend("lifebook.view.main.master.Master", {
      onInit: function (oEvent) {
        this.reloadLifebookTree();
      },

      onAfterRendering: function (oEvent) {
      },

      reloadLifebookTree: function () {
        var that = this;
        var oRestModel = new RestModel();
        return oRestModel.tree().then(function (data) {
          that._prepareLifebookModel(data);
          oRestModel.setProperty("/", data);
          that.getModel("tree").setProperty("/", oRestModel.getData());

          that.expandTreeItem(localStorage.getItem("lifebook.currPage.path"));
        });
      },

      _prepareLifebookModel: function (obj) {
        if (!obj.items) {
          obj.items = [];
        }
        var that = this;
        obj.items.forEach(function (item) {
          that._prepareLifebookModel(item);
        });

        obj.items.push({ type: "add", title: "Neue Seite", path: obj.path });
      },

      onClose: function (oEvent) {
        this.getController("lifebook.base.Base").hideMaster();
      },

      onPress: function (oEvent) {
        var oBindingContext = oEvent.getSource().getBindingContext("tree");

        var oObj = oBindingContext.getObject();

        if (oObj.type === "add") {
          oBindingContext.getModel().setProperty(oBindingContext.getPath() + "/type", "addConfirm");
        }

        if (oObj.type === "lifebook" || oObj.type === "page") {
          this.reloadPage(oObj.path);
        }
      },

      _navToPage: function (sPath) {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("page", {
          path: sPath
        });
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


      
      }


    });
  }
);
