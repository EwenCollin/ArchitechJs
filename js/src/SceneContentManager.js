import * as THREE from '../../build/three.module.js';

var SceneContentManager = function (scene, camera) {
    this.scene = scene;
    this.camera = camera;

    this.groundReset = function (addPlane) {
        this.scene.clear();
        if(addPlane) this.addPlane();
        this.addLights();
        this.camera.position.set(400, 200, 0);
    }

    this.addPlane = function () {
        var planeGeo = new THREE.PlaneBufferGeometry(300, 300);
        var planeMaterial = new THREE.MeshStandardMaterial({ color: 0x55ffff });
        var planeMesh = new THREE.Mesh(planeGeo, planeMaterial);
        planeMesh.castShadow = true;
        planeMesh.receiveShadow = true;
        this.scene.add(planeMesh);
        planeMesh.rotation.x = - Math.PI / 2;
    }
    this.addLights = function () {
        const light = new THREE.DirectionalLight(0xffffff, 0.7, 100);
        light.position.set(100, 100, 100); //default; light shining from top
        light.castShadow = true; // default false
        light.shadow.camera.near = 0.5; // default
        light.shadow.camera.far = 10000;
        light.shadow.mapSize.width = 1024 * 4;
        light.shadow.mapSize.height = 1024 * 4;

        const d = 3000;

        light.shadow.camera.left = - d;
        light.shadow.camera.right = d;
        light.shadow.camera.top = d;
        light.shadow.camera.bottom = - d;
        this.scene.add(light);

        const light2 = new THREE.DirectionalLight(0xffcccc, 0.3, 100);
        light2.position.set(-100, 100, -100); //default; light shining from top
        light2.castShadow = true; // default false
        light2.shadow.camera.near = 0.5; // default
        light2.shadow.camera.far = 10000;
        light2.shadow.mapSize.width = 1024 * 4;
        light2.shadow.mapSize.height = 1024 * 4;

        light2.shadow.camera.left = - d;
        light2.shadow.camera.right = d;
        light2.shadow.camera.top = d;
        light2.shadow.camera.bottom = - d;
        this.scene.add(light2);
    }
}

export { SceneContentManager }