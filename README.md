# betajs-media-filters 0.0.03


BetaJS-Media-Filters allow to add filters to WebRTC video using latest Chrome and FireFox browsers



## Getting Started


This repository is based on betajs open-source project also use HTMLCanvasElement.captureStream()
which is currently on [Editor's Draft](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/captureStream) status.


You can use the library in the browser and compile it as well.

#### Browser

```javascript
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.js"></script>
    <script src="tracking/build/tracking-min.js"></script>
    <script src="betajs-shims/dist/betajs-shims.js"></script>
    <script src="betajs-scoped/dist/scoped.js"></script>
    <script src="betajs/dist/beta-noscoped.js"></script>
    <script src="betajs-browser/dist/betajs-browser-noscoped.js"></script>
    <script src="betajs-media/dist/betajs-media.js"></script>
    <script src="betajs-media-filters/dist/betajs-media-filters-noscoped.js"></script>
``` 

#### Compile

```javascript
	git clone https://github.com/betajs/betajs-media-filters.git
	npm install
	grunt
```



## Basic Usage


after installing npm packages run 

`node node_modules/nano-media-server/server.js --staticserve .`

as soon as 5000 port will start running, you can check and test it on

`http://localhost:5000/static/demos/filter.html`


## Links
| Resource   | URL |
| :--------- | --: |
| Homepage   | [http://betajs.com](http://betajs.com) |
| Git        | [git://github.com/betajs/betajs-media-filters.git](git://github.com/betajs/betajs-media-filters.git) |
| Repository | [https://github.com/betajs/betajs-media-filters](https://github.com/betajs/betajs-media-filters) |
| Blog       | [http://blog.betajs.com](http://blog.betajs.com) | 
| Twitter    | [http://twitter.com/thebetajs](http://twitter.com/thebetajs) | 
 



## Compatability
| Target | Versions |
| :----- | -------: |
| Firefox | 43 - Latest |
| Chrome | 52 - Latest |


## CDN
| Resource | URL |
| :----- | -------: |
| betajs-media-filters.js | [http://cdn.rawgit.com/betajs/betajs-media/master/dist/betajs-media-filters.js](http://cdn.rawgit.com/betajs/betajs-media/master/dist/betajs-media-filters.js) |
| betajs-media-filters.min.js | [http://cdn.rawgit.com/betajs/betajs-media/master/dist/betajs-media-filters.min.js](http://cdn.rawgit.com/betajs/betajs-media/master/dist/betajs-media-filters.min.js) |
| betajs-media-filters-noscoped.js | [http://cdn.rawgit.com/betajs/betajs-media/master/dist/betajs-media-filters-noscoped.js](http://cdn.rawgit.com/betajs/betajs-media/master/dist/betajs-media-filters-noscoped.js) |
| betajs-media-filters-noscoped.min.js | [http://cdn.rawgit.com/betajs/betajs-media/master/dist/betajs-media-filters-noscoped.min.js](http://cdn.rawgit.com/betajs/betajs-media/master/dist/betajs-media-filters-noscoped.min.js) |


## Unit Tests
| Resource | URL |
| :----- | -------: |
| Test Suite | [Run](http://rawgit.com/betajs/betajs-media-filters/master/tests/tests.html) |


## Dependencies
| Name | URL |
| :----- | -------: |
| betajs | [Open](https://github.com/betajs/betajs) |
| betajs-browser | [Open](https://github.com/betajs/betajs-browser) |
| tracking | [Open](^1.1.3) |


## Weak Dependencies
| Name | URL |
| :----- | -------: |
| betajs-scoped | [Open](https://github.com/betajs/betajs-scoped) |
| betajs-shims | [Open](https://github.com/betajs/betajs-shims) |


## Main Contributors

- Ziggeo
- Oliver Friedmann

## License

Apache-2.0


## Credits

This software may include modified and unmodified portions of:
- TypedArray, From microphone to .WAV with: getUserMedia and Web Audio, (c) Thibault Imbert
- Media Stream Recorder, https://github.com/streamproc/MediaStreamRecorder
- Whammy Recorder, https://github.com/antimatter15/whammy
- TrackingJS, developed by Eduardo A. Lundgren Melo, https://github.com/eduardolundgren/tracking.js




## Sponsors

- Ziggeo
- Browserstack


