import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

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

const MODEL_URL = "./src/assets/models/keyboard.glb";
const loader = new GLTFLoader();
const keys = [];
let modelRoot = null;

loader.load(MODEL_URL, (g) => {
  const root = g.scene;
  modelRoot = root;
  root.scale.setScalar(0.01);
  root.rotation.y = Math.PI;
  root.rotation.x = 0.25;

  scene.add(root);
  // Prefer top-level meshes (direct children of the GLTF root) except the body
  const topLevel = [];
  root.traverse((o) => {
    if (!o.isMesh) return;
    if (o.name === "body") return;
    if (o.parent === root) topLevel.push(o);
  });
  const pool = topLevel.length ? topLevel : [];
  if (!pool.length) {
    // Fallback: any mesh except body
    root.traverse((o) => {
      if (o.isMesh && o.name !== "body") pool.push(o);
    });
  }
  for (const o of pool) {
    o.userData.restY = o.position.y;
    o.userData.hovered = false;
    o.userData.bouncing = false;
    keys.push(o);
  }

  frameFromDirection(camera, root, new THREE.Vector3(-0.8, 0.75, 0.8), 1.22);
  render();
});

/* ---------- Hover + Press ---------- */

const ray = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const pressing = new Set();
let hovered = null;
const HOVER_LIFT = 0.012;

// hover highlight helpers (handle single or multi-material)
function setHighlight(mesh, on) {
  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  for (const m of mats) {
    if (!m || !("emissive" in m)) continue;
    if (on) {
      if (!m.userData._origEmissive) {
        m.userData._origEmissive = m.emissive.clone();
        m.userData._origIntensity = m.emissiveIntensity ?? 1;
      }
      m.emissive.set(0xffffff);
      m.emissiveIntensity = 0.15;
    } else if (m.userData._origEmissive) {
      m.emissive.copy(m.userData._origEmissive);
      m.emissiveIntensity = m.userData._origIntensity ?? 1;
    } else {
      m.emissive.set(0x000000);
      m.emissiveIntensity = 1;
    }
  }
}

// HOVER
canvas.addEventListener("pointermove", (e) => {
  const r = canvas.getBoundingClientRect();
  mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
  mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  ray.setFromCamera(mouse, camera);

  const hit = ray.intersectObjects(keys, true)[0];
  const next = hit ? getKeyRoot(hit.object) : null;

  if (hovered !== next) {
    if (hovered && !pressing.has(hovered)) {
      // clear previous hover (absolute restore to baseline)
      if (hovered.userData) hovered.userData.bouncing = false;
      hovered.userData.hovered = false;
      hovered.position.y = hovered.userData.restY;
      setHighlight(hovered, false);
    }
    if (next && !pressing.has(next)) {
      // apply new hover state & bounce
      next.userData.hovered = true;
      next.position.y = (next.userData.restY ?? next.position.y) + HOVER_LIFT;
      setHighlight(next, true);
      bounceKey(next);
    }
    hovered = next;
    canvas.style.cursor = hovered ? "pointer" : "default";
    render();
  }
});

// leave canvas → clear hover
canvas.addEventListener("pointerleave", () => {
  if (hovered && !pressing.has(hovered)) {
    if (hovered.userData) hovered.userData.bouncing = false;
    hovered.userData.hovered = false;
    hovered.position.y = hovered.userData.restY;
    setHighlight(hovered, false);
  }
  hovered = null;
  canvas.style.cursor = "default";
  render();
});

// PRESS
canvas.addEventListener("pointerdown", (e) => {
  const r = canvas.getBoundingClientRect();
  mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
  mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  ray.setFromCamera(mouse, camera);
  const hit = ray.intersectObjects(keys, true)[0];
  if (hit) press(getKeyRoot(hit.object));
});

function press(obj) {
  if (pressing.has(obj)) return;
  pressing.add(obj);

  const start = performance.now();
  const down = 90,
    up = 140;
  const depth = 0.06,
    tiltX = 0.04,
    tiltZ = 0.02;

  // start from current pose (works whether it's hovered or not)
  const oy = obj.position.y,
    orx = obj.rotation.x,
    orz = obj.rotation.z;

  requestAnimationFrame(function anim(t) {
    const dt = t - start;
    let p = dt < down ? dt / down : 1 - Math.min((dt - down) / up, 1);
    p = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

    obj.position.y = oy - depth * p;
    obj.rotation.x = orx + tiltX * p;
    obj.rotation.z = orz - tiltZ * p;

    render();
    if (dt < down + up) requestAnimationFrame(anim);
    else {
      // restore to latest baseline (hover may have changed during press)
      const base = (obj.userData?.hovered
        ? (obj.userData.restY ?? oy) + HOVER_LIFT
        : (obj.userData.restY ?? oy));
      obj.position.y = base;
      obj.rotation.x = orx;
      obj.rotation.z = orz;
      pressing.delete(obj);
      render();
    }
  });
}

// Quick press-like bounce when a key gets hovered
function bounceKey(obj) {
  if (!obj || pressing.has(obj)) return;
  if (obj.userData?.bouncing) return;
  obj.userData.bouncing = true;

  const start = performance.now();
  const down = 80, up = 120;
  const depth = 0.02, tiltX = 0.01, tiltZ = 0.006;

  const oy = obj.position.y;
  const orx = obj.rotation.x;
  const orz = obj.rotation.z;

  function anim(t) {
    const dt = t - start;
    let p = dt < down ? dt / down : 1 - Math.min((dt - down) / up, 1);
    // easeInOutQuad
    p = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

    obj.position.y = oy - depth * p;
    obj.rotation.x = orx + tiltX * p;
    obj.rotation.z = orz - tiltZ * p;

    render();
    if (dt < down + up && obj.userData.bouncing) requestAnimationFrame(anim);
    else {
      obj.userData.bouncing = false;
      // restore to the appropriate baseline
      const base = (obj.userData?.hovered
        ? (obj.userData.restY ?? oy) + HOVER_LIFT
        : (obj.userData.restY ?? oy));
      obj.position.y = base;
      obj.rotation.x = orx;
      obj.rotation.z = orz;
      render();
    }
  }

  requestAnimationFrame(anim);
}

function getKeyRoot(o) {
  let n = o;
  while (n && n.parent) {
    if (keys.includes(n)) return n;
    n = n.parent;
  }
  return o;
}

/* ---------- Camera framing helper ---------- */
function frameFromDirection(camera, object, dir, fill = 1.2) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  object.position.sub(center);

  const maxDim = Math.max(size.x, size.y, size.z);
  const vFov = THREE.MathUtils.degToRad(camera.fov);
  const dist = (maxDim / 2 / Math.tan(vFov / 2)) * fill;

  const d = dir.clone().normalize().multiplyScalar(dist);
  camera.position.copy(d);
  camera.near = dist / 100;
  camera.far = dist * 100;
  camera.updateProjectionMatrix();
  camera.lookAt(0, 0, 0);
}

/* ---------- Render loop ---------- */
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
