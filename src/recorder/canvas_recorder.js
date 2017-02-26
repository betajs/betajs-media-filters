// Credits: https://github.com/antimatter15/whammy/blob/master/whammy.js
// Co-Credits: https://github.com/streamproc/MediaStreamRecorder/blob/master/MediaStreamRecorder-standalone.js
Scoped.define("module:CanvasRecorder", [
  "media:WebRTC.WhammyRecorder",
  "media:WebRTC.Support",
  "module:FilterSupport"
], function (WhammyRecorder, Support, FilterSupport, scoped) {

	return WhammyRecorder.extend({scoped: scoped}, function (inherited) {

		return {

			constructor: function (stream, options) {
				inherited.constructor.call(this);
			},

			start: function () {
				if (this._started)
					return;
				this._started = true;
        if (this._options.video) {
          this._options.recordWidth = this._options.video.videoWidth || this._options.video.clientWidth;
          this._options.recordHeight = this._options.video.videoHeight || this._options.video.clientHeight;
        }
				this._video = document.createElement('video');
				this._video.width = this._options.recordWidth;
				this._video.height = this._options.recordHeight;
        this._stream = FilterSupport.filterCanvasControl(this._stream, 25);
				Support.bindStreamToVideo(this._stream, this._video);
				// this._canvas = document.createElement('canvas');
				// this._canvas.width = this._options.recordWidth;
				// this._canvas.height = this._options.recordHeight;
	       //      this._context = this._canvas.getContext('2d');
			    this._frames = [];
			    //this._isOnStartedDrawingNonBlankFramesInvoked = false;
			    this._lastTime = Time.now();
			    this._startTime = this._lastTime;
				this.trigger("started");
				Async.eventually(this._process, [], this);
			}

		};		
	}, {

		supported: function () {
			return Support.globals().webpSupport;
		}

	});
});

