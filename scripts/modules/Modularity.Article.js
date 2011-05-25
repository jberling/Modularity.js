define(["./Modularity", "articles/articles"], function(Modularity, articles) {

  return Modularity.moduleDefinitions.register("article", {

    start: function(options) {
      var articleName = this.id.split(":")[0];
      var content = articles[options.name || articleName];
      $(this.element)
        .hide()
        .html(content)
        .fadeIn("slow");
      hljs.initHighlighting.called = false;
      hljs.initHighlighting();
    },

    destroy: function() {
      $(this.element)
        .fadeOut("slow", function(){
          $(this).html("");
        });
    }

  }, { dataAttribute: "article" });

});
