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
renderer.toneMappingExposure = 1.2; // brighten overall scene
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 2, 0.1, 100);
camera.position.set(0, 4, 9);

scene.add(new THREE.HemisphereLight(0xffffff, 0xe9edf5, 0.95));
const keyL = new THREE.DirectionalLight(0xffffff, 1.35);
keyL.position.set(5, 8, 6);
scene.add(keyL);
const rimL = new THREE.DirectionalLight(0x5bc0ff, 1.1);
rimL.position.set(-6, 7, -5);
scene.add(rimL);
// soft ambient fill to lift shadows subtly
scene.add(new THREE.AmbientLight(0xffffff, 0.15));

/* ---- press config (animation only) ---- */
const PRESS_FRACTION = 0.5; // press by 50% of key height
const TILT_X = 0.06,
  TILT_Z = -0.03;
const IN_MS = 110,
  OUT_MS = 160;
/* -------------------------------------- */

const MODEL_URL = "./src/assets/models/keyboard.glb";
const loader = new GLTFLoader();
// Framing setup: head-on direction with a slightly higher pitch
const FRAME_DIR = new THREE.Vector3(0, 1.0, 1.0);
const FRAME_FILL = 0.8; // smaller = larger on screen

/** Data containers **/
const keyControllers = []; // objects we animate (groups or meshes named key_*)
const rayTargets = []; // meshes we raycast against
const hitToControl = new Map(); // mesh -> controller mapping
let hovered = null;
let grid = null; // 2D array [row][col] of controllers (4x6)
const keyMapByCode = Object.create(null); // event.code -> controller
const keyMapByKey = Object.create(null); // event.key (lowercase) -> controller

/* ---------- load & collect ---------- */
loader.load(MODEL_URL, (g) => {
  const root = g.scene;
  root.scale.setScalar(0.01);
  root.rotation.y = Math.PI;
  root.rotation.x = 0.25;
  scene.add(root);
  // Ensure world matrices are up-to-date for accurate sizing
  scene.updateMatrixWorld(true);

  collectKeys(root);

  // Fallback if nothing matched: use top-level meshes (except "body") as keys
  if (keyControllers.length === 0) {
    root.children.forEach((o) => {
      if (o.isMesh && o.name !== "body") registerKey(o, o);
    });
  }

  // Precompute pose/press targets
  for (const ctrl of keyControllers) {
    // Choose the largest mesh under this key as the cap (ignore tiny decals)
    let capMesh = null;
    let bestVol = -Infinity;
    ctrl.traverse((n) => {
      if (!n.isMesh || !n.geometry) return;
      n.geometry.computeBoundingBox?.();
      const bb = n.geometry.boundingBox;
      if (!bb) return;
      const sx = Math.max(0, bb.max.x - bb.min.x);
      const sy = Math.max(0, bb.max.y - bb.min.y);
      const sz = Math.max(0, bb.max.z - bb.min.z);
      const vol = sx * sy * sz;
      if (vol > bestVol) {
        bestVol = vol;
        capMesh = n;
      }
    });
    if (!capMesh) capMesh = ctrl.userData?.targetMesh || ctrl;

    // Compute the key height in controller-local units by projecting the
    // cap's local bounding-box corners into controller space and measuring Y
    let heightLocal = 0.01; // minimal fallback to avoid zero
    if (capMesh.isMesh && capMesh.geometry) {
      capMesh.geometry.computeBoundingBox?.();
      const bb = capMesh.geometry.boundingBox;
      if (bb) {
        const min = bb.min,
          max = bb.max;
        const corners = [
          new THREE.Vector3(min.x, min.y, min.z),
          new THREE.Vector3(min.x, min.y, max.z),
          new THREE.Vector3(min.x, max.y, min.z),
          new THREE.Vector3(min.x, max.y, max.z),
          new THREE.Vector3(max.x, min.y, min.z),
          new THREE.Vector3(max.x, min.y, max.z),
          new THREE.Vector3(max.x, max.y, min.z),
          new THREE.Vector3(max.x, max.y, max.z),
        ];
        let minY = Infinity,
          maxY = -Infinity;
        for (const c of corners) {
          const world = capMesh.localToWorld(c.clone());
          const inCtrl = ctrl.worldToLocal(world);
          if (inCtrl.y < minY) minY = inCtrl.y;
          if (inCtrl.y > maxY) maxY = inCtrl.y;
        }
        const span = maxY - minY;
        if (span > 0) heightLocal = span;
      }
    }

    ctrl.userData.restY = ctrl.position.y;
    ctrl.userData.restRx = ctrl.rotation.x;
    ctrl.userData.restRz = ctrl.rotation.z;
    ctrl.userData.pressY = ctrl.userData.restY - heightLocal * PRESS_FRACTION;
    ctrl.userData.pressRx = ctrl.userData.restRx + TILT_X;
    ctrl.userData.pressRz = ctrl.userData.restRz + TILT_Z;
    ctrl.userData.animToken = null;

    // Stabilize any transparent decal sub-mats (if joined logos exist)
    ctrl.traverse((n) => {
      if (!n.isMesh) return;
      const mats = Array.isArray(n.material) ? n.material : [n.material];
      for (const m of mats) {
        if (!m) continue;
        if (m.transparent || (m.name && /icon|logo/i.test(m.name))) {
          m.transparent = true;
          m.depthWrite = false;
          m.alphaTest = 0.02;
          m.side = THREE.FrontSide;
          m.needsUpdate = true;
        }
      }
    });
  }

  // Build grid + keyboard mapping (rows by Z, columns by X)
  tryBuildGridMapping();

  frameFromDirection(camera, root, FRAME_DIR, FRAME_FILL);
  render();
});

function collectKeys(root) {
  // find any node named key_* (mesh or group)
  const keyNodes = [];
  root.traverse((o) => {
    if (o.name?.startsWith?.("key_")) keyNodes.push(o);
  });
  for (const node of keyNodes) {
    const ctrl = node;
    let targetMesh = node.isMesh
      ? node
      : node.getObjectByProperty("isMesh", true);
    if (!targetMesh) continue; // skip if no geometry found
    registerKey(ctrl, targetMesh);
  }
}

function registerKey(controller, targetMesh) {
  keyControllers.push(controller);
  rayTargets.push(targetMesh);
  hitToControl.set(targetMesh, controller);
  // remember the mesh used for raycasting; helpful for sizing later
  controller.userData.targetMesh = targetMesh;
  controller.userData.pressRefs = 0; // reference counter for combined hover + keyboard
}

/* --------------------- Hover → press/release ------------------- */

const ray = new THREE.Raycaster();
const mouse = new THREE.Vector2();

canvas.addEventListener("pointermove", (e) => {
  const r = canvas.getBoundingClientRect();
  mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
  mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  ray.setFromCamera(mouse, camera);

  const hit = ray.intersectObjects(rayTargets, true)[0];
  const next = hit ? resolveController(hit.object) : null;

  if (next !== hovered) {
    if (hovered) releasePress(hovered);
    if (next) engagePress(next);
    hovered = next;
    canvas.style.cursor = hovered ? "pointer" : "default";
  }
});

canvas.addEventListener("pointerleave", () => {
  if (hovered) {
    releasePress(hovered);
    hovered = null;
    canvas.style.cursor = "default";
  }
});

function resolveController(hitObj) {
  // climb from hit mesh to the registered controller
  let n = hitObj;
  while (n) {
    if (keyControllers.includes(n)) return n;
    if (hitToControl.has(n)) return hitToControl.get(n);
    n = n.parent;
  }
  return null;
}

/* ---------------------- Animation ------------------------- */

function animateKey(obj, ty, trx, trz, ms) {
  const token = {};
  obj.userData.animToken = token;

  const sy = obj.position.y,
    srx = obj.rotation.x,
    srz = obj.rotation.z;
  const start = performance.now();
  const ease = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);

  function step(t) {
    if (obj.userData.animToken !== token) return;
    const dt = Math.min(1, (t - start) / ms);
    const p = ease(dt);

    obj.position.y = sy + (ty - sy) * p;
    obj.rotation.x = srx + (trx - srx) * p;
    obj.rotation.z = srz + (trz - srz) * p;

    render();
    if (dt < 1) requestAnimationFrame(step);
    else {
      obj.position.y = ty;
      obj.rotation.x = trx;
      obj.rotation.z = trz;
      render();
    }
  }
  requestAnimationFrame(step);
}

/* ---------- Press ref-count (hover + keyboard) ---------- */
function engagePress(ctrl) {
  ctrl.userData.pressRefs = (ctrl.userData.pressRefs || 0) + 1;
  if (ctrl.userData.pressRefs === 1) {
    animateKey(
      ctrl,
      ctrl.userData.pressY,
      ctrl.userData.pressRx,
      ctrl.userData.pressRz,
      IN_MS
    );
  }
}

function releasePress(ctrl) {
  const n = Math.max(0, (ctrl.userData.pressRefs || 0) - 1);
  ctrl.userData.pressRefs = n;
  if (n === 0) {
    animateKey(
      ctrl,
      ctrl.userData.restY,
      ctrl.userData.restRx,
      ctrl.userData.restRz,
      OUT_MS
    );
  }
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

/* ---------- Grid mapping and keyboard controls ---------- */
function tryBuildGridMapping() {
  if (keyControllers.length !== 24) {
    // Skip mapping if not the expected layout
    return;
  }
  // Get world positions
  const items = keyControllers.map((ctrl) => ({
    ctrl,
    pos: ctrl.getWorldPosition(new THREE.Vector3()),
  }));
  // Sort by Z (back to front) then chunk into 4 rows of 6
  items.sort((a, b) => a.pos.z - b.pos.z);
  const rows = [
    items.slice(0, 6),
    items.slice(6, 12),
    items.slice(12, 18),
    items.slice(18, 24),
  ];
  // Sort each row by X (left to right) and extract controllers
  grid = rows.map((row) => row.sort((a, b) => a.pos.x - b.pos.x).map((o) => o.ctrl));

  // Create mapping: columns 0..5 => [Digit1..6, KeyQ..Y, KeyA..H, KeyZ..N]
  const colCodes = [
    ["Digit1", "KeyQ", "KeyA", "KeyZ"],
    ["Digit2", "KeyW", "KeyS", "KeyX"],
    ["Digit3", "KeyE", "KeyD", "KeyC"],
    ["Digit4", "KeyR", "KeyF", "KeyV"],
    ["Digit5", "KeyT", "KeyG", "KeyB"],
    ["Digit6", "KeyY", "KeyH", "KeyN"],
  ];
  const colKeys = [
    ["1", "q", "a", "z"],
    ["2", "w", "s", "x"],
    ["3", "e", "d", "c"],
    ["4", "r", "f", "v"],
    ["5", "t", "g", "b"],
    ["6", "y", "h", "n"],
  ];

  for (let col = 0; col < 6; col++) {
    for (let row = 0; row < 4; row++) {
      const ctrl = grid[row][col];
      const code = colCodes[col][row];
      const key = colKeys[col][row];
      keyMapByCode[code] = ctrl;
      keyMapByKey[key] = ctrl;
    }
  }

  // Register key listeners once when mapping becomes available
  if (!tryBuildGridMapping._listenersAdded) {
    document.addEventListener("keydown", onPhysicalKeyDown);
    document.addEventListener("keyup", onPhysicalKeyUp);
    tryBuildGridMapping._listenersAdded = true;
  }
}

const held = new Set();
function onPhysicalKeyDown(e) {
  const t = e.target;
  if (
    t &&
    (t.tagName === "INPUT" ||
      t.tagName === "TEXTAREA" ||
      t.isContentEditable)
  )
    return;
  // Avoid auto-repeat
  if (e.repeat) return;
  const ctrl = keyMapByCode[e.code] || keyMapByKey[(e.key || "").toLowerCase()];
  if (!ctrl) return;
  held.add(e.code || e.key);
  engagePress(ctrl);
}

function onPhysicalKeyUp(e) {
  const t = e.target;
  if (
    t &&
    (t.tagName === "INPUT" ||
      t.tagName === "TEXTAREA" ||
      t.isContentEditable)
  )
    return;
  const lookup = e.code || e.key;
  if (!held.has(lookup)) return;
  held.delete(lookup);
  const ctrl = keyMapByCode[e.code] || keyMapByKey[(e.key || "").toLowerCase()];
  if (!ctrl) return;
  releasePress(ctrl);
}
