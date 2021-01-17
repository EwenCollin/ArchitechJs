import * as THREE from '../build/three.module.js';

import { GUI } from './jsm/libs/dat.gui.module.js';

import { MapControls } from './jsm/controls/OrbitControls.js';
import { Line2 } from './jsm/lines/Line2.js';
import { LineMaterial } from './jsm/lines/LineMaterial.js';
import { LineGeometry } from './jsm/lines/LineGeometry.js';
import { GeometryUtils } from './jsm/utils/GeometryUtils.js';
import { TransformControls } from './jsm/controls/TransformControls.js';
import { CSG } from './ext/threejs-csg.js';

let camera, controls, scene, renderer;
let transformControl;

let mousePointerCube, linesGroup, cursorLine;
let matLine;
let maxLinePoints = 1000;
let rectsGroup, currentRect;


var rectColor = new THREE.Color(255, 255, 255);

let settings;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const onClickPosition = new THREE.Vector2();

init();
//render(); // remove when using next line for animation loop (requestAnimationFrame)
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

	//transform controls

	transformControl = new TransformControls(camera, renderer.domElement);
	transformControl.addEventListener('change', render);
	transformControl.addEventListener('dragging-changed', function (event) {

		controls.enabled = !event.value;

	});
	scene.add(transformControl);
	// panel
	createPanel();
	// world
	linesGroup = new THREE.Group();
	scene.add(linesGroup);
	rectsGroup = new THREE.Group();
	scene.add(rectsGroup);

	var planeGeo = new THREE.PlaneBufferGeometry(300, 300);
	var planeMaterial = new THREE.MeshStandardMaterial({color: 0x55ffff});
	var planeMesh = new THREE.Mesh(planeGeo, planeMaterial);
	planeMesh.castShadow = true;
	planeMesh.receiveShadow = true;
	scene.add(planeMesh);
	planeMesh.rotation.x = - Math.PI/2;

	var lineGeometry = new LineGeometry();
	var positions = new Float32Array(maxLinePoints * 3);
	lineGeometry.setPositions(positions);
	matLine = new LineMaterial({

		color: 0xff00ff,
		linewidth: 3, // in pixels
		vertexColors: true,
		//resolution:  // to be set by renderer, eventually
		dashed: false

	});
	matLine.resolution.set(window.innerWidth, window.innerHeight);

	cursorLine = new Line2(lineGeometry, matLine);
	cursorLine.scale.set(1, 1, 1);
	//line.geometry.setDrawRange(0, 500);
	linesGroup.add(cursorLine);

	mousePointerCube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshPhongMaterial({ color: 0xff00ff, flatShading: true }));
	scene.add(mousePointerCube);

	//CURRENT Rect

	var rectBoxBufferGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
	var rectMaterial = new THREE.MeshStandardMaterial({ color: rectColor });

	currentRect = new THREE.Mesh(rectBoxBufferGeometry, rectMaterial);
	currentRect.castShadow = true;
	currentRect.receiveShadow = true;
	rectsGroup.add(currentRect);


	// lights

	const light = new THREE.DirectionalLight(0xffffff, 0.7, 100);
	light.position.set(1000, 1000, 1000); //default; light shining from top
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
	scene.add(light);

	const light2 = new THREE.DirectionalLight(0xffcccc, 0.3, 100);
	light2.position.set(-1000, 1000, -1000); //default; light shining from top
	light2.castShadow = true; // default false
	light2.shadow.camera.near = 0.5; // default
	light2.shadow.camera.far = 10000;
	light2.shadow.mapSize.width = 1024 * 4;
	light2.shadow.mapSize.height = 1024 * 4;

	const d2 = 3000;

	light2.shadow.camera.left = - d;
	light2.shadow.camera.right = d;
	light2.shadow.camera.top = d;
	light2.shadow.camera.bottom = - d;
	scene.add(light2)
	//

	window.addEventListener('resize', onWindowResize, false);

	renderer.domElement.addEventListener('mousemove', onMouseMove, false);

	window.addEventListener("keydown", keyEventDispatcher, false);
	window.addEventListener("keyup", keyEventReleaser, false);



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

	renderer.render(scene, camera);
}

function onMouseMove(evt) {

	evt.preventDefault();

	const array = getMousePosition(renderer.domElement, evt.clientX, evt.clientY);
	onClickPosition.fromArray(array);

	const intersects = getIntersects(onClickPosition, scene.children);

	var done = false;
	var i = 0;
	while (i < intersects.length && !done) {
		if (intersects[i].object.position !== mousePointerCube.position) {
			mousePointerCube.position.set(intersects[i].point.x, intersects[i].point.y, intersects[i].point.z);
			done = true;
		}
		i++;
	}
}

function getMousePosition(dom, x, y) {

	const rect = dom.getBoundingClientRect();
	return [(x - rect.left) / rect.width, (y - rect.top) / rect.height];

}

function getIntersects(point, objects) {

	mouse.set((point.x * 2) - 1, - (point.y * 2) + 1);

	raycaster.setFromCamera(mouse, camera);

	return raycaster.intersectObjects(objects);

}
function keyEventDispatcher(e) {
	if (e.code === "KeyQ") tracePoints();
	if (e.code === "KeyW") makeRect();
}

function keyEventReleaser(e) {
	releasePoints();
	releaseRect();
}

var isDrawingRect = false;
var rectOrigin = new THREE.Vector3();
function makeRect() {
	if (!isDrawingRect) {
		isDrawingRect = true;
		currentRect.position.copy(mousePointerCube.position.clone());
		currentRect.scale.set(0, 0, 0);
		rectOrigin.copy(mousePointerCube.position.clone());
	}

	if (currentRect.scale.x < 0.1 && currentRect.scale.x > -0.1) currentRect.scale.x = 0.1;
	if (currentRect.scale.y < 0.1 && currentRect.scale.y > -0.1) currentRect.scale.y = 0.1;
	if (currentRect.scale.z < 0.1 && currentRect.scale.z > -0.1) currentRect.scale.z = 0.1;
	
	currentRect.scale.copy(mousePointerCube.position.clone().sub(rectOrigin));
	currentRect.position.set((mousePointerCube.position.clone().x + rectOrigin.clone().x) / 2, (mousePointerCube.position.clone().y + rectOrigin.clone().y) / 2, (mousePointerCube.position.clone().z + rectOrigin.clone().z) / 2);
}

function releaseRect() {
	if (isDrawingRect) {
		isDrawingRect = false;
		transformControl.attach(currentRect);
		console.log("current scale :", currentRect.scale);
		if (currentRect.scale.x < 0.1 && currentRect.scale.x > -0.1) currentRect.scale.x = 0.1;
		if (currentRect.scale.y < 0.1 && currentRect.scale.y > -0.1) currentRect.scale.y = 0.1;
		if (currentRect.scale.z < 0.1 && currentRect.scale.z > -0.1) currentRect.scale.z = 0.1;

		//NEXT RECT
		var rectBoxBufferGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
		var rectMaterial = new THREE.MeshStandardMaterial({ color: rectColor});

		currentRect = new THREE.Mesh(rectBoxBufferGeometry, rectMaterial);
		rectsGroup.add(currentRect);
	}
}

var points = [];

function tracePoints() {
	points.push(mousePointerCube.position.clone());
	var positions = [];
	var x = 0;
	var y = 0;
	var z = 0;
	var index = 0;

	for (var i = 0, l = maxLinePoints; i < l; i++) {
		var cV;
		if (i < points.length) {
			cV = points[i].clone();
		}
		else {
			cV = points[points.length - 1].clone();
		}

		x = cV.x;
		y = cV.y;
		z = cV.z;

		positions[index++] = x;
		positions[index++] = y;
		positions[index++] = z;

	}
	console.log(positions);
	console.log(points);
	cursorLine.geometry.instanceCount = maxLinePoints;
	console.log(cursorLine);
	cursorLine.geometry.setPositions(positions);
	//updatePositions();
}
function releasePoints() {
	points = [];
	var lineGeometry = new LineGeometry();
	var positions = new Float32Array(maxLinePoints * 3);
	lineGeometry.setPositions(positions);
	matLine = new LineMaterial({

		color: 0xff00ff,
		linewidth: 3, // in pixels
		vertexColors: true,
		//resolution:  // to be set by renderer, eventually
		dashed: false

	});
	matLine.resolution.set(window.innerWidth, window.innerHeight);

	cursorLine = new Line2(lineGeometry, matLine);
	cursorLine.scale.set(1, 1, 1);
	//line.geometry.setDrawRange(0, 500);
	linesGroup.add(cursorLine);
}

function updatePositions() {

	var positions = [];
	var x = 0;
	var y = 0;
	var z = 0;
	var index = 0;

	for (var i = 0, l = maxLinePoints; i < l; i++) {

		x += (Math.random() - 0.5) * 30;
		y += (Math.random() - 0.5) * 30;
		z += (Math.random() - 0.5) * 30;

		positions[index++] = x;
		positions[index++] = y;
		positions[index++] = z;

	}

	cursorLine.geometry.setPositions(positions)
	console.log(positions);
}

function createPanel() {

	const panel = new GUI({ width: 310 });

	const folder1 = panel.addFolder('Object Mode');
	const folder2 = panel.addFolder('Actions');
	const folder3 = panel.addFolder('Add color');


	settings = {
		'translate': transformControlSetTranslate,
		'rotate': transformControlSetRotate,
		'scale': transformControlSetScale,
		'translate / scale snap resolution': 1,
		'rotate snap resolution': 15,
		'cut in': rectTransformCut,
		'add': rectTransformAdd,
		'cut in minimal cut': 0.5,
		'red': 200,
		'green': 200,
		'blue': 200
	};

	folder1.add(settings, 'translate');
	folder1.add(settings, 'rotate');
	folder1.add(settings, 'scale');
	folder1.add(settings, 'translate / scale snap resolution', 0.01, 100).listen().onChange(transformControlSnapTS);
	folder1.add(settings, 'rotate snap resolution', 1, 90).listen().onChange(transformControlSnapR);
	folder1.open();
	folder2.add(settings, 'cut in');
	folder2.add(settings, 'cut in minimal cut', 0.1, 10).listen().onChange(rectTransformCutSetAmount);
	folder2.add(settings, 'add');
	folder2.open();
	folder3.add(settings, 'red', 0, 255).listen().onChange(rectTransformAddCR);
	folder3.add(settings, 'green', 0, 255).listen().onChange(rectTransformAddCG);
	folder3.add(settings, 'blue', 0, 255).listen().onChange(rectTransformAddCB);
	folder3.open();
}


function rectTransformAddCR(value) {
	for (var i = 0; i < rectsGroup.children.length; i++) {
		var cRect = rectsGroup.children[i];
		rectColor.r = value / 255;
		cRect.material.color = rectColor.clone();
	}
}
function rectTransformAddCG(value) {
	for (var i = 0; i < rectsGroup.children.length; i++) {
		var cRect = rectsGroup.children[i];
		rectColor.g = value / 255;
		cRect.material.color = rectColor.clone();
	}
}

function rectTransformAddCB(value) {
	for (var i = 0; i < rectsGroup.children.length; i++) {
		var cRect = rectsGroup.children[i];
		rectColor.b = value / 255;
		cRect.material.color = rectColor.clone();
	}
}

var transformCutMinAmount = 0.5;
function rectTransformCutSetAmount(value) {
	transformCutMinAmount = value;
}

function rectTransformCut() {
	for (var i = 0; i < rectsGroup.children.length; i++) {
		var cRect = rectsGroup.children[i];
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
		var objectsToTransform = detectCollisions(cRect, scene.children);
		for (var i = 0; i < objectsToTransform.length; i++) {
			var newObject = cutInMesh(cRect, objectsToTransform[i]);
			objectsToTransform[i].geometry.dispose();
			objectsToTransform[i].geometry = newObject.geometry;

		}
		rectsGroup.remove(cRect);
		cRect.geometry.dispose();
		cRect.material.dispose();
	}
	var rectBoxBufferGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
	var rectMaterial = new THREE.MeshStandardMaterial({ color: rectColor, flatShading: true });

	currentRect = new THREE.Mesh(rectBoxBufferGeometry, rectMaterial);
	rectsGroup.add(currentRect);
	transformControl.detach();
}

function rectTransformAdd() {
	for (var i = 0; i < rectsGroup.children.length; i++) {
		var cRect = rectsGroup.children[i];
		if (cRect.scale.x < 0) {
			cRect.scale.x = - cRect.scale.x;
		}
		if (cRect.scale.y < 0) {
			cRect.scale.y = - cRect.scale.y;
		}
		if (cRect.scale.z < 0) {
			cRect.scale.z = - cRect.scale.z;
		}
		var newRect = cRect.clone();
		scene.add(newRect);
		newRect.castShadow = true;
		newRect.receiveShadow = true;
		rectsGroup.remove(cRect);
		cRect.material.dispose();
		cRect.geometry.dispose();
	}
	var rectBoxBufferGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
	var rectMaterial = new THREE.MeshStandardMaterial({ color: rectColor});

	currentRect = new THREE.Mesh(rectBoxBufferGeometry, rectMaterial);
	rectsGroup.add(currentRect);
	transformControl.detach();
}

function transformControlSetTranslate() {
	transformControl.setMode("translate");
}
function transformControlSetRotate() {
	transformControl.setMode("rotate");
}
function transformControlSetScale() {
	transformControl.setMode("scale");
}

function transformControlSnapTS(value) {
	transformControl.setTranslationSnap(value);
	transformControl.setScaleSnap(value);
}
function transformControlSnapR(value) {
	transformControl.setRotationSnap(THREE.MathUtils.degToRad(value));

}

function detectCollisions(object, cObjects) {
	var detectedCollisions = [];
	for (var i = 0; i < cObjects.length; i++) {
		if (detectCollisionCubes(object, cObjects[i])) detectedCollisions.push(cObjects[i]);
	}
	return detectedCollisions;
}

function detectCollisionCubes(object1, object2) {
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

function cutInMesh(meshA, meshB) {
	meshA.updateMatrix();
	meshB.updateMatrix();
	var bspA = CSG.fromMesh(meshA);
	var bspB = CSG.fromMesh(meshB);
	var bspResult = bspB.subtract(bspA);
	var meshResult = CSG.toMesh(bspResult, meshB.matrix);
	meshResult.material = meshB.material;
	return meshResult;
}