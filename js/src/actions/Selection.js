import * as THREE from '../../../build/three.module.js';
import { MeshTransform } from '../utils/MeshTransform.js';
import { MouseRaycast } from '../utils/mouseRaycast.js';

var Selection = function (scene, camera, raycaster, rendererDomElement, mousePointerCube, transformControl) {
    var self = this;
    this.mousePointerCube = mousePointerCube;

    this.scene = scene;

    this.rendererDomElement = rendererDomElement;

    this.camera = camera;
    this.raycaster = raycaster;

    this.mouseRaycast = new MouseRaycast(this.raycaster, this.camera);

    this.meshSelection = [];

    this.transformControl = transformControl;

    this.meshTransform = new MeshTransform();

    this.cutMinAmount = 0.5;

    this.meshSelectionGroup;

    this.tick = function() {
        this.highlightSelection();
        this.updateSelectionChildrenMatrix();
    }

    this.init = function() {
        this.meshSelectionGroup = new THREE.Group();
        this.scene.add(this.meshSelectionGroup);
    }
    this.init();

    this.resetSceneContent = function() {
        this.meshTransform.moveToGroup(this.meshSelectionGroup, this.scene);
        this.meshSelection = [];
        this.scene.remove(this.meshSelectionGroup);
    }

    this.selectMeshes = function(mousePos) {
        const onClickPosition = this.mouseRaycast.getMousePosition(this.rendererDomElement, mousePos.x, mousePos.y);

        const intersects = this.mouseRaycast.getIntersects(onClickPosition, this.scene.children);
        const intersectsToRemove = this.mouseRaycast.getIntersects(onClickPosition, this.meshSelectionGroup.children);

        var done = false;
        var i = 0;
        var selectedNewMesh = undefined;
        while (i < intersects.length && !done) {
            if (intersects[i].object.position !== this.mousePointerCube.position) {
                if (!this.meshSelection.includes(intersects[i].object)) {
                    selectedNewMesh = intersects[i].object;
                }
                done = true;
            }
            i++;
        }
        i = 0;
        done = false;
        var selectedOldMesh = undefined;
        while (i < intersectsToRemove.length && !done) {
            if (intersectsToRemove[i].object.position !== this.mousePointerCube.position) {
                if (this.meshSelection.includes(intersectsToRemove[i].object)) {
                    selectedOldMesh = intersectsToRemove[i].object;
                }
                done = true;
            }
            i++;
        }

        var change = undefined;
        if (selectedNewMesh !== undefined && selectedOldMesh !== undefined) {
            if (selectedOldMesh.position.distanceTo(this.camera.position) < selectedNewMesh.position.distanceTo(this.camera.position)) change = true;
            else change = false;
        }
        if (selectedNewMesh !== undefined) change = false;
        else if (selectedOldMesh !== undefined) change = true;

        if (change === true) {
            this.meshSelection.splice(this.meshSelection.indexOf(selectedOldMesh), 1);
            this.meshTransform.moveMeshToGroup(selectedOldMesh, this.meshSelectionGroup, this.scene);
            if (this.meshSelection.length < 1) {
                this.emptyMeshSelection();
            }
        }
        else if (change === false) {
            //TODO : center selection group position on selected objects
            this.meshTransform.addMeshToGroup(selectedNewMesh, this.meshSelectionGroup)
            this.transformControl.attach(this.meshSelectionGroup);
            this.meshSelection.push(selectedNewMesh);
        }
    }

    this.deleteSelectedMeshes = function() {
        this.transformControl.detach();
        for(var i = 0; i < this.meshSelection.length; i++) {
            var cMesh = this.meshSelection[i];
            cMesh.geometry.dispose();
            cMesh.material.dispose();
            this.meshSelectionGroup.remove(cMesh);
        }
        this.meshSelection = [];
    }

    this.emptyMeshSelection = function() {
        console.log("full mesh selection reset");
        this.transformControl.detach();
        this.meshTransform.moveToGroup(this.meshSelectionGroup, scene);
	    this.meshSelection = [];
        this.resetSceneContent();
        this.init();
    }

    this.highlightSelection = function() {
        if (this.meshSelection.length > 0) {
            for(var i = 0; i < this.meshSelection.length; i++) {
                var cMesh = this.meshSelection[i];
                cMesh.material.emissive = new THREE.Color(255, 255, 0);
                cMesh.material.emissiveIntensity = 1;
            }
            for(var i = 0; i < this.scene.children.length; i++) {
                var cMesh = this.scene.children[i];
                if (this.meshSelection.includes(cMesh)) {
                    cMesh.material.emissive = new THREE.Color(255, 255, 0);
                    cMesh.material.emissiveIntensity = 0.5;
                }
                else{
                    if (cMesh.material !== undefined) {
                        cMesh.material.emissive = new THREE.Color(0, 0, 0);
                        cMesh.material.emissiveIntensity = 0;
                    }
                }
            }
        }
        else{
            for(var i = 0; i < this.scene.children.length; i++) {
                var cMesh = this.scene.children[i];
                if (cMesh.material !== undefined) {
                    cMesh.material.emissive = new THREE.Color(0, 0, 0);
                    cMesh.material.emissiveIntensity = 0;
                }
            }
        }
    }

    this.setCutMinAmount = function(value) {this.cutMinAmount = value};

    this.cutWithSelection = function() {
        this.meshTransform.cutGroup(this.meshSelectionGroup, this.cutMinAmount, this.scene);
    }

    this.setColor = function(red, green, blue) {
        self.meshTransform.changeColor(self.meshSelectionGroup, red, green, blue);
    }

    this.updateSelectionChildrenMatrix = function() {
        var group = this.meshSelectionGroup.children;
        for (var i = 0; i < group.length; i++) {
            group[i].updateMatrixWorld();
        }
    }

}

export { Selection };