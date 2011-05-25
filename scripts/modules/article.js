define(["lib/Modularity", "articles/articles"], function(Modularity, articles) {
  var i = 0;
  return Modularity.moduleDefinitions.register("article", {

    start: function(options) {
      console.log("article start, %i", i);
      i++;
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