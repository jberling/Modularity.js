//todo: add license info and better comments

define(function(){

  var getAccName = function() {
    var registered = {};
    return function(name){
      var i = name in registered ? registered[name] : 1;
      registered[name] = i + 1;
      var uniqueName = name + (i > 1 ? i : "");
      
      return uniqueName;
    };
  }();

  var Modularity = function(options){

    var mod = this;
    
    mod.version = "0.1";

    mod.config = $.extend({
      context        : window.document || null
    }, options);

    mod.modules     = {};
    mod.moduleSpecs = {};

    mod.parseContext = function(){
      var parseOptions = function(str){
        return JSON.parse(str);
      };

      var context = mod.config.context;

      for (var key in Modularity.dataAttributes){
        (function(){
          var attrKey = Modularity.dataAttributes[key];
          var attr    = "data-" + attrKey;
          var sel     = "[" + attr + "]";
          var defId   = Modularity.dataAttributes[attrKey];
          var ModDef  = Modularity.moduleDefinitions.get(defId);
          $(sel, context).each(function(){
            var options = parseOptions($(this).attr(attr));
            var modId   = this.id + ":" + defId;
            var context = { element : this };
            mod.moduleSpecs[modId] = {
              context    : context,
              options    : options,
              Definition : ModDef
            }
          });
        }());
      }
    };

    mod.createSpecifiedModules = function(){
      for (var key in mod.moduleSpecs){
        (function(){
          var spec = mod.moduleSpecs[key];
          new spec.Definition(mod, key, spec.context).start(spec.options, spec.context)
        }());
      }
    };

  };

  // Stolen from backbone, thanks!
  var inherits = function() {
    var ctor = function(){};

    return function(parent, protoProps, staticProps) {
      var child;

      if (protoProps && protoProps.hasOwnProperty('constructor')) {
        child = protoProps.constructor;
      } else {
        child = function(){ return parent.apply(this, arguments); };
      }

      ctor.prototype = parent.prototype;
      child.prototype = new ctor();

      if (protoProps)  $.extend(child.prototype, protoProps);
      if (staticProps) $.extend(child, staticProps);

      child.prototype.constructor = child;

      child.__super__ = parent.prototype;

      return child;
    };

  }();

  var protoModule = function(){};
  Modularity._DefaultModuleDefinition = function(modularity, key, context){
    var start   = this.start || function(){};
    var started = false;

    modularity.modules[key] = this;
    context                 = context || {};
    context.modularity      = modularity;
    this.id                 = key;
    this.element            = context.element;
    this.context            = context;
    this.prepare            = this.prepare || function(){};

    this.prepare(context);

    this.start = function(options, context){
      if(!started) {
        started = true;
        options = $.extend(this.context.options, options);
        context = $.extend(this.context, context);
        start.apply(this, [options, context]);
      }
    };

    this.destroy = this.destroy || function(){
      delete modularity.modules[key];
    };
  };

  Modularity.dataAttributes = {};

  Modularity.moduleDefinitions = function(){

    var definitions = {};

    return {
      get : function(key){
        return definitions[key];
      },
      register : function(key, extensions, staticExtensions) {
        var Definition = inherits(Modularity._DefaultModuleDefinition, extensions, staticExtensions);
        definitions[key] = Definition;
        if(staticExtensions && staticExtensions.dataAttribute){
          Modularity.dataAttributes[staticExtensions.dataAttribute] = key
        }
        return Definition;
      },
      _clear : function(){
        definitions = {};
      }
    }

  }();

  Modularity.reset = function(){
    Modularity.moduleDefinitions._clear();
  };
  
  return Modularity;

});