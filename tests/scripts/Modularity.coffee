define () ->

  getAccName = () ->
    registered = {}
    (name) ->
      i = if name in registered then registered[name] else 1
      registered[name] = i + 1;
      uniqueName = name + (if i > 1 then i else "")
      uniqueName


  class DefaultModule
    constructor: (modularity, key, context) ->
      started = false
      
      modularity.modules[key] = this
      context                 = context or {}
      context.modularity      = modularity

      @id      = key
      @element = context.element
      @context = context
      @prepare = @prepare or ->
      @prepare(context)

    start : (options, context) ->
      unless @started
        @started = true
        options = $.extend(@context.options, options)
        context = $.extend(@context, context)
        @_start.apply(this, [options, context])


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
          attr   = "data-" + attrKey
          sel    = "[" + attr + "]"
          defId  = Modularity.dataAttributes[attrKey]
          ModDef = Modularity.moduleDefinitions.get(defId)
          $(sel, context).each(
            () ->
              options = parseOptions($(this).attr(attr))
              modId   = this.id + ":" + defId
              context = {element:this}
              modularity.moduleSpecs[modId] =
                context    : context
                options    : options
                Definition : ModDef
          )

    createSpecifiedModules : () ->
      modularity = this
      for key, spec of modularity.moduleSpecs
        do (key, spec) ->
          new spec.Definition(modularity, key, spec.context).start(spec.options, spec.context)

    @version : "0.2"

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
                  memberName = if k is "start" then "_start" else k
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