"use strict";

define(['threejs','jsar'],function() {
    var create = function(sourceCanvas) {
        var raster = new NyARRgbRaster_Canvas2D(sourceCanvas);
        var FLARParameters = new FLARParam(sourceCanvas.width, sourceCanvas.height);
        var FLARDetector = new FLARMultiIdMarkerDetector(FLARParameters, 120);
        FLARDetector.setContinueMode(true);

        var getCameraMatrix = function(zNear, zFar) {
            var result = new Float32Array(16);
            FLARParameters.copyCameraMatrix(result, zNear, zFar);
            return result;
        }

        var getMarkerNumber = function(idx) {
            var data = FLARDetector.getIdMarkerData(idx);
            if (data.packetLength > 4) {
                return -1;
            } 
            
            var result=0;
            for (var i = 0; i < data.packetLength; i++ ) {
                result = (result << 8) | data.getPacketData(i);
            }
            return result;
        }

        var convertToGl = function(mat) {
            var cm = new Float32Array(16);
            cm[0] = mat.m00;
            cm[1] = -mat.m10;
            cm[2] = mat.m20;
            cm[3] = 0;
            cm[4] = mat.m01;
            cm[5] = -mat.m11;
            cm[6] = mat.m21;
            cm[7] = 0;
            cm[8] = -mat.m02;
            cm[9] = mat.m12;
            cm[10] = -mat.m22;
            cm[11] = 0;
            cm[12] = mat.m03;
            cm[13] = -mat.m13;
            cm[14] = mat.m23;
            cm[15] = 1;
            return cm;
        }

        var getTransformMatrix = function(idx) {
            var resultMat = new NyARTransMatResult();
            FLARDetector.getTransformMatrix(idx, resultMat);
            return convertToGl(resultMat);
        }

        var persistTime = 1;
        var newMarker = function(id, matrix) {
            return {
                id: id,
                matrix: matrix,
                age: persistTime,
            }
        }

        var markers = {};
        var detect = function( onCreate, onUpdate, onDestroy ) {
            var markerCount = FLARDetector.detectMarkerLite(raster, 60); 
            for( var index = 0; index < markerCount; index++ ) {
                var id = getMarkerNumber(index);
                var marker = markers[id];
                if( marker === undefined ) {
                    marker = newMarker(id, getTransformMatrix(index));
                    markers[id] = marker;
                    onCreate( marker );
                }
                else {
                    marker.matrix = getTransformMatrix(index);
                    marker.age = persistTime;
                    onUpdate( marker );
                }
            }

            for( var id in markers ) {
                var marker = markers[id];
                if( marker ) {
                    if( marker.age-- == 0 ) {
                        onDestroy( marker );
                        delete markers[id];
                    }
                }
            }
        }

        return {
            detect: detect,
            getCameraMatrix: getCameraMatrix,
        }
    }

    return {
        create: create,
    }
});
