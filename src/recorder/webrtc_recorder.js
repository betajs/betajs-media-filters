Scoped.define("module:RecorderFilter", [
  "media:WebRTC.RecorderWrapper",
  "module:MediaFilters"
], function (RecorderWrapper, MediaFilters, scoped) {

  return RecorderWrapper.extend({scoped: scoped}, function(inherited) {

    return {
      constructor: function (options) {
        inherited.constructor.call(this, options);
      }
    }

  }, {

    applyFilter: function (filterFunction, videoObj) {
      var canvas = document.querySelector('.ba-video-' + videoObj._stream.id);
      if(!canvas)
        MediaFilters[filterFunction](videoObj);
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
