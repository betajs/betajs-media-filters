self.window = self;
const tracking = window.tracking = {};

importScripts('../node_modules/tracking/build/tracking-min.js',
  '../node_modules/tracking/build/data/face-min.js');

var faceTracker;

self.addEventListener('message', function (ev) {
  const arr = new Uint8ClampedArray(ev.data.array);

  if (!faceTracker) {
    faceTracker = new tracking.ObjectTracker(['face']);
    faceTracker.setInitialScale(4);
    faceTracker.setStepSize(2);
    faceTracker.setEdgesDensity(0.1);
  }

  faceTracker.once('track', function (faceEvent) {
    self.postMessage(faceEvent.data);
  });

  faceTracker.track(arr, ev.data.width, ev.data.height);
});