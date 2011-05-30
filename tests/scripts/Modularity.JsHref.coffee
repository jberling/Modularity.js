define(["./Modularity"], (Modularity) ->

  dataAttribute = "js-href"

  Modularity.moduleDefinitions.register(
    "js-href",

    { start: (options) ->
      clientHref = options.href
      $(this.element).attr("href", clientHref)

      unless window._jsHrefInitialized
        $(window.document.body).delegate(
          "click",
          "a[data-#{ dataAttribute }]",
          (e) -> e.preventDefault()
        )
    },

    { dataAttribute : dataAttribute, VERSION : "0.2.1" }
  ))