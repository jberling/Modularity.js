(function() {
  define(["./Modularity"], function(Modularity) {
    var dataAttribute;
    dataAttribute = "js-href";
    return Modularity.moduleDefinitions.register("js-href", {
      start: function(options) {
        var clientHref;
        clientHref = options.href;
        $(this.element).attr("href", clientHref);
        if (!window._jsHrefInitialized) {
          return $(window.document.body).delegate("click", "a[data-" + dataAttribute + "]", function(e) {
            return e.preventDefault();
          });
        }
      }
    }, {
      dataAttribute: dataAttribute,
      VERSION: "0.2.1"
    });
  });
}).call(this);
