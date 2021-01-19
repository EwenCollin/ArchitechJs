import * as THREE from '../../../build/three.module.js';
import { MouseRaycast } from '../utils/mouseRaycast.js';

var Pointer = function(scene, raycaster, camera, rendererDomElement) {
    var self = this;
    this.raycaster = raycaster;
    this.camera = camera;

    this.rendererDomElement = rendererDomElement;

    this.scene = scene;

    this.mousePointerCube;


    this.mouseRaycast = new MouseRaycast(this.raycaster, this.camera)

    this.resetSceneContent = function() {
        self.scene.remove(self.mousePointerCube);
    }
    
    this.init = function() {
        this.mousePointerCube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshPhongMaterial({ color: 0xff00ff, flatShading: true }));
        this.scene.add(this.mousePointerCube);
    }
    this.init();

    this.movePointer = function(x, y) {
        const onClickPosition = self.mouseRaycast.getMousePosition(self.rendererDomElement, x, y);
        const intersects = self.mouseRaycast.getIntersects(onClickPosition, self.scene.children);
        var done = false;
        var i = 0;
        while (i < intersects.length && !done) {
            if (intersects[i].object.position !== self.mousePointerCube.position) {
                self.mousePointerCube.position.set(intersects[i].point.x, intersects[i].point.y, intersects[i].point.z);
                done = true;
            }
            i++;
        }
    }
    
    this.getPointer = function() {return self.mousePointerCube};
    
}

export { Pointer}