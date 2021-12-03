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
import { WebGLMultisampleRenderTarget } from "three";
import {
  graveTexture,
  graveTextureReflection,
  ripTexture,
} from "./projectTextures";
import { KeyDisplay } from "./character/utils";
import { CharacterControls } from "./character/characterControls";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

// Debug
const gui = new dat.GUI();

const canvas = document.querySelector("canvas.webgl");

const scene = new THREE.Scene();

/* Components ------------------------------------------------------------- */

// Graves material & logic
const graves = new THREE.Group();
const graveGeometry = new THREE.BoxBufferGeometry(0.6, 0.7, 0.1);
const graveMaterial = [
  new THREE.MeshStandardMaterial({ map: graveTexture }),
  new THREE.MeshStandardMaterial({ map: graveTexture }),
  new THREE.MeshStandardMaterial({ map: graveTexture }),
  new THREE.MeshStandardMaterial({ map: graveTexture }),
  new THREE.MeshStandardMaterial({ map: ripTexture }),
  new THREE.MeshStandardMaterial({ map: graveTexture }),
  new THREE.MeshStandardMaterial({ envMap: graveTextureReflection }),
];

for (let i = 0; i < 50; i++) {
  const angle = Math.random() * Math.PI * 2; // Random angle
  const radius = 5 + Math.random() * 6; // Random radius
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

  keyDisplayQueue.updatePosition();
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
controls.minDistance = 1.25;
controls.maxDistance = 3;
controls.enablePan = false;
controls.maxPolarAngle = Math.PI / 2 - 0.05;
controls.update();

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
let animateStuff = true;
let oldElapsedTime = 0;
let clockwise = true;

const tick = () => {
  // Ghosts
  if (animateStuff) {
    const elapsedTime = clock.getElapsedTime() * (clockwise ? 1 : -1);

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

    // Character
    if (characterControls) {
      characterControls.update(0.0125, keysPressed);
    }
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

// Control Keys
const keysPressed = {};
const keyDisplayQueue = new KeyDisplay();
const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlay-text");
document.addEventListener("keydown", (event) => {
  keyDisplayQueue.down(event.key);
  if (event.shiftKey && characterControls) {
    characterControls.switchRunToggle();
  } else {
    keysPressed[event.key.toLowerCase()] = true;
  }
});
document.addEventListener("keyup", (e) => {
  if (e.code === "Space" || e.code === "KeyR") {
    if (e.code === "KeyR") {
      clockwise = !clockwise;
      return;
    }
    animateStuff = !animateStuff;
    if (!animateStuff) {
      overlay.style.display = "block";
    } else {
      overlay.style.display = "none";
    }

    if (clock.running) {
      oldElapsedTime = clock.getElapsedTime();
      clock.running = false;
      return;
    }
    clock.start();
    clock.elapsedTime = oldElapsedTime;
    return;
  }
  keyDisplayQueue.up(e.key);
  keysPressed[e.key.toLowerCase()] = false;
});

/**
 * Load model
 */
const manager = new THREE.LoadingManager();
manager.onStart = function (url, itemsLoaded, itemsTotal) {
  console.log(
    "Started loading file: " +
      url +
      ".\nLoaded " +
      itemsLoaded +
      " of " +
      itemsTotal +
      " files."
  );
};

manager.onLoad = function () {
  console.log("Loading complete!");
};

manager.onProgress = function (url, itemsLoaded, itemsTotal) {
  console.log(
    "Loading file: " +
      url +
      ".\nLoaded " +
      itemsLoaded +
      " of " +
      itemsTotal +
      " files."
  );
};

manager.onError = function (url) {
  console.log("There was an error loading " + url);
};

let finishedModels = 0;
const loadFinishEvent = new Event("loadFinish");
const modelAmounts = 3;

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
    document.dispatchEvent(loadFinishEvent);
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
    model.scale.set(0.02, 0.02, 0.01);
    scene.add(model);
  },
  function (xhr) {
    document.dispatchEvent(loadFinishEvent);
  },
  function (error) {
    console.error(error);
  }
);

/**
 * Load character model with animations
 *
 */
// Zombie Model
let characterControls;
const fbxLoader = new FBXLoader();
fbxLoader.setPath("./models/zombie/");
fbxLoader.load("mremireh_o_desbiens.fbx", (fbx) => {
  fbx.scale.setScalar(0.0075);
  fbx.position.set(2, 0.08, 2);
  fbx.traverse((obj) => {
    obj.castShadow = true;
  });

  scene.add(fbx);

  const mixer = new THREE.AnimationMixer(fbx);
  const animationsMap = new Map();

  const loadAnim = (animName, anim) => {
    const clip = anim.animations[0];
    const action = mixer.clipAction(clip);

    animationsMap.set(animName, action);
  };

  const animManager = new THREE.LoadingManager();
  const animLoader = new FBXLoader(animManager);
  animLoader.setPath("./models/zombie/");
  animLoader.load("idle.fbx", (a) => {
    loadAnim("Idle", a);
  });
  animLoader.load("walk.fbx", (a) => {
    loadAnim("Walk", a);
  });
  animLoader.load("run.fbx", (a) => {
    loadAnim("Run", a);
  });

  animManager.onLoad = () => {
    characterControls = new CharacterControls(
      fbx,
      mixer,
      animationsMap,
      controls,
      camera,
      "Idle"
    );
    document.dispatchEvent(loadFinishEvent);
  };
});

/**
 * DO NOT TOUCH THIS
 * COMMENT TO TEST
 * MAKE SURE TO UNCOMMENT OUT BEFORE PUSHING
 */
document.addEventListener("start", () => {
  if (finishedModels < modelAmounts) {
    overlay.style.display = "block";
    overlayText.textContent = "Loading...";
  }
});

document.addEventListener("loadFinish", function () {
  finishedModels++;
  if (finishedModels >= modelAmounts) {
    overlay.style.display = "none";
    overlayText.textContent = "Paused";
  }
});

// Star material
const parameterGalaxy = {};
parameterGalaxy.count = 400;
parameterGalaxy.size = 0.075;
parameterGalaxy.radius = 20;
parameterGalaxy.branches = 2;
parameterGalaxy.spin = -5;
parameterGalaxy.randomness = 2;
parameterGalaxy.randomnessPower = 10;
parameterGalaxy.insideColor = "#FFFFFF";
parameterGalaxy.outsideColor = "#FFFFFF";

let geometry = null;
let material = null;
let points = null;

const generateGalaxy = () => {
  if (points !== null) {
    geometry.dispose();
    material.dispose();
    scene.remove(points);
  }

  geometry = new THREE.BufferGeometry();

  const positions = new Float32Array(parameterGalaxy.count * 3);
  const colors = new Float32Array(parameterGalaxy.count * 3);

  const colorInside = new THREE.Color(parameterGalaxy.insideColor);
  const colorOutside = new THREE.Color(parameterGalaxy.outsideColor);

  for (let i = 0; i < parameterGalaxy.count; i++) {
    const i3 = i * 3;

    // Position
    const radius = Math.random() * parameterGalaxy.radius;
    const branchAngle =
      ((i % parameterGalaxy.branches) / parameterGalaxy.branches) * Math.PI * 2;
    const spinAngle = radius * parameterGalaxy.spin;

    const randomX =
      Math.pow(Math.random(), parameterGalaxy.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);
    const randomY =
      Math.pow(Math.random(), parameterGalaxy.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);
    const randomZ =
      Math.pow(Math.random(), parameterGalaxy.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1);

    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    // Color
    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, radius / parameterGalaxy.radius);

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  geometry.setAttribute("colors", new THREE.BufferAttribute(colors, 3));

  material = new THREE.PointsMaterial({
    size: parameterGalaxy.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  });

  points = new THREE.Points(geometry, material);
  points.position.y = 7.5;
  scene.add(points);
};

generateGalaxy();
