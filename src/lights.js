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
export const doorLight = new THREE.PointLight("#ff7d46", 1, 7);
doorLight.castShadow = true;
doorLight.shadow.mapSize.width = 256;
doorLight.shadow.mapSize.height = 256;
doorLight.shadow.camera.far = 7;

doorLight.position.set(0, 2.2, 2.7);
