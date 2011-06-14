(function() {
  define(["./Modularity"], function(Modularity) {
    var Controller, extensions, parseRouteSpecs, staticExtensions;
    parseRouteSpecs = function(str) {
      var id, key, method, modDefKey, splitted;
      splitted = str.split(".");
      if (splitted.length === 2) {
        key = splitted[0];
        method = splitted[1];
      } else {
        key = str;
        method = null;
      }
      splitted = key.split(":");
      if (splitted.length === 2) {
        id = splitted[0];
        modDefKey = splitted[1];
      } else {
        throw new Error("the module key should be in the form [element-id]:[definition-name]");
      }
      return {
        key: key,
        elementId: id,
        moduleDefinitionKey: modDefKey,
        method: method
      };
    };
    extensions = {
      start: function(routeSpecs, context) {
        var BackboneController, key, keyIsMonitored, methods, module, monitoredKeys, monitoredModules, routes, spec, specs;
        routes = {};
        methods = {};
        monitoredModules = {};
        specs = context.modularity.moduleSpecs;
        _(routeSpecs).each(function(routeSpec, routeName) {
          var methodName, routeSpecsObjArr;
          methodName = "_" + routeName;
          routeSpecsObjArr = _.map(routeSpec, parseRouteSpecs);
          _(routeSpecsObjArr).each(function(item) {
            return monitoredModules[item.key] = true;
          });
          methods[methodName] = function() {
            var args, started;
            started = [];
            args = arguments;
            _(routeSpecsObjArr).each(function(item) {
              var module, spec;
              spec = specs[item.key];
              module = new spec.Definition(context.modularity, item.key, spec.context);
              module.start(spec.options, spec.context);
              started.push(item.key);
              if (item.method) {
                return module[item.method].apply(module, args);
              }
            });
            return _(monitoredModules).chain().keys().reject(function(key) {
              return _(started).detect(function(startedKey) {
                return startedKey === key;
              });
            }).each(function(key) {
              var toDestroy;
              toDestroy = context.modularity.modules[key];
              if (toDestroy) {
                return toDestroy.destroy();
              }
            });
          };
          return routes[routeName] = methodName;
        });
        window.methods = methods;
        for (key in context.modularity.moduleSpecs) {
          monitoredKeys = _.keys(monitoredModules);
          keyIsMonitored = _(monitoredKeys).detect(function(monitoredKey) {
            return key === monitoredKey;
          });
          if (!keyIsMonitored && !context.modularity.modules[key]) {
            spec = specs[key];
            module = new spec.Definition(context.modularity, key, spec.context);
            module.start(spec.options, spec.context);
          }
        }
        BackboneController = Backbone.Controller.extend(_.extend(methods, {
          routes: routes
        }));
        this.backboneController = new BackboneController();
        if (_.keys(this.backboneController.routes).length) {
          return Backbone.history.start();
        }
      }
    };
    staticExtensions = {
      dataAttribute: "controller",
      VERSION: "0.3.1"
    };
    Controller = Modularity.moduleDefinitions.register("controller", extensions, staticExtensions);
    Modularity.prototype.startController = function(id) {
      var controller, key, spec;
      key = id + ":controller";
      spec = this.moduleSpecs[key];
      controller = new spec.Definition(this, key, spec.context);
      controller.start(spec.options);
      return controller;
    };
    return Controller;
  });
}).call(this);
