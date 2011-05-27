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
        var started;
        this.modularity = modularity;
        started = false;
        this.modularity.modules[key] = this;
        context = context || {};
        context.modularity = modularity;
        this._start = this._start || function() {};
        this._destroy = this._destroy || function() {};
        this.id = key;
        this.element = context.element;
        this.context = context;
        this.prepare = this.prepare || function() {};
        this.prepare(context);
      }
      DefaultModule.prototype.destroy = function() {
        this._destroy.apply(this, []);
        return this.modularity.modules[this.id] = void 0;
      };
      DefaultModule.prototype.start = function(options, context) {
        if (!this.started) {
          this.started = true;
          options = $.extend(this.context.options, options);
          context = $.extend(this.context, context);
          return this._start.apply(this, [options, context]);
        }
      };
      return DefaultModule;
    })();
    return Modularity = (function() {
      function Modularity(options) {
        this.config = $.extend({
          context: window.document || null
        }, options);
        this.modules = {};
        this.moduleSpecs = {};
      }
      Modularity.prototype.parseContext = function() {
        var attrKey, context, key, modularity, parseOptions, _ref, _results;
        modularity = this;
        parseOptions = function(str) {
          return JSON.parse(str);
        };
        context = modularity.config.context;
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
              modId = "" + this.id + ":" + defId;
              return modularity.moduleSpecs[modId] = {
                context: {
                  element: this
                },
                options: options,
                Definition: ModDef
              };
            });
          })(key, attrKey));
        }
        return _results;
      };
      Modularity.prototype.createSpecifiedModules = function() {
        var key, modularity, spec, _ref, _results;
        modularity = this;
        _ref = modularity.moduleSpecs;
        _results = [];
        for (key in _ref) {
          spec = _ref[key];
          _results.push((function(key, spec) {
            return new spec.Definition(modularity, key, spec.context).start(spec.options, spec.context);
          })(key, spec));
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
                var memberName;
                memberName = k === "start" ? "_start" : k === "destroy" ? "_destroy" : k;
                return NewModule.prototype[memberName] = v;
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
