import './style.css';
import * as THREE from 'three';
import CANNON, { Vec3 } from 'cannon';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';
import { Interaction } from 'three.interaction';

/**
 * Debug
 */
const gui = new dat.GUI();
const count = Array(1).fill('');
const debugObject = {
  force: 20,
  front: () => {
    camera.position.set(0, 0, 0);
  },
  createSphere: () =>
    count.forEach(() =>
      createSphere(Math.random() * 0.5, {
        x: (Math.random() - 0.5) * 3,
        y: (Math.random() - 0.5) * 3,
        z: (Math.random() - 0.5) * 3
      })
    ),
  createBox: () => {
    count.forEach(() =>
      createBox(
        1,
        1,
        1,
        {
          x: 1,
          y: 1,
          z: 1
        },
        true
      )
    );
  },
  reset: () => {
    for (const object of objectsToUpdate) {
      world.removeBody(object.body);
      world.removeEventListener('collide', playSound);
      scene.remove(object.mesh);
    }
  },
  createWalls: () => {
    let counter = 0;
    for (let i = 1; i <= 3; i++) {
      // createBox(0.5, 0.2, 0.2, new THREE.Vector3(-1 + offset, counter, 0));
      // createBox(0.5, 0.2, 0.2, new THREE.Vector3(-0.49 + offset, counter, 0));
      // createBox(0.5, 0.2, 0.2, new THREE.Vector3(0.02 + offset, counter, 0));
      // createBox(0.5, 0.2, 0.2, new THREE.Vector3(0.53 + offset, counter, 0));
      // createBox(0.5, 0.2, 0.2, new THREE.Vector3(1.04 + offset, counter, 0));
      createBox(
        0.8,
        0.8,
        0.8,
        {
          x: -0.6,
          y: counter + 0.4,
          z: 1
        },
        true
      );

      createBox(
        0.8,
        0.8,
        0.8,
        {
          x: 1,
          y: counter + 0.4,
          z: 1
        },
        true
      );

      createBox(
        0.8,
        0.8,
        0.8,
        {
          x: 0.2,
          y: counter + 0.4,
          z: 1
        },
        true
      );

      createBox(
        0.8,
        0.8,
        0.8,
        {
          x: 1.8,
          y: counter + 0.4,
          z: 1
        },
        true
      );
      counter += 0.8;
      // createBox(
      //   0,
      //   1 + offset,
      //   1,
      //   {
      //     x: 1,
      //     y: 1,
      //     z: 1
      //   },
      //   true
      // );

      // createBox(
      //   -1,
      //   1 + offset,
      //   1,
      //   {
      //     x: 1,
      //     y: 1,
      //     z: 1
      //   },
      //   true
      // );
    }
  }
};
// gui.add(debugObject, 'createSphere');
// gui.add(debugObject, 'front');

gui.add(debugObject, 'createWalls');
gui.add(debugObject, 'createBox');
gui.add(debugObject, 'force').min(0).max(50);
gui.add(debugObject, 'reset');

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();

const environmentMapTexture = cubeTextureLoader.load([
  '/textures/environmentMaps/0/px.png',
  '/textures/environmentMaps/0/nx.png',
  '/textures/environmentMaps/0/py.png',
  '/textures/environmentMaps/0/ny.png',
  '/textures/environmentMaps/0/pz.png',
  '/textures/environmentMaps/0/nz.png'
]);

const boxTexture = textureLoader.load('/textures/boxFace.jpeg');
// boxTexture.wrapS = THREE.RepeatWrapping;

// PHYSICS
const sound = new Audio('/sounds/hit.mp3');
const playSound = (collision) => {
  const force = collision.contact.getImpactVelocityAlongNormal() > 0.5;
  const volume = force - Math.random() / force;
  if (force > 0.5) {
    sound.volume = volume;
    sound.currentTime = 0;
    sound.play();
  }
};
const world = new CANNON.World();
world.gravity.set(0, -9.81, 0);
world.allowSleep = true;
world.broadphase = new CANNON.SAPBroadphase(world);

const defaultMaterial = new CANNON.Material('default');

const concretePlasticContact = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
  friction: 0.1,
  restitution: 0.2
});

world.addContactMaterial(concretePlasticContact);
world.defaultContactMaterial = concretePlasticContact;

// const sphereShape = new CANNON.Sphere(0.5);
// const sphereBody = new CANNON.Body({
//   mass: 1,
//   position: new CANNON.Vec3(0, 3, 0),
//   shape: sphereShape
// });

// sphereBody.applyLocalForce(new CANNON.Vec3(150, 0, 0), new CANNON.Vec3(0, 0, 0));
// world.addBody(sphereBody);
const floorShape = new CANNON.Box(new CANNON.Vec3(5, 5, 0.01));
// const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body({
  shape: floorShape,
  type: CANNON.Body.STATIC
});

world.addBody(floorBody);
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);

/**
 * Test sphere
 */
// const sphere = new THREE.Mesh(
//   new THREE.SphereBufferGeometry(0.5, 32, 32),
//   new THREE.MeshStandardMaterial({
//     metalness: 0.3,
//     roughness: 0.4,
//     envMap: environmentMapTexture
//   })
// );
// sphere.castShadow = true;
// sphere.position.y = 0.5;
// scene.add(sphere);

/**
 * Floor
 */
const floor = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(10, 10),
  new THREE.MeshStandardMaterial({
    color: '#777777',
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture
  })
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

// cannon
const cannon = new THREE.Mesh(
  new THREE.BoxBufferGeometry(1, 1),
  new THREE.MeshStandardMaterial({ color: 'grey', metalness: 0.9, roughness: 0.2 })
);
cannon.position.z = 4;
cannon.position.y = 0.5;
cannon.scale.set(1, 0.5, 0.9);
scene.add(cannon);

const planet1 = new THREE.Mesh(
  new THREE.SphereBufferGeometry(10, 32, 32),
  new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0, color: 'pink' })
);
planet1.position.set(-30, 0, -70);
scene.add(planet1);

const planet2 = new THREE.Mesh(
  new THREE.SphereBufferGeometry(10, 32, 32),
  new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0, color: '#C4faf8' })
);
planet2.position.set(10, 0, -70);
scene.add(planet2);

const planet3 = new THREE.Mesh(
  new THREE.SphereBufferGeometry(40, 32, 32),
  new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0, color: '#afcbff' })
);
planet3.position.set(40, 0, -170);
scene.add(planet3);
/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight('white', 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight('white', 0.2);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

window.addEventListener('resize', () => {
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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(0, 5, 10);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// UTILS
const objectsToUpdate = [];
const sphereGeometry = new THREE.SphereBufferGeometry(1, 20, 20);
const sphereMaterial = new THREE.MeshStandardMaterial({
  metalness: 0.3,
  roughness: 0.4
});

const mouse = new THREE.Vector2();
const intersectionPoint = new THREE.Vector3();
const raycaster = new THREE.Raycaster();
const planeNormal = new THREE.Vector3();
const plane = new THREE.Plane();

window.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  planeNormal.copy(camera.position).normalize();
  plane.setFromNormalAndCoplanarPoint(planeNormal, scene.position);
  raycaster.setFromCamera(mouse, camera);
  raycaster.ray.intersectPlane(plane, intersectionPoint);

  cannon.rotation.y = -mouse.x;
  // cannon.lookAt(-mouse.x)
});

window.addEventListener('click', (event) => {
  if (event.altKey) return;
  const material = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    color: Math.random() * 0xffffff
  });
  const position = new Vec3().copy(cannon.position);
  position.z -= 1;
  createSphere(0.2, cannon.position, material);
});

function createSphere(radius, position, material) {
  const mesh = new THREE.Mesh(sphereGeometry, material);
  mesh.scale.set(radius, radius, radius);
  mesh.castShadow = true;
  // mesh.position.copy(position);
  scene.add(mesh);

  const shape = new CANNON.Sphere(radius);
  const body = new CANNON.Body({
    shape,
    mass: 3,
    position: new CANNON.Vec3(position.x, position.y, position.z),
    material: defaultMaterial
  });
  // body.addEventListener('collide', playSound);
  body.position.copy(position);
  world.addBody(body);

  const v = new THREE.Vector3(0, 0, -1);
  const m = new THREE.Vector3(mouse, 0);
  if (mouse.y > 0.5 || mouse.y < 0) {
    mouse.y = 0;
  }
  const q = new THREE.Quaternion(-mouse.y, -mouse.x, 0);
  console.log(mouse);
  v.applyQuaternion(q);
  v.multiplyScalar(debugObject.force);
  body.velocity.set(v.x, v.y, v.z);

  objectsToUpdate.push({ mesh, body });
}

const boxGeometry = new THREE.BoxBufferGeometry(1, 1);
const boxMaterial = new THREE.MeshStandardMaterial({ metalness: 0.3, roughness: 0.4, envMap: environmentMapTexture });

function createBox(width, height, depth, position, box = false) {
  const mesh = new THREE.Mesh(boxGeometry, boxMaterial);
  mesh.scale.set(width, height, depth);
  mesh.castShadow = true;
  mesh.position.copy(position);
  mesh.rotateX(45);

  if (box) {
    const boxt = new THREE.MeshStandardMaterial({ map: boxTexture });
    mesh.material = boxt;
  }

  scene.add(mesh);

  const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
  const body = new CANNON.Body({ shape, mass: 2, position: new CANNON.Vec3(0, 3, 0), material: defaultMaterial });
  // var axis = new CANNON.Vec3(0, 1, 0);
  // var angle = 3.3;
  // body.quaternion.setFromAxisAngle(axis, angle);
  // body.addEventListener('collide', playSound);
  body.position.copy(position);
  world.addBody(body);

  objectsToUpdate.push({ mesh, body });
}

const clock = new THREE.Clock();
let previousTime = 0;

new Interaction(renderer, scene, camera);

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // Update controls
  controls.update();

  world.step(1 / 60, deltaTime, 3);

  planet2.position.x = 70 * Math.cos(elapsedTime) + 40;
  planet2.position.z = 80 * Math.sin(elapsedTime) - 200;
  planet1.position.y = Math.sin(elapsedTime * 2) * 10;

  for (const object of objectsToUpdate) {
    object.mesh.position.copy(object.body.position);
    object.mesh.quaternion.copy(object.body.quaternion);
  }

  floor.position.copy(floorBody.position);
  floor.quaternion.copy(floorBody.quaternion);

  //   sphereBody.applyForce(new CANNON.Vec3(-0.5, 0, 0), sphereBody.position);

  //   sphere.position.copy(sphereBody.position);

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
