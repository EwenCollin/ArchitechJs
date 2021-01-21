import * as THREE from '../../build/three.module.js';

var SceneContentManager = function (scene, aspectRatio) {
    var self = this;
    this.scene = scene;
    this.camera;
    this.aspectRatio = aspectRatio;
    this.plane;

    this.elements = [];

    this.groundReset = function (addPlane) {
        this.camera = new THREE.PerspectiveCamera(60, aspectRatio, 1, 1000);
        this.scene.clear();
        if(addPlane) this.addPlane();
        this.addLights();
        this.scene.add(this.camera);
        this.camera.position.set(400, 200, 0);
        return this.camera;
    }

    this.resetAfterLoad = function() {
        console.log(self.scene.children);
        self.resetContent();
        self.camera = new THREE.PerspectiveCamera(60, aspectRatio, 1, 1000);
        self.addLights();
        self.scene.add(self.camera);
        self.camera.position.set(400, 200, 0);
        console.log(self.scene.children);
        self.scene.remove(self.plane); //TODO : import / export selection
    }

    this.resetContent = function() {
        for(var i = 0; i < self.elements.length; i++) {
            self.scene.remove(self.elements[i]);
        }
        self.elements = [];
    }

    this.addPlane = function () {
        var planeGeo = new THREE.PlaneBufferGeometry(300, 300);
        var planeMaterial = new THREE.MeshStandardMaterial({ color: 0x55ffff });
        var planeMesh = new THREE.Mesh(planeGeo, planeMaterial);
        planeMesh.castShadow = true;
        planeMesh.receiveShadow = true;
        this.scene.add(planeMesh);
        planeMesh.rotation.x = - Math.PI / 2;
        this.plane = planeMesh;
    }
    this.addLights = function () {
        const light = new THREE.DirectionalLight(0xffffff, 0.9, 100);
        light.position.set(100, 100, 100); //default; light shining from top
        light.castShadow = true; // default false
        light.shadow.camera.near = 0.5; // default
        light.shadow.camera.far = 10000;
        light.shadow.mapSize.width = 1024 * 8;
        light.shadow.mapSize.height = 1024 * 8;

        const d = 3000;

        light.shadow.camera.left = - d;
        light.shadow.camera.right = d;
        light.shadow.camera.top = d;
        light.shadow.camera.bottom = - d;
        this.scene.add(light);

        const light2 = new THREE.DirectionalLight(0xffcccc, 0.5, 100);
        light2.position.set(-100, 100, -100); //default; light shining from top
        light2.castShadow = true; // default false
        light2.shadow.camera.near = 0.5; // default
        light2.shadow.camera.far = 10000;
        light2.shadow.mapSize.width = 1024 * 8;
        light2.shadow.mapSize.height = 1024 * 8;

        light2.shadow.camera.left = - d;
        light2.shadow.camera.right = d;
        light2.shadow.camera.top = d;
        light2.shadow.camera.bottom = - d;
        this.scene.add(light2);
        this.elements.push(light, light2);
    }
}

export { SceneContentManager }