(function() {
  define(["./Modularity"], function(Modularity, articles) {
    return Modularity.moduleDefinitions.register("article", {
      start: function(options) {
        var path, self;
        self = this;
        path = options.path || ("articles/" + (this.key.split(":")[0]) + ".html");
        return require(["text!" + path + "!strip"], function(content) {
          return $(self.element).hide().html(content).fadeIn("slow");
        });
      },
      destroy: function() {
        return $(this.element).fadeOut("slow", function() {
          return $(this).html("");
        });
      }
    }, {
      dataAttribute: "article",
      VERSION: "0.2.1"
    });
  });
}).call(this);
