define(["./Modularity"], (Modularity) ->

  parseRouteSpecs = (str) ->
    splitted = str.split(".")

    if splitted.length is 2
      key    = splitted[0]
      method = splitted[1]
    else
      key    = str
      method = null

    splitted = key.split(":")
    if splitted.length is 2
      id        = splitted[0]
      modDefKey = splitted[1]
    else
      throw new Error "the module key should be in the form [element-id]:[definition-name]"
    
    key                 : key
    elementId           : id
    moduleDefinitionKey : modDefKey
    method              : method


  extensions =
    start : (routeSpecs, context) ->
      routes           = {}
      methods          = {}
      monitoredModules = {}
      specs            = context.modularity.moduleSpecs

      _(routeSpecs).each (routeSpec, routeName) ->
        methodName = "_" + routeName
        routeSpecsObjArr = _.map(routeSpec, parseRouteSpecs)

        _(routeSpecsObjArr).each (item) ->
          monitoredModules[item.key] = true

        methods[methodName] = () ->
          started = []
          args    = arguments

          # start modules
          _(routeSpecsObjArr).each (item) ->
            spec = specs[item.key]

            module = new spec.Definition(context.modularity, item.key, spec.context)
            module.start(spec.options, spec.context)
            started.push item.key

            if item.method
              module[item.method].apply(module, args)

          # destroy modules
          _(monitoredModules).chain()
            .keys()
            .reject (key) ->
              _(started).detect (startedKey) ->
                startedKey is key
            .each (key) ->
              toDestroy = context.modularity.modules[key]
              if toDestroy
                toDestroy.destroy()
        
        routes[routeName] = methodName

      window.methods = methods

      for key of context.modularity.moduleSpecs
        monitoredKeys  = _.keys monitoredModules
        keyIsMonitored = _(monitoredKeys).detect (monitoredKey) ->
                          key is monitoredKey
        if not keyIsMonitored and not context.modularity.modules[key]
          spec = specs[key]
          module = new spec.Definition(context.modularity, key, spec.context)
          module.start(spec.options, spec.context)

      BackboneController = Backbone.Controller.extend(_.extend(methods, { routes: routes }))
      @backboneController = new BackboneController()

      if _.keys(this.backboneController.routes).length
        Backbone.history.start()

    # end start
  #end extensions

  staticExtensions =
    dataAttribute : "controller"
    VERSION       : "0.2.0"

  Controller = Modularity.moduleDefinitions.register("controller", extensions, staticExtensions)

  Modularity::startController = (id) ->
    key = id + ":controller"
    spec = @moduleSpecs[key]
    controller = new spec.Definition(this, key, spec.context)
    controller.start spec.options
    controller

  Controller
)