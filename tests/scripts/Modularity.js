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
        this.key = key;
        this.element = context.element;
        this.context = context;
        this.prepare = this.prepare || function() {};
        this.prepare(context);
      }
      DefaultModule.prototype.destroy = function() {
        var keyParts;
        this._destroy.apply(this, []);
        this.modularity.modules[this.key] = void 0;
        this.modularity.trigger("" + this.key + ":destroyed");
        keyParts = this._getKeyParts();
        if (keyParts) {
          return this.modularity.trigger("" + keyParts.defId + ":destroyed");
        }
      };
      DefaultModule.prototype.start = function(options, context) {
        var keyParts;
        if (!this.started) {
          this.started = true;
          options = $.extend(this.context.options, options);
          context = $.extend(this.context, context);
          this._start.apply(this, [options, context]);
          this.modularity.trigger("" + this.key + ":started");
          keyParts = this._getKeyParts();
          if (keyParts) {
            return this.modularity.trigger("" + keyParts.defId + ":started");
          }
        }
      };
      DefaultModule.prototype._getKeyParts = function() {
        var splitted;
        splitted = this.key.split(":");
        if (splitted.length === 2) {
          return {
            elId: splitted[0],
            defId: splitted[1]
          };
        } else {
          return false;
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
          return JSON.parse(Modularity.attribToJson(str));
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
              var modKey, options;
              options = parseOptions($(this).attr(attr));
              modKey = "" + this.id + ":" + defId;
              return modularity.moduleSpecs[modKey] = {
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
      Modularity.prototype.activateModules = function() {
        this._createSpecifiedModules();
        return this._startSpecifiedModules();
      };
      Modularity.prototype._createSpecifiedModules = function() {
        var key, modularity, spec, _fn, _ref;
        this._prepared = [];
        modularity = this;
        _ref = modularity.moduleSpecs;
        _fn = function(key, spec) {
          var module;
          module = new spec.Definition(modularity, key, spec.context);
          return modularity._prepared.push(function() {
            return module.start(spec.options, spec.context);
          });
        };
        for (key in _ref) {
          spec = _ref[key];
          _fn(key, spec);
        }
        return this._startSpecifiedModules = function() {
          var start, _i, _len, _ref2, _results;
          _ref2 = this._prepared;
          _results = [];
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            start = _ref2[_i];
            _results.push(start());
          }
          return _results;
        };
      };
      Modularity.prototype.bind = function(event, func) {
        return $(this).bind(event, func);
      };
      Modularity.prototype.trigger = function(event) {
        return $(this).trigger(event);
      };
      Modularity.VERSION = "0.2.1";
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
              __extends(NewModule, DefaultModule);
              function NewModule() {
                NewModule.__super__.constructor.apply(this, arguments);
              }
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
      Modularity.jsonToAttrib = function(str) {
        return str.replace(/"/g, "'");
      };
      Modularity.attribToJson = function(str) {
        if (str === "") {
          return "{}";
        } else {
          if (/^[^\{|\[]/.exec(str)) {
            str = "{" + str + "}";
          }
          return str.replace(/'/g, "\"");
        }
      };
      return Modularity;
    })();
  });
}).call(this);
