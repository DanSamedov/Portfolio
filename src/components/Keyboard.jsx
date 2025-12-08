import { Suspense, useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
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

// Component that runs inside Canvas to project 3D key positions to screen coordinates
const KeyOverlaysUpdater = ({ keys, groupRef, onUpdateRects }) => {
  const { camera, gl, size } = useThree();
  const tempBox = useMemo(() => new THREE.Box3(), []);
  const tempVec = useMemo(() => new THREE.Vector3(), []);
  const frameCount = useRef(0);

  useFrame(() => {
    // Only update every 3 frames for performance
    frameCount.current++;
    if (frameCount.current % 3 !== 0) return;
    
    if (!groupRef.current || keys.length === 0) return;

    const rects = {};
    const canvas = gl.domElement;
    const canvasRect = canvas.getBoundingClientRect();

    keys.forEach((keyNode) => {
      // Get bounding box in world space
      tempBox.setFromObject(keyNode);
      
      if (tempBox.isEmpty()) return;

      // Get the 8 corners of the bounding box
      const corners = [
        new THREE.Vector3(tempBox.min.x, tempBox.min.y, tempBox.min.z),
        new THREE.Vector3(tempBox.min.x, tempBox.min.y, tempBox.max.z),
        new THREE.Vector3(tempBox.min.x, tempBox.max.y, tempBox.min.z),
        new THREE.Vector3(tempBox.min.x, tempBox.max.y, tempBox.max.z),
        new THREE.Vector3(tempBox.max.x, tempBox.min.y, tempBox.min.z),
        new THREE.Vector3(tempBox.max.x, tempBox.min.y, tempBox.max.z),
        new THREE.Vector3(tempBox.max.x, tempBox.max.y, tempBox.min.z),
        new THREE.Vector3(tempBox.max.x, tempBox.max.y, tempBox.max.z),
      ];

      // Project all corners to screen space and find bounds
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

      corners.forEach((corner) => {
        tempVec.copy(corner);
        tempVec.project(camera);

        // Convert from NDC (-1 to 1) to canvas-relative pixels
        const screenX = ((tempVec.x + 1) / 2) * canvasRect.width;
        const screenY = ((1 - tempVec.y) / 2) * canvasRect.height;

        minX = Math.min(minX, screenX);
        maxX = Math.max(maxX, screenX);
        minY = Math.min(minY, screenY);
        maxY = Math.max(maxY, screenY);
      });

      // Add some padding for better targeting
      const padding = -32;
      rects[keyNode.name] = {
        left: minX - padding,
        top: minY - padding,
        width: maxX - minX + padding * 2,
        height: maxY - minY + padding * 2,
      };
    });

    onUpdateRects(rects);
  });

  return null;
};

const Keyboard = ({ onSkillChange }) => {
  const { nodes } = useGLTF(MODEL_URL);

  const [activeSkill, setActiveSkill] = useState("Skills");

  const [pressedKeys, setPressedKeys] = useState(new Set());
  const [hoveredKey, setHoveredKey] = useState(null);
  const [keyScreenRects, setKeyScreenRects] = useState({});
  const containerRef = useRef();
  const groupRef = useRef();

  const handleUpdateRects = useCallback((rects) => {
    setKeyScreenRects(rects);
  }, []);

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
          <KeyOverlaysUpdater
            keys={keys}
            groupRef={groupRef}
            onUpdateRects={handleUpdateRects}
          />
          <Center>
            <group ref={groupRef} rotation={[Math.PI + 1, Math.PI * 2, Math.PI]} scale={0.5}>
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
      
      {/* DOM overlays for cursor targeting */}
      {Object.entries(keyScreenRects).map(([keyName, rect]) => {
        const skillLabel = computeSkillLabel(keyName);
        return (
          <div
            key={keyName}
            className="cursor-target"
            style={{
              position: 'absolute',
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height,
              pointerEvents: 'auto',
            }}
            onMouseEnter={() => {
              setHoveredKey(skillLabel);
              setActiveSkill(skillLabel);
            }}
            onMouseLeave={() => {
              setHoveredKey(null);
              if (pressedKeys.size === 0) {
                setActiveSkill("Skills");
              }
            }}
          />
        );
      })}
    </div>
  );
};

export default Keyboard;
