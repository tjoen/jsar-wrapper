"use strict";
define([],function() {
    var URL = window.URL || window.webkitURL;

    if (!URL.createObjectURL) {
        throw new Error("URL.createObjectURL not found.");
    }

    var getUserMedia = function(t, onsuccess, onerror) {
        var result = undefined;
        if (navigator.getUserMedia) {
            result = navigator.getUserMedia(t, onsuccess, onerror);
        } else if (navigator.webkitGetUserMedia) {
            result = navigator.webkitGetUserMedia(t, onsuccess, onerror);
        } else if (navigator.mozGetUserMedia) {
            result = navigator.mozGetUserMedia(t, onsuccess, onerror);
        } else if (navigator.msGetUserMedia) {
            result = navigator.msGetUserMedia(t, onsuccess, onerror);
        } else {
            onerror(new Error("No getUserMedia implementation found."));
        }
        return result;
    };

    var ready = false;
    var onGetUserMediaSuccess = function(stream) {
        var element = document.querySelector('video');
        var url = URL.createObjectURL(stream);
        element.src = url;
        element.play();
        ready = true;
        if( authorizedCallback ) {
            authorizedCallback();
        }
    }

    var authorizedCallback = undefined;
    var waitForAuthorization = function(callback) {
        authorizedCallback = callback;
        if(ready) {
            callback();
        }
    }

    var onGetUserMediaError = function(error) {
        alert("Couldn't access webcam.");
        console.log(error);
    }

    var element = document.createElement('video');
    element.width = 640;
    element.height = 480;
    element.autoplay = true;
    var subsystemElement = document.getElementById("subsystem");
    subsystemElement.appendChild(element);

    getUserMedia(
        {'video': true},
        onGetUserMediaSuccess, onGetUserMediaError
    );
    
    var getDimensions = function() {
        return {width:element.width, height:element.height}
    }

    var drawToContext = function(context) {
        context.drawImage(element, 0, 0);
    }

    return {
        waitForAuthorization: waitForAuthorization,
        drawToContext:drawToContext,
        getDimensions:getDimensions,
    }
}());
