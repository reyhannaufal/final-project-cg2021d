import * as THREE from "three";

const ghost1 = new THREE.PointLight("#ff00ff", 3, 3);
ghost1.castShadow = true;
ghost1.shadow.mapSize.width = 256;
ghost1.shadow.mapSize.height = 256;
ghost1.shadow.camera.far = 7;

const ghost2 = new THREE.PointLight("#00ffff", 3, 3);
ghost2.castShadow = true;
ghost2.shadow.mapSize.width = 256;
ghost2.shadow.mapSize.height = 256;
ghost2.shadow.camera.far = 7;

const ghost3 = new THREE.PointLight("#ff7800", 3, 3);
ghost3.castShadow = true;
ghost3.shadow.mapSize.width = 256;
ghost3.shadow.mapSize.height = 256;
ghost3.shadow.camera.far = 7;

export const ghosts = [
  {
    light: ghost1,
    getPosition: (elapsedTime) => {
      // Ghost 1 movement
      const angle = elapsedTime * 0.5;
      const x = Math.cos(angle) * 6;
      const y = 0.5 * Math.sin(elapsedTime * 3) + 0.5;
      const z = Math.sin(angle) * 6;
      return [x, y, z];
    },
  },
  {
    light: ghost2,
    getPosition: (elapsedTime) => {
      // Ghost 2 movement
      const angle = -elapsedTime * 0.32;
      const x = Math.cos(angle) * 7;
      const y =
        0.5 * Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5) + 0.5;
      const z = Math.sin(angle) * 7;
      return [x, y, z];
    },
  },
  {
    light: ghost3,
    getPosition: (elapsedTime) => {
      // Ghost 3 movement
      const angle = -elapsedTime * 0.18;
      const x = Math.cos(angle) * (9 + Math.sin(elapsedTime * 0.32));
      const y =
        0.5 * Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5) + 0.5;
      const z = Math.sin(angle) * (9 + Math.sin(elapsedTime * 0.5));
      return [x, y, z];
    },
  },
];
