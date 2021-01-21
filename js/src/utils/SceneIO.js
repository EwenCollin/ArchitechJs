import * as THREE from '../../../build/three.module.js';
import { MeshTransform } from './MeshTransform.js';

var SceneIO = function(scene) {

    this.scene = scene;
    this.meshTransform = new MeshTransform();

    this.load = function(callbacks) {
        var input = document.createElement('input');
        input.type = 'file';
        input.onchange = e => {
    
            // getting a hold of the file reference
            var file = e.target.files[0];
            // setting up the reader
            var reader = new FileReader();
            reader.readAsText(file, 'UTF-8');
            // here we tell the reader what to do when it's done reading...
            reader.onload = readerEvent => {
                var content = readerEvent.target.result; // this is the content!
                var newScene = new THREE.ObjectLoader().parse(JSON.parse(content));
                this.meshTransform.moveToGroup(newScene, this.scene);
                input.remove();
                console.log(this.scene.children);
                for(var i = 0; i < callbacks; i++) {
                    callbacks[i]();
                }
            }
        }
        input.click();
    }
    
    this.export = function() {
        console.log(this.scene.children);
        scene.updateMatrixWorld();
        const json = this.scene.toJSON();
        this.downloadStringAsJson(JSON.stringify(json), "scene");
    }

    this.downloadStringAsJson = function(str, exportName) {
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(str);
        var downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", exportName + ".json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }
}

export { SceneIO }