import * as THREE from "https://unpkg.com/three@0.159.0/build/three.module.js";
import { GLTFLoader } from "https://unpkg.com/three@0.159.0/examples/jsm/loaders/GLTFLoader.js";

const canvas = document.getElementById("kb");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 2, 0.1, 100);
camera.position.set(0, 4, 9);

scene.add(new THREE.HemisphereLight(0xffffff, 0xe9edf5, 0.7));
const keyL = new THREE.DirectionalLight(0xffe3c4, 1.0);
keyL.position.set(5, 8, 6);
scene.add(keyL);
const rimL = new THREE.DirectionalLight(0x5bc0ff, 0.9);
rimL.position.set(-6, 7, -5);
scene.add(rimL);

const MODEL_URL = "./src/assets/models/keyboard.glb"; // adjust if your path is different
const loader = new GLTFLoader();
const keys = [];

loader.load(MODEL_URL, (g) => {
  const root = g.scene;
  root.scale.setScalar(0.01); // downscale if needed
  root.rotation.y = Math.PI; // rotate 180° if you want
  scene.add(root);

  root.traverse((o) => {
    if (o.isMesh && o.name?.startsWith("key_")) keys.push(o);
  });
  fitCameraToObject(camera, root, 1.25);
  render();
});

const ray = new THREE.Raycaster(),
  mouse = new THREE.Vector2(),
  pressing = new Set();
canvas.addEventListener("pointerdown", (e) => {
  const r = canvas.getBoundingClientRect();
  mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
  mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  ray.setFromCamera(mouse, camera);
  const hit = ray.intersectObjects(keys, true)[0];
  if (hit) press(hit.object);
});

function press(obj) {
  if (pressing.has(obj)) return;
  pressing.add(obj);
  const start = performance.now(),
    down = 90,
    up = 140;
  const oy = obj.position.y,
    orx = obj.rotation.x,
    orz = obj.rotation.z;
  function anim(t) {
    const dt = t - start;
    let p = dt < down ? dt / down : 1 - Math.min((dt - down) / up, 1);
    p = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    obj.position.y = oy - 0.06 * p;
    obj.rotation.x = orx + 0.04 * p;
    obj.rotation.z = orz - 0.02 * p;
    render();
    if (dt < down + up) requestAnimationFrame(anim);
    else {
      obj.position.y = oy;
      obj.rotation.x = orx;
      obj.rotation.z = orz;
      pressing.delete(obj);
    }
  }
  requestAnimationFrame(anim);
}

function fitCameraToObject(camera, object, offset = 1.2) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  object.position.sub(center);

  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = THREE.MathUtils.degToRad(camera.fov);
  let dist = (maxDim / 2 / Math.tan(fov / 2)) * offset;

  const dir = new THREE.Vector3()
    .subVectors(camera.position, new THREE.Vector3())
    .normalize();
  camera.position.copy(dir.multiplyScalar(dist));
  camera.near = dist / 100;
  camera.far = dist * 100;
  camera.updateProjectionMatrix();
  camera.lookAt(0, 0, 0);
}

function render() {
  const w = canvas.clientWidth,
    h = canvas.clientHeight;
  if (canvas.width !== w || canvas.height !== h) {
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  renderer.render(scene, camera);
}
window.addEventListener("resize", render);
render();
