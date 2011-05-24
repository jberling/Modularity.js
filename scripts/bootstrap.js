require([
    "lib/Modularity",
    "lib/Modularity.Controller",
    "modules/article"
  ], function(Modularity, Controller){
  
  $(function(){
    var modularity = new Modularity();
    window.modularity = modularity;
    modularity.parseContext();
    modularity.startController("main-controller");
  });
  
});