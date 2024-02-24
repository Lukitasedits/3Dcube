import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import * as TWEEN from '@tweenjs/tween.js';
import {CSS2DRenderer, CSS2DObject} from 'three/examples/jsm/renderers/CSS2DRenderer';
//import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import { Cube } from "./cube";
import { DragControls } from "./dragControls";

//Scene
const scene = new THREE.Scene();

//Renderer
const renderer = new THREE.WebGLRenderer({antialias:true, alpha: true});
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 4;
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

//2D Renderer
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.pointerEvents = 'none';

document.body.appendChild(labelRenderer.domElement);


//Loader
var rgbeLoader = new RGBELoader();
//var gltfLoader = new GLTFLoader();

const factor = 3;

//Camera
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(factor*3, factor*3, factor*3);
camera.rotateX(-0.4);

//OrbitControls
var orbit = new OrbitControls(camera, renderer.domElement);
//orbit.enableZoom = false; 
//orbit.enablePan = false;

//Grid
var grid = new THREE.GridHelper(10, 100);
//scene.add(grid);


//Lines
createLine = function(from, to, color, label){
    const lineMaterial = new THREE.LineBasicMaterial( {color:parseInt('0x'+ color, 16)});
    const fromPoint = new THREE.Vector3(from.x, from.y, from.z);
    const toPoint = new THREE.Vector3(to.x, to.y, to.z);
    const p = document.createElement('p');
    p.innerHTML = label;
    p.style.color = '#' + color;
    p.style.top = '-25px';
    const labelPointer = new CSS2DObject(p);
    labelPointer.position.set(to.x, to.y, to.z);
    scene.add(labelPointer);
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([fromPoint, toPoint]);
    const line = new THREE.Line(lineGeometry, lineMaterial);
    return line;
}

scene.add(createLine({x:0, y:0, z:0}, {x:10, y:0, z:0}, 'ff0000', 'X'));
scene.add(createLine({x:0, y:0, z:0}, {x:0, y:10, z:0}, '00ff00', 'Y'));
scene.add(createLine({x:0, y:0, z:0}, {x:0, y:0, z:10}, '0000ff', 'Z'));


//Model - cube
let cube = new Cube(factor);
cube.model.position.set(-(factor-1), -(factor-1), -(factor-1));
scene.add(cube.model);

//Raycaster
cube.setControls(scene, camera, orbit);


//Load...
rgbeLoader.load('./assets/bath.hdr', function(texture){
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
});

//Light
var ambientLight = new THREE.AmbientLight(0xffffff, 0.5); 
scene.add(ambientLight);

//Frame sequense...
function animate(){
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
    TWEEN.update();
}

document.body.style.backgroundImage = 'url(./assets/background.jpg)';


//Render
animate();


//Resize envent
window.addEventListener('resize', function(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
})
