define([
    "text!./intro.html!strip",
    "text!./progressive-enhancement.html!strip",
    "text!./core.html!strip",
    "text!./module.html!strip",
    "text!./module-library.html!strip",
    "text!./change-log.html!strip",
    "text!./roadmap.html!strip"
  ], function(intro, progressiveEnhancement, core, module, moduleLibrary, changeLog, roadmap){

  return {
    intro                     : intro,
    "progressive-enhancement" : progressiveEnhancement,
    core                      : core,
    module                    : module,
    "module-library"          : moduleLibrary,
    "change-log"              : changeLog,
    "roadmap"                 : roadmap
  };

})