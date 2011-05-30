define(["./Modularity"], (Modularity, articles) ->

  Modularity.moduleDefinitions.register("article", {

    start : (options) ->
      self = this
      path = options.path or "articles/#{ @key.split(":")[0] }.html"
      require(["text!#{ path }!strip"], (content) ->
        $(self.element).hide().html(content).fadeIn("slow")
      );

    destroy: () ->
      $(this.element).fadeOut("slow",
        () -> $(this).html("")
      )

  }, { dataAttribute: "article", VERSION: "0.2.1" })

)