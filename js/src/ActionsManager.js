import { Line } from "./actions/Line.js";
import { Pointer } from "./actions/Pointer.js";
import { RectMesh } from "./actions/RectMesh.js";
import { Selection } from "./actions/Selection.js";
import { SceneIO } from "./utils/SceneIO.js";


var ActionsManager = function(scene, renderer, raycaster, camera, transformControl) {
    var self = this;
    this.scene = scene;
    this.renderer = renderer;
    this.raycaster = raycaster;
    this.camera = camera;
    this.transformControl = transformControl;
    
    this.sceneIO = new SceneIO(this.scene);

    this.pointer = new Pointer(this.scene, this.raycaster, this.camera, this.renderer.domElement);
    this.mousePointerCube = this.pointer.getPointer();
    this.selection = new Selection(this.scene, this.camera, this.raycaster, this.renderer.domElement, this.mousePointerCube, this.transformControl);
    this.rectMesh = new RectMesh(this.scene, this.mousePointerCube, this.transformControl);
    this.line = new Line(this.scene, this.mousePointerCube);

    this.tick = function() {
        self.selection.tick();
    }

    this.getPointer = function() {return self.pointer};
    this.getSelection = function() {return self.selection};
    this.getRectMesh = function() {return self.rectMesh};
    this.getLine = function() {return self.line};
    this.getSceneIO = function() {return self.sceneIO};
}

export { ActionsManager };