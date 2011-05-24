(function($){

  $.fn.fixToTop = function(){
    this.each(function(){
      var $this     = $(this),
          $window   = $(window),
          inAbsMode = true,
          offsetTop = $this.offset().top,
          timer,

          whenScrolled = function(){
            var scrollTop = $window.scrollTop();
            if (offsetTop < scrollTop + 5) {
              $this.addClass("fixed").removeClass("absolute");
              inAbsMode = false;
            }
            else {
              $this.addClass("absolute").removeClass("fixed");
              inAbsMode = true;
            }
          };

      // För att inte whenScrolled ska anropas för ofta används en timer
      $window.scroll(function(){
        if (inAbsMode) {
          whenScrolled();
        }
        else {
          if(timer){
            clearTimeout(timer);
          }
          timer = setTimeout(whenScrolled, 100);
        }
      });
    });
  };

}(jQuery));