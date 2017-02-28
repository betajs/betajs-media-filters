
Scoped.define("module:StreamsFilter", [
  "media:WebRTC.RecorderWrapper",
  "module:FilterSupport"
], function (RecorderWrapper, FilterSupport, scoped) {

  return RecorderWrapper.extend({scoped: scoped}, function(inherited) {
    return {
      constructor: function (options) {
        inherited.constructor.call(this, options);
      },

      applyFilteredStream: function(instance, fps) {
        instance._stream = FilterSupport.filterCanvasControl(instance._stream, fps);
        instance._whammyRecorder._stream = instance._stream;
        return instance;
      }
    }
  });
});