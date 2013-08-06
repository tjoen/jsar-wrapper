"use strict";

define(["threejs"], function() {
    THREE.Matrix4.prototype.setFromArray = function(m) {
        return this.set(
          m[0], m[4], m[8], m[12],
          m[1], m[5], m[9], m[13],
          m[2], m[6], m[10], m[14],
          m[3], m[7], m[11], m[15]
        );
    }

    var create = function(dimensions, sourceCanvas) {
        var canvas = document.createElement('canvas');
        var renderer = new THREE.WebGLRenderer({canvas:canvas});
        renderer.setSize(dimensions.width, dimensions.height);
        renderer.autoClear = false;

        var reality = (function(){
            var texture = new THREE.Texture(sourceCanvas);
            var camera = new THREE.Camera();
            var scene = new THREE.Scene();
            scene.add( new THREE.Mesh(
               new THREE.PlaneGeometry(2, 2, 0),
               new THREE.MeshBasicMaterial({
                   map: texture,
                   depthTest: false,
                   depthWrite: false
               })
            ));

            function update() {
                texture.needsUpdate = true;
            }

            return {
                camera: camera,
                scene: scene,
                update: update, 
            }
        })();

        var virtual = {
            camera: new THREE.Camera(),
            scene: new THREE.Scene(),
        }

        var spotLight = new THREE.PointLight(0xcccccc);
        spotLight.position.set(0, 0, 2500);
        virtual.scene.add(spotLight);

        function addModel(model) {
            virtual.scene.add(model);
        }

        function removeModel(model) {
            virtual.scene.remove(model);
        }

        function setCameraMatrix( matrix ) {
            virtual.camera.projectionMatrix.setFromArray( matrix );
        }

        return {
            update: function() {
                reality.update();
            },
            render: function() {
                renderer.render(reality.scene, reality.camera);
                renderer.render(virtual.scene, virtual.camera);
            },
            canvas: canvas,
            addModel: addModel,
            removeModel: removeModel
            setCameraMatrix: setCameraMatrix,
        }
    }

    return {
        create: create,
    }
});
