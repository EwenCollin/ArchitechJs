import * as THREE from '../build/three.module.js';

import { MapControls } from './jsm/controls/OrbitControls.js';
import { SceneContentManager } from './src/SceneContentManager.js';
import { EventDispatcher } from './src/EventDispatcher.js';
import { TransformControlManager } from './src/actions/TransformControlManager.js';
import { ActionsManager } from './src/ActionsManager.js';
import { PanelManager } from './src/PanelManager.js';

let camera, controls, scene, renderer;

let actionsManager;
let eventDispatcher;
let panelManager;
let sceneContentManager;
let transformControlManager;

let raycaster;

init();
animate();

function init() {

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xcccccc);
	//scene.fog = new THREE.FogExp2(0xcccccc, 0.002);

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	
	camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.set(400, 200, 0);

	// controls

	controls = new MapControls(camera, renderer.domElement);

	//controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

	controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
	controls.dampingFactor = 0.05;

	controls.screenSpacePanning = false;

	controls.minDistance = 100;
	controls.maxDistance = 500;

	controls.maxPolarAngle = Math.PI / 2;



	raycaster = new THREE.Raycaster();

	sceneContentManager = new SceneContentManager(scene, camera);
	sceneContentManager.groundReset(true);
	scene.add(camera);

	transformControlManager = new TransformControlManager(scene, camera, renderer.domElement, controls);
	var transformControl = transformControlManager.getTransfromControl();
	
	actionsManager = new ActionsManager(scene, renderer, raycaster, camera, transformControl);
	eventDispatcher = new EventDispatcher(actionsManager.getLine(), actionsManager.getRectMesh(), actionsManager.getSelection(), actionsManager.getPointer(), transformControlManager, actionsManager.getSceneIO(), sceneContentManager);

	panelManager = new PanelManager(eventDispatcher);


	


	window.addEventListener('resize', onWindowResize, false);

	renderer.domElement.addEventListener('mousemove', eventDispatcher.mouseMove, false);

	window.addEventListener("keydown", eventDispatcher.keypress, false);
	window.addEventListener("keyup", eventDispatcher.keyup, false);



}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

	requestAnimationFrame(animate);

	controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

	render();

}

function render() {
	actionsManager.tick();
	renderer.render(scene, camera);
}