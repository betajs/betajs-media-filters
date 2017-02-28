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