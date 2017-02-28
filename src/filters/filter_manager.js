
Scoped.define("module:FilterManager", [
  "module:Filters",
  "module:FilterSupport"
], function (Filters, Support) {

  return {

    applyFilter: function (filterFunction, videoObj) {
      var canvas = document.querySelector('.ba-video-' + videoObj._stream.id);
      // Check if canvas was created, if not run function. Need destroy old canvas before
      if(!canvas) {
        canvas = Support.createFilterCanvas(videoObj);
        Filters[filterFunction](videoObj, canvas);
      }
      return false;
    },

    destroyFilter: function (videoObj) {
      var canvas = document.querySelector('.ba-video-' + videoObj._stream.id);
      if(canvas) {
        canvas.remove();
        videoObj._video.style.display = 'block';
      }
    }
  };
});