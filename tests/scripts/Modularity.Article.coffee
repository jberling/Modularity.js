define(["./Modularity", "articles/articles"], (Modularity, articles) ->

  Modularity.moduleDefinitions.register("article", {

    start : (options) ->
      articleName = @id.split(":")[0]
      content     = articles[options.name || articleName]
      $(this.element).hide().html(content).fadeIn("slow")

    destroy: () ->
      $(this.element).fadeOut("slow",
        () -> $(this).html("")
      )

  }, { dataAttribute: "article", VERSION: "0.2.0" })

)