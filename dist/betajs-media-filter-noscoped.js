/*!
betajs-media-filter - v0.0.44 - 2017-02-22
Copyright (c) Ziggeo,Oliver Friedmann
Apache-2.0 Software License.
*/

(function () {
var Scoped = this.subScope();
Scoped.binding('module', 'global:BetaJS.MediaFilter');
Scoped.binding('media', 'global:BetaJS.Media');
Scoped.binding('base', 'global:BetaJS');
Scoped.binding('browser', 'global:BetaJS.Browser');
Scoped.binding('flash', 'global:BetaJS.Flash');
Scoped.binding('jquery', 'global:jQuery');
Scoped.define("module:", function () {
	return {
    "guid": "8475efdb-dd7e-402e-9f50-36c76945a692",
    "version": "0.0.44"
};
});
Scoped.assumeVersion('base:version', '~1.0.96');
Scoped.assumeVersion('browser:version', '~1.0.61');
Scoped.assumeVersion('media:version', 'undefined');

Scoped.define ("module:FilterSupport", [], function () {
  return {

    createFilterCanvas: function (videoObject) {
      var videoElement = videoObject._video;
      var videoParentNode = videoElement.parentNode;
      var videoHeight = videoElement.clientHeight;
      var videoWidth = videoElement.clientWidth;
      var newClassName = 'ba-video-' + videoObject._stream.id;

      if (!canvas)
        canvas = document.createElement('canvas');
      //canvas = videoElement.insertAfter('canvas', videoElement.nextSibling);

      canvas.height = videoHeight;
      canvas.width = videoWidth;

      videoParentNode.appendChild(canvas);

      canvas.className = newClassName;
      videoElement.style.display = 'none';

      return canvas;
    },

    filterTask: function (videoObject, canvas, selectedFilter) {
      var videoElement = videoObject._video;
      var tmpCanvas;
      var tmpCtx;
      var ctx;
      var stopped = false;

      if (!canvas)
        this.createFilterCanvas(videoObject);

      // Draws a frame on the specified canvas after applying the selected filter every
      // requestAnimationFrame
      const drawFrame = function drawFrame() {
        if (!ctx) {
          ctx = canvas.getContext('2d');
        }

        if (!tmpCanvas) {
          tmpCanvas = document.createElement('canvas');
          tmpCtx = tmpCanvas.getContext('2d');
          tmpCanvas.width = canvas.width;
          tmpCanvas.height = canvas.height;
        }

        tmpCtx.drawImage(videoElement, 0, 0, tmpCanvas.width, tmpCanvas.height);
        const imgData = tmpCtx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height);
        const data = selectedFilter(imgData);
        ctx.putImageData(data, 0, 0);
        if (!stopped) {
          requestAnimationFrame(drawFrame);
        } else {
          tmpCanvas = null;
          tmpCtx = null;
          ctx = null;
        }
      };

      requestAnimationFrame(drawFrame);

      return {
        stop: function () {
          stopped = true;
        }
      }
    },

    colourShift: function (r, g, b, a, imgData) {
      const res = new Uint8ClampedArray (imgData.data.length);
      for (var i = 0; i < imgData.data.length; i += 4) {
        res[i] = Math.min(255, imgData.data[i] + r);
        res[i + 1] = Math.max(0, Math.min(255, imgData.data[i + 1] + g));
        res[i + 2] = Math.max(0, Math.min(255, imgData.data[i + 2] + b));
        res[i + 3] = Math.max(0, Math.min(255, imgData.data[i + 3] + a));
      }
      const resData = new ImageData(res, imgData.width, imgData.height);
      return resData;
    },

    colourFilter: function (r, g, b, a, videoElement, canvas) {
      return this.filterTask(videoElement, canvas, this.colourShift.bind (this, r, g, b, a));
    },

    // Will get canvas stream for recording
    // apply captureStream and will return new stream
    filterCanvasControl: function (stream, framesPerSecond) {
      var fps = framesPerSecond || 25;
      var selector = '.ba-video-' + stream.id;
      var canvas = document.querySelector(selector);
      if (canvas) {
        stream = canvas.captureStream(fps);
        canvas.className = 'ba-video-' + stream.id;
      }

      return stream;
    }
  }
});

Scoped.define("module:MediaFilters", [
  "module:FilterSupport"
], function (Support, scoped) {
  return {

    invert: function (videoObject, canvas) {
      const filter = function (imgData) {
        const res = new Uint8ClampedArray(imgData.data.length);
        for (var i = 0; i < imgData.data.length; i += 4) {
          res[i] = 255 - imgData.data[i];
          res[i + 1] = 255 - imgData.data[i + 1];
          res[i + 2] = 255 - imgData.data[i + 2];
          res[i + 3] = imgData.data[i + 3];
        }
        const resData = new ImageData (res, imgData.width, imgData.height);
        return resData;
      };

      return Support.filterTask(videoObject, canvas, filter);
    },

    red: function(videoObject, canvas) { Support.colourFilter(150, 0, 0, 0, videoObject, canvas) },
    green: function (videoObject, canvas) {Support.colourFilter(0, 150, 0, 0, videoObject, canvas) },
    blue: function (videoObject, canvas) {Support.colourFilter(0, 0, 150, 0, videoObject, canvas)},

    none: function (videoElement, canvas) {
      const filter = function (imgData) {
        return function (imgData) {
          return Support.filterTask(videoElement, canvas, filter);
        }
      }
    },

    grayscale: function (videoElement, canvas) {
      const filter = function (imgData) {
        const grayData = tracking.Image.grayscale(imgData.data, imgData.width, imgData.height, true);
        return new ImageData(grayData, imgData.width, imgData.height);
      };

      return Support.filterTask(videoElement, canvas, filter);
    },

    blur: function (videoElement, canvas) {
      const filter = function (imgData) {
        const blurData = tracking.Image.blur(imgData.data, imgData.width, imgData.height, 50);
        return new ImageData(new Uint8ClampedArray(blurData), imgData.width, imgData.height);
      };
      return Support.filterTask(videoElement, canvas, filter);
    },

    sketch: function (videoElement, canvas) {
      const filter = function (imgData) {
        const sobelData = tracking.Image.sobel(imgData.data, imgData.width, imgData.height);
        return new ImageData(new Uint8ClampedArray(sobelData), imgData.width, imgData.height);
      };
      return Support.filterTask(videoElement, canvas, filter);
    },

    face: function (videoElement, canvas, imageSrc) {
      // Draw on the canvas with no filter every requestAnimationFrame
      var tmpCanvas;
      var tmpCtx;
      var image;
      var currentFaces = [];
      var currentMessage;
      var worker;

      const createMessage = function createMessage(dataArray) {
        return {
          array: dataArray,
          width: canvas.width,
          height: canvas.height
        };
      };

      const filter = function (imgData) {
        currentMessage = createMessage(imgData.data);
        if (!worker) {
          // We create a worker to detect the faces. We can't send the data
          // for every frame so we just send the most recent frame every time the
          // worker returns
          worker = new Worker('../vendors/face-worker.js');
          worker.addEventListener('message', function (event) {
            console.log(event.data);
            if (event.data.length) {
              currentFaces = event.data;
            } else {
              currentFaces = [];
            }
            if (currentMessage) {
              worker.postMessage(currentMessage);
            }
          });

          worker.postMessage(currentMessage);
        }

        if (!tmpCanvas) {
          tmpCanvas = document.createElement('canvas');
          tmpCtx = tmpCanvas.getContext('2d');
          tmpCanvas.width = canvas.width;
          tmpCanvas.height = canvas.height;
          image = document.createElement('img');
          image.src = imageSrc || '../vendors/images/comedy-glasses.png';
        }
        tmpCtx.putImageData(imgData, 0, 0);

        currentFaces.forEach(function (rect) {
          tmpCtx.drawImage(image, rect.x, rect.y, rect.width, rect.height);
        });
        return tmpCtx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height);
      };

      const task = Support.filterTask(videoElement, canvas, filter);

      return {
        stop: function() {
          task.stop();
        }
      };
    },

    eye: function (videoObject, canvas) {
      // Draw on the canvas with no filter every requestAnimationFrame
      var tmpCanvas;
      var tmpCtx;
      var videoElement = videoObject._video;

      if (!tmpCanvas) {
        tmpCanvas = document.createElement('canvas');
        tmpCtx = tmpCanvas.getContext('2d');
        tmpCanvas.width = canvas.width;
        tmpCanvas.height = canvas.height;
      }


      var tracker = new tracking.ObjectTracker(['eye']);
      tracker.stepSize(1.7);

      tracking.track(videoElement, tracker, {camera: true});

      tracker.on('track', function (ev) {
        tmpCtx.clearRect(0, 0, tmpCanvas.width, tmpCanvas.height);

        ev.data.forEach(function (rect) {
          tmpCtx.strokeStyle = "#ff0dd0";
          tmpCtx.strokeRect(rect.x, rect.y, rect.width, rect.height);
        })
      });
    }


  }

});
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
				inherited.constructor.call(this, stream, options);
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

}).call(Scoped);