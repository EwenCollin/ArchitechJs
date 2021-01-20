import * as THREE from '../../../build/three.module.js';
import { CSG } from '../../ext/threejs-csg.js';

var MeshTransform = function () {

    this.changeColor = function (group, red, green, blue) {
        for (var i = 0; i < group.children.length; i++) {
            var cRect = group.children[i];
            if (red !== undefined) cRect.material.color.r = red / 255;
            if (green !== undefined) cRect.material.color.g = green / 255;
            if (blue !== undefined) cRect.material.color.b = blue / 255;
        }
    }

    this.cutGroup = function (meshGroup, transformCutMinAmount, scene) {
        for (var i = 0; i < meshGroup.children.length; i++) {
            var cRect = meshGroup.children[i];
            if (cRect.scale.x < transformCutMinAmount && cRect.scale.x > - transformCutMinAmount) cRect.scale.x = transformCutMinAmount;
            if (cRect.scale.y < transformCutMinAmount && cRect.scale.y > - transformCutMinAmount) cRect.scale.y = transformCutMinAmount;
            if (cRect.scale.z < transformCutMinAmount && cRect.scale.z > - transformCutMinAmount) cRect.scale.z = transformCutMinAmount;
            if (cRect.scale.x < 0) {
                cRect.scale.x = - cRect.scale.x;
            }
            if (cRect.scale.y < 0) {
                cRect.scale.y = - cRect.scale.y;
            }
            if (cRect.scale.z < 0) {
                cRect.scale.z = - cRect.scale.z;
            }
            var objectsToTransform = this.detectCollisions(cRect, scene.children);
            for (var i = 0; i < objectsToTransform.length; i++) {
                var newObject = this.cutInMesh(cRect, objectsToTransform[i]);
                objectsToTransform[i].geometry.dispose();
                objectsToTransform[i].geometry = newObject.geometry;

            }
            meshGroup.remove(cRect);
            cRect.geometry.dispose();
            cRect.material.dispose();
        }
    }

    this.moveMeshToGroup = function (mesh, meshGroup, scene) {
        var newRect = mesh.clone();
        scene.add(newRect);
        newRect.castShadow = true;
        newRect.receiveShadow = true;
        newRect.applyMatrix(meshGroup.matrix);
        meshGroup.remove(mesh);
        mesh.material.dispose();
        mesh.geometry.dispose();
        return newRect;
    }

    this.attachToGroup = function(mesh, meshGroup, parent) {
        meshGroup.attach(mesh);
        parent.remove(mesh);
    }

    this.cloneToGroup = function(groupFrom, groupTo) {
        for(var i = 0; i < groupFrom.children.length; i++) {
            var cMesh = groupFrom.children[i];
            var nMesh = cMesh.clone();
            nMesh.applyMatrix(groupFrom.matrix);
            groupTo.attach(nMesh);
        }
        console.log("groupTo:", groupTo.children);
    }

    this.moveToGroup = function (meshGroup, scene) {
        for (var i = 0; i < meshGroup.children.length; i++) {
            var cRect = meshGroup.children[i];
            if (cRect.scale.x < 0) {
                cRect.scale.x = - cRect.scale.x;
            }
            if (cRect.scale.y < 0) {
                cRect.scale.y = - cRect.scale.y;
            }
            if (cRect.scale.z < 0) {
                cRect.scale.z = - cRect.scale.z;
            }
            this.moveMeshToGroup(cRect, meshGroup, scene);
        }
    }

    this.addMeshToGroup = function (mesh, group) {
        
        var vectors = [];
        var objects = [];
        for (var i = 0; i < group.children.length; i++) {
            objects.push(group.children[i]);
            vectors.push(group.children[i].position);
        }
        vectors.push(mesh.position);
        var newGroupPos = new THREE.Vector3();
        for (var i = 0; i < vectors.length; i++) {
            newGroupPos.add(vectors[i]);
        }
        newGroupPos.divideScalar(vectors.length);

        for(var i = 0; i < objects.length; i++) {
            objects[i] = this.moveMeshToGroup(objects[i], group, group.parent);
        }

        group.position.copy(newGroupPos);
        var lastMeshRotation = new THREE.Quaternion();
        mesh.getWorldQuaternion(lastMeshRotation);
        group.setRotationFromQuaternion(lastMeshRotation);
        group.scale.set(1, 1, 1);
        group.updateMatrix();
        group.updateMatrixWorld();

        for(var i = 0; i < objects.length; i++) {
            this.attachToGroup(objects[i], group, group.parent);
        }
        group.attach(mesh);
        console.log(group);
    }

    this.detectCollisions = function (object, cObjects) {
        var detectedCollisions = [];
        for (var i = 0; i < cObjects.length; i++) {
            if (this.detectCollisionCubes(object, cObjects[i])) detectedCollisions.push(cObjects[i]);
        }
        return detectedCollisions;
    }

    this.detectCollisionCubes = function (object1, object2) {
        if (object1.geometry === undefined || object2.geometry === undefined || object1.id === object2.id) return false;
        object1.geometry.computeBoundingBox();
        object2.geometry.computeBoundingBox();
        object1.updateMatrixWorld();
        object2.updateMatrixWorld();

        var box1 = object1.geometry.boundingBox.clone();
        box1.applyMatrix4(object1.matrixWorld);

        var box2 = object2.geometry.boundingBox.clone();
        box2.applyMatrix4(object2.matrixWorld);

        return box1.intersectsBox(box2);
    }

    this.cutInMesh = function (meshA, meshB) {
        meshA.updateMatrix();
        meshB.updateMatrix();
        var bspA = CSG.fromMesh(meshA);
        var bspB = CSG.fromMesh(meshB);
        var bspResult = bspB.subtract(bspA);
        var meshResult = CSG.toMesh(bspResult, meshB.matrix);
        meshResult.material = meshB.material;
        var bufferGeometry = new THREE.BufferGeometry();
        bufferGeometry = bufferGeometry.fromGeometry(meshResult.geometry);
        meshResult.geometry = bufferGeometry;
        return meshResult;
    }
}

export { MeshTransform }