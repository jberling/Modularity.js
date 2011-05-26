define(["./Modularity" ], function(Modularity) {

  var dataAttribute = "js-href";

  var Module = Modularity.moduleDefinitions.register("js-href", {

    start: function(options) {
      var clientHref = options.href;
      $(this.element).attr("href", clientHref);

      if (!window._jsHrefInitialized) {
        $(window.document.body).delegate(
            "click",
            "a[data-" + dataAttribute + "]",
            function(e){
              e.preventDefault();
            });
        window._jsHrefInitialized = true;
      }
    }

  }, { dataAttribute: dataAttribute });

  Module.version = "0.1.1";

  return Module;

});
