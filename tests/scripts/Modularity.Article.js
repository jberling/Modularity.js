(function() {
  define(["./Modularity", "articles/articles"], function(Modularity, articles) {
    return Modularity.moduleDefinitions.register("article", {
      start: function(options) {
        var articleName, content;
        articleName = this.id.split(":")[0];
        content = articles[options.name || articleName];
        return $(this.element).hide().html(content).fadeIn("slow");
      },
      destroy: function() {
        return $(this.element).fadeOut("slow", function() {
          return $(this).html("");
        });
      }
    }, {
      dataAttribute: "article",
      VERSION: "0.2.0"
    });
  });
}).call(this);
