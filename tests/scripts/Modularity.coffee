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
      module  = this
      start   = module.start or ->
      started = false
      
      modularity.modules[key] = module
      context                 = context or {}
      context.modularity      = modularity

      module.id      = key
      module.element = context.element
      module.context = context

      module.prepare = module.prepare or ->

      module.prepare(context)

    start : (options, context) ->
      unless @started
        @started = true
        options = $.extend(@context.options, options)
        context = $.extend(@context, context)
        @start.apply(this, [options, context])


  class Modularity
    constructor: (options) ->
      mod             = this
      mod.config      = $.extend({ context: window.document or null }, options)
      mod.modules     = {}
      mod.moduleSpecs = {}

    parseContext : () ->
      parseOptions = (str) -> JSON.parse str
      context      = mod.config.context

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
              mod.moduleSpecs[modId] = {
                context    : context
                options    : options
                Definition : ModDef
              }
          )

    createSpecifiedModules : () ->
      for key, spec of mod.moduleSpecs
        do spec ->
          new spec.Definition(mod, key, spec.context).start(spec.options, spec.context)

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
                  NewModule::[k] = v
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