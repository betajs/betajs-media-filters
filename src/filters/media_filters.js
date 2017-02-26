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