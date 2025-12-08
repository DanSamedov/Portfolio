import { Suspense, useState, useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Center } from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "./src/assets/models/keyboard.glb";
useGLTF.preload(MODEL_URL);
const PRESS_FRACTION = 5;

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
  const restPosition = useMemo(() => node.position.clone(), [node.position]);
  const pressedPosition = useMemo(
    () =>
      new THREE.Vector3(
        node.position.x,
        node.position.y - keyHeight * PRESS_FRACTION,
        node.position.z
      ),
    [node.position, keyHeight]
  );

  useFrame(() => {
    const targetPosition = isPressed ? pressedPosition : restPosition;
    const animationSpeed = isPressed ? 0.2 : 0.2;
    node.position.lerp(targetPosition, animationSpeed);
  });

  return (
    <primitive
      object={node}
      onPointerEnter={(e) => {
        e.stopPropagation();
        onHover(skillLabel);
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        onLeave(skillLabel);
      }}
    />
  );
};

const Keyboard = ({ onSkillChange }) => {
  const { nodes } = useGLTF(MODEL_URL);

  const [activeSkill, setActiveSkill] = useState("Skills");

  const [pressedKeys, setPressedKeys] = useState(new Set());
  const [hoveredKey, setHoveredKey] = useState(null);
  const containerRef = useRef();

  useEffect(() => {
    if (onSkillChange) {
      onSkillChange(activeSkill);
    }
  }, [activeSkill, onSkillChange]);

  const keys = useMemo(() => {
    return Object.values(nodes).filter((node) => node.name.startsWith("key_"));
  }, [nodes]);

  const keyboardBody = useMemo(
    () => Object.values(nodes).find((node) => node.name === "body"),
    [nodes]
  );

  const keyMap = useMemo(() => {
    if (keys.length !== 24) return {};
    const items = keys.map((ctrl) => ({ ctrl, pos: ctrl.position.clone() }));
    items.sort((a, b) => b.pos.z - a.pos.z);
    const rows = [
      items.slice(0, 6),
      items.slice(6, 12),
      items.slice(12, 18),
      items.slice(18, 24),
    ];
    const grid = rows.map((row) =>
      row.sort((a, b) => b.pos.x - a.pos.x).map((o) => o.ctrl)
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
          if (next.size === 0 && !hoveredKey) {
            setActiveSkill("Skills");
          }
          return next;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [keyMap, hoveredKey]);

  return (
    <div ref={containerRef} className="relative w-full h-full touch-none">
      <Canvas
        camera={{ position: [0, 0, 50], fov: 45, near: 0.1, far: 100 }}
        dpr={Math.min(devicePixelRatio, 2)}
        gl={{
          antialias: true,
          alpha: true,
          outputColorSpace: THREE.SRGBColorSpace,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
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
          <Center>
            <group rotation={[Math.PI + 1, Math.PI * 2, Math.PI]} scale={0.5}>
              {keyboardBody && <primitive object={keyboardBody} />}
              {keys.map((keyNode) => (
                <Key
                  key={keyNode.name}
                  node={keyNode}
                  onHover={(label) => {
                    setHoveredKey(label);
                    setActiveSkill(label);
                  }}
                  onLeave={() => {
                    setHoveredKey(null);
                    if (pressedKeys.size === 0) {
                      setActiveSkill("Skills");
                    }
                  }}
                  isPressed={
                    pressedKeys.has(keyNode.name) ||
                    hoveredKey === computeSkillLabel(keyNode.name)
                  }
                />
              ))}
            </group>
          </Center>
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Keyboard;
