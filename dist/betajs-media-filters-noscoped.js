/*!
betajs-media-filters - v0.0.02 - 2017-02-27
Copyright (c) Ziggeo,Oliver Friedmann
Apache-2.0 Software License.
*/

(function () {
var Scoped = this.subScope();
Scoped.binding('module', 'global:BetaJS.MediaFilters');
Scoped.binding('media', 'global:BetaJS.Media');
Scoped.binding('base', 'global:BetaJS');
Scoped.binding('browser', 'global:BetaJS.Browser');
Scoped.binding('flash', 'global:BetaJS.Flash');
Scoped.binding('jquery', 'global:jQuery');
Scoped.define("module:", function () {
	return {
    "guid": "8475efdb-dd7e-402e-9f50-36c76945a692",
    "version": "0.0.02"
};
});
Scoped.assumeVersion('base:version', '~1.0.96');
Scoped.assumeVersion('browser:version', '~1.0.61');
Scoped.assumeVersion('media:version', 'undefined');

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

Scoped.define("module:Filters", [
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

}).call(Scoped);