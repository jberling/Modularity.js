define () ->

  getAccName = () ->
    registered = {}
    (name) ->
      i = if name in registered then registered[name] else 1
      registered[name] = i + 1;
      uniqueName = name + (if i > 1 then i else "")
      uniqueName


  class DefaultModule
    constructor: (@modularity, key, context) ->
      started = false

      context                       = context or {}
      context.moduleCollection      = context.moduleCollection or @modularity.modules
      context.moduleCollection[key] = this
      context.modularity            = modularity

      @_start   = @_start or ->
      @_destroy = @_destroy or ->

      @key     = key
      @element = context.element
      @modules = {}
      @context = context
      @prepare = @prepare or ->
      @prepare(context)

    destroy : () ->
      @_destroy.apply(this, [])
      @modularity.modules[@key] = undefined
      @modularity.trigger("#{ @key }:destroyed")

      keyParts = @_getKeyParts()
      if keyParts then @modularity.trigger("#{ keyParts.defId }:destroyed")

    start : (options, context) ->
      unless @started
        @started = true
        options = $.extend(@context.options, options)
        context = $.extend(@context, context)
        @_start.apply(this, [options, context])

        @modularity.trigger("#{ @key }:started")
        keyParts = @_getKeyParts()
        if keyParts then @modularity.trigger("#{ keyParts.defId }:started")

    parseSelf : ->
      @modularity.parseContext this
      this

    activateModules : ->
      @modularity._createSpecifiedModules(@moduleSpecs).start()

    _getKeyParts : () ->
      splitted = @key.split(":")
      if splitted.length is 2
        elId : splitted[0], defId : splitted[1]
      else
        false #todo: warning?

  class Modularity
    constructor: (options) ->
      @config      = $.extend({ context: window.document or null }, options)
      @modules     = {}
      @moduleSpecs = {}

    parseContext : (module) ->
      modularity   = this
      parseOptions = (str) -> JSON.parse Modularity.attribToJson str
      specs        = {}
      context      = if module then module.element else modularity.config.context

      #parse
      for key, attrKey of Modularity.dataAttributes
        do (key, attrKey) ->
          attr   = "data-#{ attrKey }"
          sel    = "[#{ attr }]"
          defId  = Modularity.dataAttributes[attrKey]
          ModDef = Modularity.moduleDefinitions.get(defId)
          
          $(context).find(sel).each () ->
            options = parseOptions($(this).attr(attr))
            modKey  = "#{ this.id }:#{ defId }"
            spec =
              context    :
                element : this
                moduleCollection : if module then module.modules else modularity.modules
              options    : options
              Definition : ModDef
            specs[modKey] = spec

      if module
        module.moduleSpecs = specs
      else
        modularity.moduleSpecs = specs
 
    activateModules : () ->
      @_createSpecifiedModules().start()

    _createSpecifiedModules : (specs) ->
      self       = this
      @_prepared = []
      modularity = this
      specs      = specs or modularity.moduleSpecs
      for key, spec of specs
        do (key, spec) ->
          module = new spec.Definition(modularity, key, spec.context)
          modularity._prepared.push(() -> module.start(spec.options, spec.context))
      { start : -> start() for start in self._prepared }

    bind : (event, func) -> $(this).bind(event, func)

    trigger : (event) -> $(this).trigger(event)

    @VERSION : "0.3.1"

    @dataAttributes : {};

    @moduleDefinitions :
      do () ->
        definitions = {}
        {
          get : (key) -> definitions[key]

          register : (key, extensions, staticExtensions) ->
            class NewModule extends DefaultModule
              for k, v of extensions
                do (k, v) ->
                  memberName =
                    if k is "start"
                      "_start"
                    else if k is "destroy"
                      "_destroy"
                    else k
                  NewModule::[memberName] = v
              for k, v of staticExtensions
                do (k, v) ->
                  NewModule[k] = v
            definitions[key] = NewModule

            if staticExtensions and staticExtensions.dataAttribute
              Modularity.dataAttributes[staticExtensions.dataAttribute] = key

            NewModule

          _clear : () -> definitions = {}
      }

    @reset : () ->
      Modularity.moduleDefinitions._clear()
      Modularity.dataAttributes = {}

    @jsonToAttrib : (str) -> str.replace /"/g, "'"

    @attribToJson : (str) ->
      if str is ""
        "{}"
      else
        if /^[^\{|\[]/.exec str
          str = "{#{ str }}"
        str.replace /'/g, "\""