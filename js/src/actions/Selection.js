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

    this.transformControl = transformControl;

    this.meshTransform = new MeshTransform();

    this.cutMinAmount = 0.5;

    this.meshSelectionGroup;
    this.meshCopyGroup;

    this.selectionHelpers = [];

    this.tick = function() {
        this.highlightSelection();
        this.updateSelectionChildrenMatrix();
    }

    this.init = function(soft) {
        this.copyPosition = new THREE.Vector3();
        this.meshSelectionGroup = new THREE.Group();
        this.scene.add(this.meshSelectionGroup);
        if (soft !== true) {
            this.meshCopyGroup = new THREE.Group();
            this.meshCopyGroup.visible = false;
            this.scene.add(this.meshCopyGroup);
        }
    }
    this.init(false);

    this.resetSceneContent = function(soft) {
        console.log(this.scene);
        this.meshTransform.moveToGroup(this.meshSelectionGroup, this.scene);
        this.scene.remove(this.meshSelectionGroup);
        if(soft !== true) this.scene.remove(this.meshCopyGroup);
        this.transformControl.detach();
        this.scene.remove(transformControl);
        console.log(this.scene);
    }

    this.copySelection = function() {
        for(var i = 0; i < this.meshCopyGroup.children.length; i++) {
            var cMesh = this.meshCopyGroup.children[i];
            cMesh.geometry.dispose();
            cMesh.material.dispose();
            this.meshCopyGroup.remove(cMesh);
        }
        //TODO : preserve rotation and scale in copy group
        this.meshCopyGroup.position.copy(this.meshSelectionGroup.position);
        this.meshTransform.cloneToGroup(this.meshSelectionGroup, this.meshCopyGroup);
    }

    this.pasteCopy = function() {
        this.emptyMeshSelection();
        this.meshSelectionGroup.position.copy(this.meshCopyGroup.position);
        this.meshTransform.cloneToGroup(this.meshCopyGroup, this.meshSelectionGroup);
        this.transformControl.attach(this.meshSelectionGroup);
    }

    this.selectMeshes = function(mousePos) {
        const onClickPosition = this.mouseRaycast.getMousePosition(this.rendererDomElement, mousePos.x, mousePos.y);

        const intersects = this.mouseRaycast.getIntersects(onClickPosition, this.scene.children);
        const intersectsToRemove = this.mouseRaycast.getIntersects(onClickPosition, this.meshSelectionGroup.children);

        var done = false;
        var i = 0;
        var selectedNewMesh = undefined;
        var selectedOldMesh = undefined;
        console.log();
        while (i < intersects.length && !done) {
            if (intersects[i].object.position !== this.mousePointerCube.position) {
                if (this.meshSelectionGroup.getObjectById(intersects[0].object.id) === undefined) {
                    selectedNewMesh = intersects[i].object;
                }
                else {
                    selectedOldMesh = intersects[i].object;
                }
                done = true;
            }
            i++;
        }
        var change = undefined;
        if (selectedNewMesh !== undefined) change = false;
        else if (selectedOldMesh !== undefined) change = true;

        if (change === true) {
            this.meshTransform.moveMeshToGroup(selectedOldMesh, this.meshSelectionGroup, this.scene);
            if (this.meshSelection.length < 1) {
                this.emptyMeshSelection();
            }
        }
        else if (change === false) {
            this.meshTransform.addMeshToGroup(selectedNewMesh, this.meshSelectionGroup)
            this.transformControl.attach(this.meshSelectionGroup);
        }
    }

    this.deleteSelectedMeshes = function() {
        this.transformControl.detach();
        for(var i = 0; i < this.meshSelectionGroup.children.length; i++) {
            var cMesh = this.meshSelectionGroup.children[i];
            cMesh.geometry.dispose();
            cMesh.material.dispose();
            this.meshSelectionGroup.remove(cMesh);
        }
    }

    this.emptyMeshSelection = function() {
        this.transformControl.detach();
        this.meshTransform.moveToGroup(this.meshSelectionGroup, scene);
        this.resetSceneContent(true);
        this.init(true);
    }

    this.highlightSelection = function() {
        for(var i = 0; i < this.selectionHelpers.length; i++) {
            this.scene.remove(this.selectionHelpers[i]);
        }
        this.selectionHelpers = [];

        var meshArray = this.meshSelectionGroup.children;
        for(var i = 0; i < meshArray.length; i++) {
            var cMesh = meshArray[i];
            var boxHelper = new THREE.BoxHelper(cMesh, 0xff00ff);
            boxHelper.update();
            this.selectionHelpers.push(boxHelper);
        }
        for(var i = 0; i < this.selectionHelpers.length; i++) {
            this.scene.add(this.selectionHelpers[i]);
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