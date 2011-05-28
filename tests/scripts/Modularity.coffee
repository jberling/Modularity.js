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
      
      @modularity.modules[key] = this
      context                 = context or {}
      context.modularity      = modularity

      @_start   = @_start or ->
      @_destroy = @_destroy or ->

      @key      = key
      @element = context.element
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

    parseContext : () ->
      modularity   = this
      parseOptions = (str) -> JSON.parse str
      context      = modularity.config.context

      for key, attrKey of Modularity.dataAttributes
        do (key, attrKey) ->
          attr   = "data-#{ attrKey }"
          sel    = "[#{ attr }]"
          defId  = Modularity.dataAttributes[attrKey]
          ModDef = Modularity.moduleDefinitions.get(defId)

          $(sel, context).each () ->
            options = parseOptions($(this).attr(attr))
            modKey  = "#{ this.id }:#{ defId }"
            modularity.moduleSpecs[modKey] =
              context    :
                element : this
              options    : options
              Definition : ModDef

    activateModules : () ->
      @_createSpecifiedModules()
      @_startSpecifiedModules()

    _createSpecifiedModules : () ->
      @_prepared   = []
      modularity = this
      for key, spec of modularity.moduleSpecs
        do (key, spec) ->
          module = new spec.Definition(modularity, key, spec.context)
          modularity._prepared.push(() ->  module.start(spec.options, spec.context))
      @_startSpecifiedModules = () ->
        start() for start in @_prepared

    bind : (event, func) -> $(this).bind(event, func)

    trigger : (event) -> $(this).trigger(event)

    @VERSION : "0.2.0"

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

    @reset : () -> Modularity.moduleDefinitions._clear()