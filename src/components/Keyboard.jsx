import React, { Suspense, useState, useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { a, useSpring } from "@react-spring/three";

const MODEL_URL = "./src/assets/models/keyboard.glb";
useGLTF.preload(MODEL_URL);

const PRESS_FRACTION = 0.5;
const TILT_X = 0.06;
const TILT_Z = -0.03;

const LABEL_OVERRIDES = {
  js: "JavaScript",
  javascript: "JavaScript",
  html5: "HTML5",
  css3: "CSS3",
  scikitlearn: "Scikit-learn",
  postgresql: "PostgreSQL",
  mysql: "MySQL",
  sqlalchemy: "SQLAlchemy",
  numpy: "NumPy",
  pandas: "Pandas",
  matplotlib: "Matplotlib",
  tailwindcss: "Tailwind CSS",
  fastapi: "FastAPI",
  websocket: "WebSocket",
  docker: "Docker",
  redis: "Redis",
  telegram: "Telegram",
  linux: "Linux",
  git: "Git",
  pytest: "Pytest",
  selenium: "Selenium",
  django: "Django",
  c: "C",
};

function computeSkillLabel(name) {
  const raw = (name || "").toString();
  let slug = raw.replace(/^key[ _-]?/i, "").toLowerCase();
  slug = slug.replace(/[^a-z0-9]+/g, " ").trim();
  const compact = slug.replace(/\s+/g, "");
  if (LABEL_OVERRIDES[slug]) return LABEL_OVERRIDES[slug];
  if (LABEL_OVERRIDES[compact]) return LABEL_OVERRIDES[compact];
  return (
    slug
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0]?.toUpperCase() + w.slice(1))
      .join(" ") || "—"
  );
}

const Key = ({ node, onHover, onLeave, isPressed }) => {
  const skillLabel = useMemo(() => computeSkillLabel(node.name), [node.name]);
  const keyHeight = 0.5;

  const { position, rotation } = useSpring({
    position: isPressed
      ? [
          node.position.x,
          node.position.y - keyHeight * PRESS_FRACTION,
          node.position.z,
        ]
      : [node.position.x, node.position.y, node.position.z],
    rotation: isPressed
      ? [node.rotation.x + TILT_X, node.rotation.y, node.rotation.z + TILT_Z]
      : [node.rotation.x, node.rotation.y, node.rotation.z],
    config: { mass: 1, tension: 300, friction: 20 },
  });

  return (
    <a.primitive
      object={node}
      onPointerEnter={(e) => {
        e.stopPropagation();
        onHover(skillLabel);
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        onLeave();
      }}
      position={position}
      rotation={rotation}
    />
  );
};

const Keyboard = () => {
  const { nodes } = useGLTF(MODEL_URL);
  const [activeSkill, setActiveSkill] = useState("My Skills");
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const containerRef = useRef();

  const keys = useMemo(() => {
    return Object.values(nodes).filter((node) => node.name.startsWith("key_"));
  }, [nodes]);

  const keyMap = useMemo(() => {
    if (keys.length !== 24) return {};

    const items = keys.map((ctrl) => ({ ctrl, pos: ctrl.position.clone() }));
    items.sort((a, b) => a.pos.z - b.pos.z);
    const rows = [
      items.slice(0, 6),
      items.slice(6, 12),
      items.slice(12, 18),
      items.slice(18, 24),
    ];
    const grid = rows.map((row) =>
      row.sort((a, b) => a.pos.x - b.pos.x).map((o) => o.ctrl)
    );

    const keyMapByCode = {};
    const colCodes = [
      ["Digit1", "KeyQ", "KeyA", "KeyZ"],
      ["Digit2", "KeyW", "KeyS", "KeyX"],
      ["Digit3", "KeyE", "KeyD", "KeyC"],
      ["Digit4", "KeyR", "KeyF", "KeyV"],
      ["Digit5", "KeyT", "KeyG", "KeyB"],
      ["Digit6", "KeyY", "KeyH", "KeyN"],
    ];

    for (let col = 0; col < 6; col++) {
      for (let row = 0; row < 4; row++) {
        const ctrl = grid[row][col];
        const code = colCodes[col][row];
        keyMapByCode[code] = ctrl.name;
      }
    }
    return keyMapByCode;
  }, [keys]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return;
      const keyName = keyMap[e.code];
      if (keyName) {
        setPressedKeys((prev) => new Set(prev).add(keyName));
        setActiveSkill(computeSkillLabel(keyName));
      }
    };

    const handleKeyUp = (e) => {
      const keyName = keyMap[e.code];
      if (keyName) {
        setPressedKeys((prev) => {
          const next = new Set(prev);
          next.delete(keyName);
          return next;
        });
        setActiveSkill("My Skills");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [keyMap]);

  return (
    <div ref={containerRef} className="relative w-full h-full touch-none">
      <div
        id="skill-banner"
        className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-background/50 backdrop-blur-sm text-foreground font-semibold px-4 py-2 rounded-lg shadow-lg text-center pointer-events-none"
      >
        {activeSkill}
      </div>
      <Canvas
        camera={{ position: [0, 4, 9], fov: 45, near: 0.1, far: 100 }}
        dpr={Math.min(devicePixelRatio, 2)}
        gl={{
          antialias: true,
          alpha: true,
          outputColorSpace: THREE.SRGBColorSpace,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        onCreated={({ scene }) => {
          scene.rotation.y = Math.PI;
          scene.rotation.x = 0.25;
          scene.scale.setScalar(0.01);
        }}
      >
        <hemisphereLight intensity={0.95} groundColor={0xe9edf5} />
        <directionalLight position={[5, 8, 6]} intensity={1.35} />
        <directionalLight
          position={[-6, 7, -5]}
          intensity={1.1}
          color={0x5bc0ff}
        />
        <ambientLight intensity={0.15} />
        <Suspense fallback={null}>
          <group>
            {keys.map((keyNode) => (
              <Key
                key={keyNode.name}
                node={keyNode}
                onHover={setActiveSkill}
                onLeave={() => {
                  if (pressedKeys.size === 0) setActiveSkill("My Skills");
                }}
                isPressed={pressedKeys.has(keyNode.name)}
              />
            ))}
            {Object.values(nodes).map((node) => {
              if (node.name.startsWith("key_") || !node.isMesh) return null;
              return <primitive key={node.uuid} object={node} />;
            })}
          </group>
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Keyboard;
