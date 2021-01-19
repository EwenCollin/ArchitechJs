import * as THREE from '../../../build/three.module.js';

var Line = function(scene, mousePointerCube) {
    this.scene = scene;
    this.mousePointerCube = mousePointerCube;
    this.points = [];
    this.maxLinePoints = 1000;

    this.cursorLine;

    this.resetSceneContent = function() {
        this.linesGroup.clear();
        this.scene.remove(this.linesGroup);
    }

	this.initLine = function() {
        this.linesGroup = new THREE.Group();
        this.scene.add(this.linesGroup);
        var lineGeometry = new THREE.BufferGeometry();
        var positions = new Float32Array(this.maxLinePoints * 3);
        lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        var matLine = new THREE.LineBasicMaterial({
            color: 0xff00ff,
            vertexColors: true
        });

        this.cursorLine = new THREE.Line(lineGeometry, matLine);
        this.cursorLine.scale.set(1, 1, 1);
        this.linesGroup.add(this.cursorLine);
    }
    this.initLine();

    this.trace = function() {
        this.points.push(this.mousePointerCube.position.clone());
        var positions = [];
        var x = 0;
        var y = 0;
        var z = 0;
        var index = 0;

        for (var i = 0, l = this.maxLinePoints; i < l; i++) {
            var cV;
            if (i < this.points.length) {
                cV = this.points[i].clone();
            }
            else {
                cV = this.points[this.points.length - 1].clone();
            }

            x = cV.x;
            y = cV.y;
            z = cV.z;

            positions[index++] = x;
            positions[index++] = y;
            positions[index++] = z;

        }
        var positionsTyped = new Float32Array(positions);
        this.cursorLine.geometry.setDrawRange(0, this.maxLinePoints);
        this.cursorLine.geometry.setAttribute('position', new THREE.BufferAttribute(positionsTyped, 3));
    }
    this.release = function() {
        this.points = [];
        this.initLine();
    }
}

export { Line }