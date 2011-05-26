(function() {
  var __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  define(function() {
    var DefaultModule, Modularity, getAccName;
    getAccName = function() {
      var registered;
      registered = {};
      return function(name) {
        var i, uniqueName;
        i = __indexOf.call(registered, name) >= 0 ? registered[name] : 1;
        registered[name] = i + 1;
        uniqueName = name + (i > 1 ? i : "");
        return uniqueName;
      };
    };
    DefaultModule = (function() {
      function DefaultModule(modularity, key, context) {
        var module, start, started;
        module = this;
        start = module.start || function() {};
        started = false;
        modularity.modules[key] = module;
        context = context || {};
        context.modularity = modularity;
        module.id = key;
        module.element = context.element;
        module.context = context;
        module.prepare = module.prepare || function() {};
        module.prepare(context);
      }
      DefaultModule.prototype.start = function(options, context) {
        if (!this.started) {
          this.started = true;
          options = $.extend(this.context.options, options);
          context = $.extend(this.context, context);
          return this.start.apply(this, [options, context]);
        }
      };
      return DefaultModule;
    })();
    return Modularity = (function() {
      function Modularity(options) {
        var mod;
        mod = this;
        mod.config = $.extend({
          context: window.document || null
        }, options);
        mod.modules = {};
        mod.moduleSpecs = {};
      }
      Modularity.prototype.parseContext = function() {
        var attrKey, context, key, parseOptions, _ref, _results;
        parseOptions = function(str) {
          return JSON.parse(str);
        };
        context = mod.config.context;
        _ref = Modularity.dataAttributes;
        _results = [];
        for (key in _ref) {
          attrKey = _ref[key];
          _results.push((function(key, attrKey) {
            var ModDef, attr, defId, sel;
            attr = "data-" + attrKey;
            sel = "[" + attr + "]";
            defId = Modularity.dataAttributes[attrKey];
            ModDef = Modularity.moduleDefinitions.get(defId);
            return $(sel, context).each(function() {
              var modId, options;
              options = parseOptions($(this).attr(attr));
              modId = this.id + ":" + defId;
              context = {
                element: this
              };
              return mod.moduleSpecs[modId] = {
                context: context,
                options: options,
                Definition: ModDef
              };
            });
          })(key, attrKey));
        }
        return _results;
      };
      Modularity.prototype.createSpecifiedModules = function() {
        var key, spec, _ref, _results;
        _ref = mod.moduleSpecs;
        _results = [];
        for (key in _ref) {
          spec = _ref[key];
          _results.push(spec(function() {
            return new spec.Definition(mod, key, spec.context).start(spec.options, spec.context);
          })());
        }
        return _results;
      };
      Modularity.version = "0.2";
      Modularity.dataAttributes = {};
      Modularity.moduleDefinitions = (function() {
        var definitions;
        definitions = {};
        return {
          get: function(key) {
            return definitions[key];
          },
          register: function(key, extensions, staticExtensions) {
            var NewModule;
            NewModule = (function() {
              var k, v, _fn, _fn2;
              function NewModule() {
                NewModule.__super__.constructor.apply(this, arguments);
              }
              __extends(NewModule, DefaultModule);
              _fn = function(k, v) {
                return NewModule.prototype[k] = v;
              };
              for (k in extensions) {
                v = extensions[k];
                _fn(k, v);
              }
              _fn2 = function(k, v) {
                return NewModule[k] = v;
              };
              for (k in staticExtensions) {
                v = staticExtensions[k];
                _fn2(k, v);
              }
              return NewModule;
            })();
            definitions[key] = NewModule;
            if (staticExtensions && staticExtensions.dataAttribute) {
              Modularity.dataAttributes[staticExtensions.dataAttribute] = key;
            }
            return NewModule;
          },
          _clear: function() {
            return definitions = {};
          }
        };
      })();
      Modularity.reset = function() {
        return Modularity.moduleDefinitions._clear();
      };
      return Modularity;
    })();
  });
}).call(this);
