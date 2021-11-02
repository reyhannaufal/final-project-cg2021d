import * as THREE from "three";
/**
 * Lights
 */

// Ambient light
export const ambientLight = new THREE.AmbientLight("#b9d5ff", 0.3);

// Directional light
export const moonLight = new THREE.DirectionalLight("#b9d5ff", 0.12);
moonLight.castShadow = true;
moonLight.shadow.mapSize.width = 256;
moonLight.shadow.mapSize.height = 256;
moonLight.shadow.camera.far = 15;
moonLight.position.set(4, 5, -2);

// Door light
export const doorLight = new THREE.PointLight(new THREE.Color("red"), 5, 7);
doorLight.castShadow = true;
doorLight.shadow.mapSize.width = 256;
doorLight.shadow.mapSize.height = 256;
doorLight.shadow.camera.far = 7;
doorLight.position.set(0, 2.2, 2.7);

export const secondDoorLight = new THREE.PointLight(
  new THREE.Color("orange"),
  1,
  7
);
secondDoorLight.castShadow = true;
secondDoorLight.shadow.mapSize.width = 256;
secondDoorLight.shadow.mapSize.height = 256;
secondDoorLight.shadow.camera.far = 7;

secondDoorLight.position.set(6.5, 2.2, 2.7);
