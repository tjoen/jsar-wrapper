"use strict";

requirejs.config({
    paths: {
        createjs: 'lib/createjs-2013.05.14.min',
        threejs: 'lib/three.min',
        jsar: 'lib/JSARToolKit.min',
    },
    shim: {
        createjs: { exports: 'createjs' },
        threejs: { exports: 'THREE' },
    },
});

requirejs( ['./webcam','./augmented','detector','createjs'], function(webcam,augmented,detector) {
    var go = function() {
        var canvas = document.createElement('canvas');
        var webcamDimensions = webcam.getDimensions();
        canvas.width = webcamDimensions.width;
        canvas.height = webcamDimensions.height;
        var subsystemElement = document.getElementById("subsystem");
        subsystemElement.appendChild(canvas);
        var context = canvas.getContext('2d');


        function onMarkerCreated(marker) {
            console.log("created:", marker);
        }

        function onMarkerUpdated(marker) {
            console.log("updated:", marker);
        }

        function onMarkerDestroyed(marker) {
            console.log("destroyed:", marker);
        }

        var update =  function() {
            webcam.drawToContext(context);
            canvas.changed = true;
            ar.detect( onMarkerCreated, onMarkerUpdated, onMarkerDestroyed );
            aug1.update();
        }

        var render = function() {
            aug1.render();
        }

        function tick(params) {
            update();
            render();
        }

        var aug1 = augmented.create( webcam.getDimensions(), canvas );
        subsystemElement.appendChild( aug1.canvas );
        var ar = detector.create( canvas );

        createjs.Ticker.useRAF = true;
        createjs.Ticker.setFPS(30);
        createjs.Ticker.addEventListener("tick", tick);
    }

    webcam.waitForAuthorization( function() {
        go();
    });
});
