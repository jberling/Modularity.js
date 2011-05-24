define([
    "text!./intro.html!strip",
    "text!./progressive-enhancement.html!strip",
    "text!./module.html!strip",
    "text!./controller.html!strip",
    "text!./module-library.html!strip",
    "text!./change-log.html!strip",
    "text!./roadmap.html!strip"
  ], function(intro, progressiveEnhancement, module, controller, moduleLibrary, changeLog, roadmap){

  return {
    intro                     : intro,
    "progressive-enhancement" : progressiveEnhancement,
    module                    : module,
    controller                : controller,
    "module-library"          : moduleLibrary,
    "change-log"              : changeLog,
    "roadmap"                 : roadmap
  };

})