import "./style.css";
import * as THREE from "three";
import * as dat from "dat.gui";
import house from "./components/house";
import twoStoryHouse from "./components/twoStoryhouse";
import { floor } from "./components/floor";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ambientLight, doorLight, moonLight } from "./lights";
import { ghosts } from "./components/ghosts";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Debug
const gui = new dat.GUI();

const canvas = document.querySelector("canvas.webgl");

const scene = new THREE.Scene();

/* Components ------------------------------------------------------------- */
// house(scene);
// twoStoryHouse(scene);

// Graves material & logic
const graves = new THREE.Group();
const graveGeometry = new THREE.BoxBufferGeometry(0.6, 0.8, 0.1);
const graveMaterial = new THREE.MeshStandardMaterial({ color: "#727272" });

for (let i = 0; i < 50; i++) {
  const angle = Math.random() * Math.PI * 2; // Random angle
  const radius = 3 + Math.random() * 6; // Random radius
  const x = Math.cos(angle) * radius; // Get the x position using cosinus
  const z = Math.sin(angle) * radius; // Get the z position using sinus

  // Create the mesh
  const grave = new THREE.Mesh(graveGeometry, graveMaterial);
  grave.castShadow = true;

  // Position
  grave.position.set(x, 0.3, z);

  // Rotation
  grave.rotation.z = (Math.random() - 0.5) * 0.4;
  grave.rotation.y = (Math.random() - 0.5) * 0.4;

  // Add to the graves container
  graves.add(grave);
}

// Fog
const fog = new THREE.Fog("#262837", 1, 15);
scene.fog = fog;

scene.add(ambientLight, moonLight, doorLight, floor, graves);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 5;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor("#262837");
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Ghosts
  for (let i = 0; i < ghosts.length; i++) {
    const originalPosition = new THREE.Vector3();
    const newPosition = new THREE.Vector3();

    ghostGroups[i].children[1].getWorldPosition(originalPosition);
    ghostGroups[i].position.set(...ghosts[i].getPosition(elapsedTime));
    ghostGroups[i].children[1].getWorldPosition(newPosition);

    let displacement = newPosition.sub(originalPosition);
    displacement.setY(2);
    ghostGroups[i].children[1].lookAt(
      ghostGroups[i].localToWorld(displacement)
    );
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

/**
 * Load model
 */
const loader = new GLTFLoader();
let ghostGroups = [];
loader.load(
  "/models/boo_halloween2019/scene.gltf",
  (gltf) => {
    for (let i = 0; i < ghosts.length; i++) {
      const group = new THREE.Group(scene).add(
        ghosts[i].light,
        gltf.scene.clone().children[0]
      );
      scene.add(group);
      ghostGroups.push(group);
    }
    tick();
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.log("An error happened");
    console.log(error);
  }
);
loader.load(
  "models/house/scene.gltf",
  function (gltf) {
    const model = gltf.scene;
    model.position;
    model.position.set(0, 0.1, 0);
    model.scale.set(0.01, 0.01, 0.01);
    scene.add(model);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);
