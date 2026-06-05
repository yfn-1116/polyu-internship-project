import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

const viewer = document.getElementById('viewer');
const statusEl = document.getElementById('status');
const taskEl = document.getElementById('task-id');
const modelEl = document.getElementById('model-type');
const meshEl = document.getElementById('mesh-path');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf5f7fb);

const camera = new THREE.PerspectiveCamera(45, viewer.clientWidth / viewer.clientHeight, 0.01, 100);
camera.position.set(0, 1.1, 3.2);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(viewer.clientWidth, viewer.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
viewer.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.85, 0);
controls.update();

scene.add(new THREE.HemisphereLight(0xffffff, 0x8899aa, 2.4));

const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
keyLight.position.set(2, 3, 4);
scene.add(keyLight);

const grid = new THREE.GridHelper(3, 12, 0x94a3b8, 0xd1d5db);
scene.add(grid);

function resize() {
  camera.aspect = viewer.clientWidth / viewer.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(viewer.clientWidth, viewer.clientHeight);
}

window.addEventListener('resize', resize);

async function loadManifest() {
  const response = await fetch('/sample-human/manifest.json');
  if (!response.ok) {
    throw new Error(`failed to load manifest: ${response.status}`);
  }
  return response.json();
}

function loadObj(meshPath) {
  const loader = new OBJLoader();
  loader.load(
    meshPath,
    (object) => {
      object.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0x7c9cbf,
            roughness: 0.65,
            metalness: 0.05,
          });
        }
      });
      scene.add(object);
      statusEl.textContent = 'Loaded';
    },
    undefined,
    (error) => {
      statusEl.textContent = 'Mesh load failed';
      console.error(error);
    },
  );
}

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

loadManifest()
  .then((manifest) => {
    const result = manifest.result;
    taskEl.textContent = manifest.task_id;
    modelEl.textContent = result.model_type;
    meshEl.textContent = result.output_paths.mesh;
    loadObj(result.output_paths.mesh);
  })
  .catch((error) => {
    statusEl.textContent = 'Manifest load failed';
    console.error(error);
  });

animate();
