/* This probably requires some Selenium-type interaction */
mytest("simulate recording", function () {
	$("#visible-fixture").html('<video></video>');
    var instance = BetaJS.Media.Recorder.VideoRecorderWrapper.create({
		element: $("video").get(0),
		simulate: true
    });		    
    instance.ready.success(function () {
    	instance.bindMedia().success(function () {
    		instance.startRecord().success(function () {
	    		setTimeout(function () {
	    			instance.stopRecord().success(function () {
		    			ok(true);
		    			start();
		    			instance.destroy();
		    			$("#visible-fixture").html('');
	    			});
	    		}, 2500);
    		});
    	});
    });
}, {selenium: true});
