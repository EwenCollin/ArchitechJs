import * as THREE from '../../../build/three.module.js';

var MouseRaycast = function(raycaster, camera) {
    this.raycaster = raycaster;
    this.camera = camera;

    this.getMousePosition = function(dom, x, y) {
        const rect = dom.getBoundingClientRect();
        return new THREE.Vector2((x - rect.left) / rect.width, (y - rect.top) / rect.height);
    }
    
    this.getIntersects = function(point, objects) {
        var mouse = new THREE.Vector2((point.x * 2) - 1, - (point.y * 2) + 1);
        this.raycaster.setFromCamera(mouse, this.camera);
        return raycaster.intersectObjects(objects);
    }
}

export { MouseRaycast}