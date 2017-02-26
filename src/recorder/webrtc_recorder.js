Scoped.define("module:RecorderFilter", [
  "media:WebRTC.RecorderWrapper",
  "module:MediaFilters",
  "module:FilterSupport"
], function (RecorderWrapper, MediaFilters, Support, scoped) {

  return RecorderWrapper.extend({scoped: scoped}, function(inherited) {

    return {
      constructor: function (options) {
        inherited.constructor.call(this, options);
      },

      stream: function () {
        return this._stream;
      }
    }

  }, {

    applyFilter: function (filterFunction, videoObj) {
      var canvas = document.querySelector('.ba-video-' + videoObj._stream.id);
      // Check if canvas was created, if not run function. Need destroy old canvas before
      if(!canvas) {
        canvas = Support.createFilterCanvas(videoObj);
        MediaFilters[filterFunction](videoObj, canvas);
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
  }, {});
});