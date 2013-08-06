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

requirejs( ['./webcam','./arview','./ardetector','createjs','threejs'], function(webcam,arview,ardetector) {
    var go = function() {
        var canvas = document.createElement('canvas');
        var webcamDimensions = webcam.getDimensions();
        canvas.width = webcamDimensions.width;
        canvas.height = webcamDimensions.height;
        var context = canvas.getContext('2d');

        var createBaseModel = function() {
            var that = {};
            that.model = new THREE.Object3D();
            that.model.matrixAutoUpdate = false;
            that.transform = function(matrix) {
                that.model.matrix.setFromArray( matrix );
                that.model.matrixWorldNeedsUpdate = true;
            }
            return that;
        }

        function createMarkerModel(color) {
            var mesh = new THREE.Mesh(
                new THREE.CubeGeometry( 100,100,100 ),
                new THREE.MeshBasicMaterial( {color:color, side:THREE.DoubleSide } )
            );
            var result = createBaseModel();
            result.model.add(mesh);
            return result;
        }

        var markerModels = {
            16: createMarkerModel(0xAA0000),
            32: createMarkerModel(0x00BB00),
        };

        function onMarkerCreated(marker) {
            markerModels[marker.id].transform( marker.matrix );
            aug1.addModel( markerModels[marker.id].model );
        }

        function onMarkerUpdated(marker) {
            markerModels[marker.id].transform( marker.matrix );
        }

        function onMarkerDestroyed(marker) {
            aug1.removeModel( markerModels[marker.id].model );
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

        var aug1 = arview.create( webcam.getDimensions(), canvas );
        document.getElementById("application").appendChild( aug1.canvas );
        var ar = ardetector.create( canvas );
        aug1.setCameraMatrix( ar.getCameraMatrix(10,10000) );

        createjs.Ticker.useRAF = true;
        createjs.Ticker.setFPS(30);
        createjs.Ticker.addEventListener("tick", tick);
    }

    webcam.waitForAuthorization( function() {
        go();
    });
});
