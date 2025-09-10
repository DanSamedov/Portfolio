import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const URL = "./src/assets/models/avatar_and_keyboard.glb";
const canvas = document.getElementById("avatar3d");

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 2, 0.1, 100);

scene.add(new THREE.HemisphereLight(0xffffff, 0x0b0d0f, 0.9));
const key = new THREE.DirectionalLight(0xffffff, 1.3);
key.position.set(5, 8, 6);
scene.add(key);
const rim = new THREE.DirectionalLight(0xffffff, 1.0);
rim.position.set(-6, 7, -5);
scene.add(rim);
scene.add(new THREE.AmbientLight(0xffffff, 0.15));

const loader = new GLTFLoader();
let mixer;

loader.load(
  URL,
  (gltf) => {
    const root = gltf.scene;
    root.scale.setScalar(0.03); // tweak overall size here if needed
    root.rotation.y = Math.PI / -2.5; // face your layout
    scene.add(root);

    // play a valid animation (pick longest non-zero duration clip)
    const clips = gltf.animations || [];
    if (clips.length) {
      const preferred = clips.find(
        (c) => /typing|type|idle/i.test(c.name) && c.duration > 0
      );
      let clip =
        preferred ||
        clips.reduce(
          (best, c) =>
            !best || (c.duration || 0) > (best.duration || 0) ? c : best,
          null
        );
      if (clip && clip.duration > 0) {
        // Normalize start time so first keyframe is at t=0 to avoid initial hold
        clip = normalizeClipStart(clip);
        mixer = new THREE.AnimationMixer(root);
        const action = mixer.clipAction(clip);
        action.reset();
        action.enabled = true;
        action.clampWhenFinished = false;
        // Use ping-pong to avoid any end-frame seam
        action.setLoop(THREE.LoopPingPong, Infinity);
        // action.setEffectiveTimeScale(1.0); // tweak speed if desired
        action.play();
        // Start a bit into the clip to avoid any initial holds
        const startAt = Math.min(
          Math.max(0.01, clip.duration * 0.25),
          clip.duration - 0.01
        );
        action.time = startAt;
        // Pre-warm the mixer once so the first visible frame is animated
        mixer.update(1 / 120);
      } else {
        console.warn("[avatar] No playable animations (zero duration)");
      }
    }

    // frame avatar a bit larger to better fill the circle
    frameObject(camera, root, new THREE.Vector3(0, 0.2, 1.5), 2);
  },
  undefined,
  (err) => console.error("[hero] load error:", err)
);

function frameObject(cam, obj, dir = new THREE.Vector3(0, 1, 1), fill = 0.9) {
  obj.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const vFov = THREE.MathUtils.degToRad(cam.fov);
  let dist = (maxDim / 2 / Math.tan(vFov / 2)) * fill;
  const d = dir.clone().normalize().multiplyScalar(dist);

  cam.position.copy(center.clone().add(d));
  cam.near = Math.max(0.01, dist / 100);
  cam.far = Math.max(cam.near + 1, dist * 100);
  cam.updateProjectionMatrix();
  cam.lookAt(center);
}

const clock = new THREE.Clock();
/** Shift all tracks so the earliest key starts at 0s */
function normalizeClipStart(srcClip) {
  const clip = srcClip.clone();
  let t0 = Infinity;
  for (const tr of clip.tracks) {
    if (tr.times && tr.times.length) t0 = Math.min(t0, tr.times[0]);
  }
  if (t0 !== Infinity && t0 > 0) {
    for (const tr of clip.tracks) {
      for (let i = 0; i < tr.times.length; i++) tr.times[i] -= t0;
    }
    clip.resetDuration();
  }
  return clip;
}
function render() {
  const w = canvas.clientWidth,
    h = canvas.clientHeight;
  // Avoid invalid aspect (e.g., if canvas is temporarily 0x0)
  if (!w || !h) {
    requestAnimationFrame(render);
    return;
  }
  if (canvas.width !== w || canvas.height !== h) {
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  if (mixer) {
    const dt = Math.min(clock.getDelta(), 1 / 30); // clamp to prevent large jumps
    mixer.update(dt);
  }
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();
