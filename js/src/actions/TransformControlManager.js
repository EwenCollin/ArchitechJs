import * as THREE from '../../../build/three.module.js';
import { TransformControls } from '../../jsm/controls/TransformControls.js';

var TransformControlManager = function(scene, camera, rendererDomElement, controls) {
    var self = this;
    this.scene = scene;
    this.transformControl;
    this.rendererDomElement = rendererDomElement;
    this.camera = camera;
    this.controls = controls;


    this.init = function() {
        this.transformControl = new TransformControls(self.camera, self.rendererDomElement);
        this.transformControl.addEventListener('dragging-changed', function (event) {
            self.controls.enabled = !event.value;
        });
        self.scene.add(self.transformControl);
    }
    this.init();

    this.setTranslate = function() {self.transformControl.setMode("translate")}
    this.setRotate = function() {self.transformControl.setMode("rotate")}
    this.setScale = function() {self.transformControl.setMode("scale")}

    this.changeSnapTranslation = function(snap) {self.transformControl.setTranslationSnap(snap)};
    this.changeSnapScale = function(snap) {self.transformControl.setScaleSnap(snap)};
    this.changeSnapRotation = function(snap) {self.transformControl.setRotationSnap(snap)};

    this.getTransfromControl = function() {return self.transformControl};
}

export { TransformControlManager }