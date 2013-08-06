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

        var reality = {
            camera: new THREE.Camera(),
            scene: new THREE.Scene(),
        }

        var augmentation = {
            camera: new THREE.Camera(),
            scene: new THREE.Scene(),
        }

        var texture = new THREE.Texture(sourceCanvas);
        var plane = new THREE.Mesh(
           new THREE.PlaneGeometry(2, 2, 0),
           new THREE.MeshBasicMaterial({
               map: texture,
               depthTest: false,
               depthWrite: false
           })
        );
        reality.scene.add(plane);

        return {
            update: function() {
                texture.needsUpdate = true;
            },
            render: function() {
                renderer.render(reality.scene, reality.camera);
            },
            canvas: canvas,
        }
    }

    return {
        create: create,
    }
});
