require([
    "modules/Modularity",
    "modules/Modularity.Controller",
    "modules/Modularity.Article",
    "modules/Modularity.JsHref"
  ], function(Modularity){
  
  $(function(){
    var modularity = new Modularity();
    window.modularity = modularity;
    modularity.parseContext();
    modularity.startController("main-controller");
  });
  
});