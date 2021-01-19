import * as THREE from '../../../build/three.module.js';
import { MeshTransform } from '../utils/MeshTransform.js';

var RectMesh = function(scene, mousePointerCube, transformControl) {
    var self = this;
    this.scene = scene;
    this.currentRectGroup = new THREE.Group();
    this.scene.add(this.currentRectGroup);

    this.meshTransform = new MeshTransform();

    //Current rect object

    this.currentRect;

    this.mousePointerCube = mousePointerCube;
    this.transformControl = transformControl;

    this.isDrawingRect = false;
    this.rectOrigin = new THREE.Vector3();

    this.resetSceneContent = function() {
        self.currentRectGroup.clear();
        self.scene.remove(self.currentRectGroup);
    }

    this.initCurrentRect = function() {
        var rectBoxBufferGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
	    var rectMaterial = new THREE.MeshStandardMaterial({ color: 0x7777ff }); //TODO : get real selected color

        self.currentRect = new THREE.Mesh(rectBoxBufferGeometry, rectMaterial);
        self.currentRectGroup.add(self.currentRect)
    }
    this.initCurrentRect();

    this.makeRect = function() {
        if (!self.isDrawingRect) {
            self.isDrawingRect = true;
            self.currentRect.position.copy(self.mousePointerCube.position.clone());
            self.currentRect.scale.set(0, 0, 0);
            self.rectOrigin.copy(self.mousePointerCube.position.clone());
        }
    
        if (self.currentRect.scale.x < 0.1 && self.currentRect.scale.x > -0.1) self.currentRect.scale.x = 0.1;
        if (self.currentRect.scale.y < 0.1 && self.currentRect.scale.y > -0.1) self.currentRect.scale.y = 0.1;
        if (self.currentRect.scale.z < 0.1 && self.currentRect.scale.z > -0.1) self.currentRect.scale.z = 0.1;
    
        self.currentRect.scale.copy(self.mousePointerCube.position.clone().sub(self.rectOrigin));
        self.currentRect.position.set((self.mousePointerCube.position.clone().x + self.rectOrigin.clone().x) / 2, (self.mousePointerCube.position.clone().y + self.rectOrigin.clone().y) / 2, (self.mousePointerCube.position.clone().z + self.rectOrigin.clone().z) / 2);    
    }

    this.releaseRect = function() {
        if (self.isDrawingRect) {
            self.isDrawingRect = false;
            if (self.currentRect.scale.x < 0.1 && self.currentRect.scale.x > -0.1) self.currentRect.scale.x = 0.1;
            if (self.currentRect.scale.y < 0.1 && self.currentRect.scale.y > -0.1) self.currentRect.scale.y = 0.1;
            if (self.currentRect.scale.z < 0.1 && self.currentRect.scale.z > -0.1) self.currentRect.scale.z = 0.1;
            
            //Add directly mesh to scene
            var newRect = self.currentRect.clone();
            self.scene.add(newRect);
            newRect.castShadow = true;
            newRect.receiveShadow = true;
            self.currentRectGroup.remove(self.currentRect);
            self.currentRect.material.dispose();
            self.currentRect.geometry.dispose();
            self.transformControl.attach(newRect)

            //NEXT RECT
            self.initCurrentRect();
        }
    }
}

export { RectMesh }