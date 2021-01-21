import * as THREE from '../../build/three.module.js';


var EventDispatcher = function(line, rectMesh, selection, pointer, transformControlManager, sceneIO, sceneContentManager) {
    var self = this;
    this.line = line;
    this.rectMesh = rectMesh;
    this.selection = selection;
    this.transformControlManager = transformControlManager;
    this.pointer = pointer;
    this.sceneIO = sceneIO;
    this.sceneContentManager = sceneContentManager;

    this.mousePos = new THREE.Vector2();

    this.keypress = function(event) {
        if (event.code === "KeyQ") self.line.trace();
	    if (event.code === "KeyW") self.rectMesh.makeRect();
	    if (event.code === "KeyS") self.selection.selectMeshes(self.mousePos);
        if (event.code === "Delete") self.selection.deleteSelectedMeshes();
        if (event.code === "KeyC") self.selection.copySelection();
        if (event.code === "KeyV") self.selection.pasteCopy();
    }

    this.keyup = function(event) {
        self.line.release();
        self.rectMesh.releaseRect();
    }

    this.mouseMove = function(event) {
        self.mousePos.set(event.clientX, event.clientY);
        self.pointer.movePointer(event.clientX, event.clientY);
    }

    //From panel events

    this.transformControlSetTranslate = function() {self.transformControlManager.setTranslate()};
    this.transformControlSetScale = function() {self.transformControlManager.setScale()};
    this.transformControlSetRotate = function() {self.transformControlManager.setRotate()};

    this.emptyMeshSelection = function() {self.selection.emptyMeshSelection()};
    this.cutWithSelection = function() {self.selection.cutWithSelection()};

    this.transformControlSnapTS = function(value) {
        self.transformControlManager.changeSnapTranslation(value);
        self.transformControlManager.changeSnapScale(value);
    }
    this.transformControlSnapR = function(value) {self.transformControlManager.changeSnapRotation(value)};

    this.cutSetMinimalAmount = function(value) {self.selection.setCutMinAmount(value)};
    this.selectionSetColorR = function(value) {self.selection.setColor(value, undefined, undefined)};
    this.selectionSetColorG = function(value) {self.selection.setColor(undefined, value, undefined)};
    this.selectionSetColorB = function(value) {self.selection.setColor(undefined, undefined, value)};

    this.sceneExport = function() {
        self.line.resetSceneContent();
        self.rectMesh.resetSceneContent();
        self.selection.resetSceneContent(false);
        self.pointer.resetSceneContent();
        self.sceneContentManager.resetContent();
        self.sceneIO.export();
    }
    this.sceneLoad = function() {
        var callbacks = [self.sceneContentManager.resetAfterLoad, self.selection.init, self.line.init, self.rectMesh.init, self.pointer.init]
        self.sceneIO.load(callbacks);
        //self.sceneContentManager.groundReset(false);
    }
}

export { EventDispatcher };