Scoped.define ("module:FilterSupport", [], function () {
  return {
    filterTask: function (videoObject, canvas, selectedFilter) {
      var videoElement = videoObject._video;
      var videoParentNode = videoElement.parentNode;
      var videoHeight = videoElement.clientHeight;
      var videoWidth = videoElement.clientWidth;
      var newClassName = 'ba-video-' + videoObject._stream.id;
      var tmpCanvas;
      var tmpCtx;
      var ctx;
      var stopped = false;
      //var videoParentNode = videoElement.parentElement;

      if (!canvas)
        canvas = document.createElement('canvas');
      //canvas = videoElement.insertAfter('canvas', videoElement.nextSibling);

      canvas.height = videoHeight;
      canvas.width = videoWidth;

      videoParentNode.appendChild(canvas);

      canvas.className = newClassName;
      videoElement.style.display = 'none';

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

    colourFilter: function (r, g, b, a, videoElement, canvas) {
      return Support.filterTask(videoElement, canvas, colourShift.bind (this, r, g, b, a));
    },

    // Will get canvas stream for recording
    // apply captureStream and will return new stream
    filterCanvasControl: function (stream, framesPerSecond ) {
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
