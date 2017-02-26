Scoped.define("module:MediaFilters", [
  "module:FilterSupport"
], function (Support) {
  return {

    constructor: function() {
      this._tracking = window.tracking || null;
      if(!this._tracking)
        console.log('Please be sure to attach tracking script');

    },

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

    red: function() { Support.colourFilter.bind(this, 150, 0, 0, 0) },
    green: Support.colourFilter.bind(this, 0, 150, 0, 0),
    blue: Support.colourFilter.bind(this, 0, 0, 150, 0),

    none: function none(videoElement, canvas) {
      const filter = function (imgData) {
        return function (imgData) {
          return Support.filterTask(videoElement, canvas, filter);
        }
      }
    },

    grayscale: function grayscale(videoElement, canvas) {
      const filter = function (imgData) {
        const grayData = tracking.Image.grayscale(imgData.data, imgData.width, imgData.height, true);
        return new ImageData(grayData, imgData.width, imgData.height);
      };

      return Support.filterTask(videoElement, canvas, filter);
    },

    blur: function blur(videoElement, canvas) {
      const filter = function (imgData) {
        const blurData = tracking.Image.blur(imgData.data, imgData.width, imgData.height, 50);
        return new ImageData(new Uint8ClampedArray(blurData), imgData.width, imgData.height);
      };
      return filterTask(videoElement, canvas, filter);
    },

    sketch: function sketch(videoElement, canvas) {
      const filter = function (imgData) {
        const sobelData = tracking.Image.sobel(imgData.data, imgData.width, imgData.height);
        return new ImageData(new Uint8ClampedArray(sobelData), imgData.width, imgData.height);
      };
      return filterTask(videoElement, canvas, filter);
    },

    face: function face(videoElement, canvas, imageSrc) {
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
          height: canvas.height,
        };
      };

      const filter = function(imgData) {
        currentMessage = createMessage(imgData.data);
        if (!worker) {
          // We create a worker to detect the faces. We can't send the data
          // for every frame so we just send the most recent frame every time the
          // worker returns
          worker = new Worker('./js/faceWorker.bundle.js');
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
          image.src = imageSrc ||
            'https://aullman.github.io/opentok-camera-filters/images/comedy-glasses.png';
        }
        tmpCtx.putImageData(imgData, 0, 0);

        currentFaces.forEach( function (rect) {
          tmpCtx.drawImage(image, rect.x, rect.y, rect.width, rect.height);
      });
        return tmpCtx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height);
      };

      const task = filterTask(videoElement, canvas, filter);

      return {
        stop: function() {
          task.stop();
        }
      };
    }
  };
});