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

/* ------- press/hover config ------- */
const PRESS_FRACTION = 0.5; // press 50% of key height
const TILT_X = 0.06,
  TILT_Z = -0.03;
const IN_MS = 110,
  OUT_MS = 160;
const HOVER_EMISSIVE = 0.18;
/* ---------------------------------- */

const MODEL_URL = "./src/assets/models/keyboard2.glb";
const loader = new GLTFLoader();

/** Data containers **/
const keyControllers = []; // objects we animate (groups or meshes named key_*)
const rayTargets = []; // meshes we raycast against
const hitToControl = new Map(); // mesh -> controller mapping
let hovered = null;

/* ---------- load & collect ---------- */
loader.load(MODEL_URL, (g) => {
  const root = g.scene;
  root.scale.setScalar(0.01);
  root.rotation.y = Math.PI;
  root.rotation.x = 0.25;
  scene.add(root);

  collectKeys(root);

  // Fallback if nothing matched: treat top-level meshes (except "body") as keys
  if (keyControllers.length === 0) {
    root.children.forEach((o) => {
      if (o.isMesh && o.name !== "body") registerKey(o, o);
    });
  }

  // Precompute pose/press targets
  for (const ctrl of keyControllers) {
    const boxW = new THREE.Box3().setFromObject(ctrl); // world bbox for full key
    const sizeW = boxW.getSize(new THREE.Vector3());
    const parentScale = ctrl.parent.getWorldScale(new THREE.Vector3());
    const heightLocal = sizeW.y / parentScale.y; // convert to ctrl's local

    ctrl.userData.restY = ctrl.position.y;
    ctrl.userData.restRx = ctrl.rotation.x;
    ctrl.userData.restRz = ctrl.rotation.z;
    ctrl.userData.pressY = ctrl.userData.restY - heightLocal * PRESS_FRACTION;
    ctrl.userData.pressRx = ctrl.userData.restRx + TILT_X;
    ctrl.userData.pressRz = ctrl.userData.restRz + TILT_Z;
    ctrl.userData.animToken = null;

    // stabilize transparent sub-mats (if a joined decal exists on the same mesh)
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

  frameFromDirection(camera, root, new THREE.Vector3(-0.8, 0.75, 0.8), 1.22);
  render();
});

/** Find all objects named key_* (mesh OR group), and pick a mesh under each for raycasting */
function collectKeys(root) {
  // 1) grab any node whose name starts with key_
  const keyNodes = [];
  root.traverse((o) => {
    if (!o.name) return;
    if (o.name.startsWith("key_")) keyNodes.push(o);
  });

  for (const node of keyNodes) {
    // controller is the named node itself
    const ctrl = node;
    // find a mesh to raycast—prefer the ctrl if it's already a mesh
    let targetMesh = node.isMesh ? node : null;
    if (!targetMesh) {
      targetMesh = node.getObjectByProperty("isMesh", true); // first descendant mesh
      if (!targetMesh) continue; // skip if no geometry under this node
    }
    registerKey(ctrl, targetMesh);
  }
}

function registerKey(controller, targetMesh) {
  keyControllers.push(controller);
  rayTargets.push(targetMesh);
  hitToControl.set(targetMesh, controller);
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
    if (hovered) {
      highlight(hovered, false);
      animateKey(
        hovered,
        hovered.userData.restY,
        hovered.userData.restRx,
        hovered.userData.restRz,
        OUT_MS
      );
    }
    if (next) {
      highlight(next, true);
      animateKey(
        next,
        next.userData.pressY,
        next.userData.pressRx,
        next.userData.pressRz,
        IN_MS
      );
    }
    hovered = next;
    canvas.style.cursor = hovered ? "pointer" : "default";
  }
});

canvas.addEventListener("pointerleave", () => {
  if (hovered) {
    highlight(hovered, false);
    animateKey(
      hovered,
      hovered.userData.restY,
      hovered.userData.restRx,
      hovered.userData.restRz,
      OUT_MS
    );
    hovered = null;
    canvas.style.cursor = "default";
  }
});

function resolveController(hitObj) {
  // climb from the hit mesh to the controller we registered
  let n = hitObj;
  while (n) {
    if (keyControllers.includes(n)) return n;
    // if the exact mesh was registered as a rayTarget, map it to its controller
    if (hitToControl.has(n)) return hitToControl.get(n);
    n = n.parent;
  }
  return null;
}

/* ---------------------- Helpers & anim ------------------------- */

function highlight(object3D, on) {
  object3D.traverse((n) => {
    if (!n.isMesh) return;
    const mats = Array.isArray(n.material) ? n.material : [n.material];
    for (const m of mats) {
      if (!m || !("emissive" in m)) continue;
      if (on) {
        if (!m.userData._e) {
          m.userData._e = m.emissive.clone();
          m.userData._i = m.emissiveIntensity ?? 1;
        }
        m.emissive.set(0xffffff);
        m.emissiveIntensity = HOVER_EMISSIVE;
      } else if (m.userData._e) {
        m.emissive.copy(m.userData._e);
        m.emissiveIntensity = m.userData._i ?? 1;
      } else {
        m.emissive.set(0x000000);
        m.emissiveIntensity = 1;
      }
    }
  });
}

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
