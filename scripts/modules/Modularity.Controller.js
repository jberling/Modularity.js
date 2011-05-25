define(["./Modularity"], function(Modularity){

  var parseRouteSpecs = function(str){
    // ex: kurt:call-me.status
    var splitted = str.split(".");

    if (splitted.length === 2) {
      var key    = splitted[0];
      var method = splitted[1];
    } else {
      key = str;
      method = null;
    }

    splitted = key.split(":");
    if (splitted.length === 2) {
      var id = splitted[0];
      var modDefKey = splitted[1];
    } else {
      throw new Error("The module key should be in the form [element id]:[definition-name]");
    }

    return { key: key, elementId:id, moduleDefinitionKey:modDefKey, method:method };
  };

  var extensions = {

    start : function(routeSpecs, context){
      var routes           = {};
      var methods          = {};
      var monitoredModules = {};
      var specs            = context.modularity.moduleSpecs

      _(routeSpecs).each(function(routeSpec, routeName){
        var methodName = "_" + routeName;
        var routeSpecsObjArr = _.map(routeSpec, parseRouteSpecs);

        _.forEach(routeSpecsObjArr, function(item){
          monitoredModules[item.key] = true;
        });

        methods[methodName] = function(){
          var started = [];
          var args = arguments;
          // start modules
          _(routeSpecsObjArr).each(function(item){
            var spec = specs[item.key];
            new spec.Definition(
              context.modularity,
              item.key,
              spec.context
              ).start(spec.options, spec.context);
            started.push(item.key);

            if(item.method){
              var module = context.modularity.modules[item.key];
              module[item.method].apply(module, args);
            }
          });

          // destroy modules
          _(monitoredModules).chain().keys()
            .reject(function(key){
              return _(started).detect(function(startedKey){
                return startedKey === key;
              });
            })
            .each(function(key){
              var toDestroy = context.modularity.modules[key];
              if (toDestroy) {
                toDestroy.destroy();
              }
            });
        };

        routes[routeName] = methodName;
      });

      window.methods = methods;

      for (var key in context.modularity.moduleSpecs){
        var monitoredKeys  = _.keys(monitoredModules);
        var keyIsMonitored = _.detect(monitoredKeys, function(monitoredKey){
          return key === monitoredKey;
        });
        if (!keyIsMonitored && !context.modularity.modules[key]) {
          var spec = specs[key];
          new spec.Definition(context.modularity, key, spec.context).start(spec.options, spec.context);
        }
      }

      var BackboneController = Backbone.Controller.extend(_.extend(methods, {routes:routes}));
      this.backboneController = new BackboneController();
      
      if (_.keys(this.backboneController.routes).length) {
        Backbone.history.start();
      }
    }
  };

  var staticExtensions = { dataAttribute : "controller" };

  var Controller = Modularity.moduleDefinitions.register("controller", extensions, staticExtensions);

  Controller.version = "0.1";

  Modularity.prototype.startController = function(id){
    var key = id + ":controller";
    var spec = this.moduleSpecs[key];
    var controller = new spec.Definition(this, key, spec.context);
    controller.start(spec.options);
    return controller;
  }

  return Controller;

});