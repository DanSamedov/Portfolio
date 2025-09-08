import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const AVATAR_URL = "./src/assets/models/avatar_typing.glb";
const CLIP_BELOW_WAIST = true;

const canvas = document.getElementById("avatar3d");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5; // brighter exposure
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.localClippingEnabled = true;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 2, 0.1, 100);

// Lighting (soft ambient + key + rim)
scene.add(new THREE.HemisphereLight(0xffffff, 0x0b0d0f, 1.1));
const keyL = new THREE.DirectionalLight(0xffffff, 1.7);
keyL.position.set(5, 8, 6);
scene.add(keyL);
const rimL = new THREE.DirectionalLight(0x5bc0ff, 1.3);
rimL.position.set(-6, 7, -5);
scene.add(rimL);
scene.add(new THREE.AmbientLight(0xffffff, 0.28));

let mixer = null;

// Load avatar + animation
const loader = new GLTFLoader();
loader.load(AVATAR_URL, (gltf) => {
  const avatar = gltf.scene;
  avatar.scale.setScalar(0.01);
  avatar.rotation.y = Math.PI; // face the same way as your keyboard
  scene.add(avatar);

  // Better shading
  avatar.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });

  // Play first animation (Mixamo exports one by default)
  if (gltf.animations?.length) {
    mixer = new THREE.AnimationMixer(avatar);
    mixer.clipAction(gltf.animations[0]).play();
  }

  // Ensure matrices are current before framing
  scene.updateMatrixWorld(true);

  // Frame the camera first so world transforms are finalized,
  // then apply clipping (so we don't clip the whole model by mistake).
  // Left-side three-quarter view (x<0 = camera to the left)
  frameToObject(camera, avatar, new THREE.Vector3(-1.2, 0.2, -0.5), 1.8);

  // Add a soft front fill from the camera direction to brighten the face
  const fillL = new THREE.DirectionalLight(0xffffff, 0.6);
  fillL.position.copy(camera.position.clone().normalize().multiplyScalar(5));
  scene.add(fillL);

  // Optional: hide legs by clipping below hips (after framing)
  if (CLIP_BELOW_WAIST) clipBelowWaist(avatar);
  render();
});

// --- helpers ---
function frameToObject(
  cam,
  obj,
  dir = new THREE.Vector3(0, 1.0, 1.0),
  fill = 0.95
) {
  // Make sure transforms are up-to-date for accurate bounds
  obj.updateWorldMatrix(true, true);

  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  obj.position.sub(center); // center the model

  // Guard against zero-size bounding boxes
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const vFov = THREE.MathUtils.degToRad(cam.fov);
  let dist = (maxDim / 2 / Math.tan(vFov / 2)) * fill;
  if (!isFinite(dist) || dist <= 0) dist = 2.5; // sensible fallback

  const d = dir.clone().normalize().multiplyScalar(dist);
  cam.position.copy(d);
  cam.near = Math.max(0.01, dist / 100);
  cam.far = Math.max(cam.near + 1, dist * 100);
  cam.updateProjectionMatrix();
  cam.lookAt(0, 0, 0);
}

function clipBelowWaist(root) {
  // Try common Mixamo bone names
  const hips =
    root.getObjectByName("Hips") ||
    root.getObjectByName("mixamorig:Hips") ||
    root.getObjectByName("mixamorig_Hips") ||
    root;

  const p = new THREE.Vector3();
  hips.getWorldPosition(p);

  // y-up plane just below hips
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -(p.y - 0.02));

  root.traverse((o) => {
    if (!o.isMesh) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of mats) {
      m.clippingPlanes = [plane];
      m.clipShadows = true;
      m.needsUpdate = true;
    }
  });
}

// --- render loop ---
const clock = new THREE.Clock();
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

function loop() {
  const dt = clock.getDelta();
  if (mixer) mixer.update(dt);
  render();
  requestAnimationFrame(loop);
}
window.addEventListener("resize", render);
loop();
