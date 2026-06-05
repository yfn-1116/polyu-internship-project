import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

const viewer = document.getElementById('viewer');
const statusEl = document.getElementById('status');
const taskEl = document.getElementById('task-id');
const modelEl = document.getElementById('model-type');
const meshEl = document.getElementById('mesh-path');
const resetButton = document.getElementById('reset-view');
const modeButtons = [...document.querySelectorAll('.mode-button')];

const samples = {
  thuman: '/sample-thuman/manifest.json',
  smplx: '/sample-smplx/manifest.json',
  proxy: '/sample-human/manifest.json',
};

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

let currentObject = null;

function resize() {
  camera.aspect = viewer.clientWidth / viewer.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(viewer.clientWidth, viewer.clientHeight);
}

window.addEventListener('resize', resize);

async function loadManifest(sampleKey) {
  const response = await fetch(samples[sampleKey]);
  if (!response.ok) {
    throw new Error(`failed to load manifest: ${response.status}`);
  }
  return response.json();
}

function loadObj(meshPath) {
  statusEl.textContent = 'Loading mesh';
  const loader = new OBJLoader();
  loader.load(
    meshPath,
    (object) => {
      if (currentObject) {
        scene.remove(currentObject);
      }
      object.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0x7c9cbf,
            roughness: 0.65,
            metalness: 0.05,
          });
        }
      });
      currentObject = object;
      scene.add(object);
      frameObject(object);
      statusEl.textContent = 'Loaded';
    },
    undefined,
    (error) => {
      statusEl.textContent = 'Mesh load failed';
      console.error(error);
    },
  );
}

function frameObject(object) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxSize = Math.max(size.x, size.y, size.z) || 1;
  const distance = maxSize * 1.8;

  controls.target.copy(center);
  camera.position.set(center.x, center.y + maxSize * 0.2, center.z + distance);
  camera.near = Math.max(maxSize / 100, 0.001);
  camera.far = Math.max(maxSize * 20, 100);
  camera.updateProjectionMatrix();
  controls.update();
}

function resetView() {
  if (currentObject) {
    frameObject(currentObject);
  }
}

function setActiveButton(sampleKey) {
  modeButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.sample === sampleKey);
  });
}

function loadSample(sampleKey) {
  setActiveButton(sampleKey);
  statusEl.textContent = 'Loading manifest';
  loadManifest(sampleKey)
    .then((manifest) => {
      const result = manifest.result;
      taskEl.textContent = manifest.task_id;
      modelEl.textContent = result.model_type;
      meshEl.textContent = result.output_paths.mesh;
      loadObj(result.output_paths.mesh);
    })
    .catch((error) => {
      statusEl.textContent = 'Load failed';
      console.error(error);
    });
}

modeButtons.forEach((button) => {
  button.addEventListener('click', () => loadSample(button.dataset.sample));
});

resetButton.addEventListener('click', resetView);

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

loadSample('thuman');

animate();
