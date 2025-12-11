import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, useAnimations } from "@react-three/drei";

import * as THREE from "three";

function Model(props) {
  const { scene, animations } = useGLTF(
    "/assets/models/avatar_and_keyboard.glb"
  );
  const { ref, actions, names } = useAnimations(animations, scene);

  useEffect(() => {
    const preferred = names.find(
      (n) => /typing|type|idle/i.test(n) && actions[n].getClip().duration > 0
    );
    const actionName =
      preferred ||
      names.reduce(
        (best, n) =>
          !best ||
          actions[n].getClip().duration > actions[best].getClip().duration
            ? n
            : best,
        null
      );

    if (actionName) {
      const action = actions[actionName];
      action.getClip().duration = 188 / 30;
      action.reset().play();
      action.setLoop(THREE.LoopRepeat);
    }
  }, [actions, names]);

  return <primitive ref={ref} object={scene} {...props} />;
}

const Avatar = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scale = isMobile ? 2 : isTablet ? 1 : 1.1;
  const position = isMobile ? [-0.5, -0.75, 0] : isTablet ? [-0.25, 0, 0] : [0, 0, 0];

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 35 }}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 8, 6]} intensity={1.3} />
      <directionalLight position={[-6, 7, -5]} intensity={1.0} />
      <Suspense fallback={null}>
        <Model scale={scale} rotation-y={Math.PI / -3} rotation-x={0.5} position={position} />
      </Suspense>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
        target={[-1.5, 1, -0.65]}
      />
    </Canvas>
  );
};

useGLTF.preload("/assets/models/avatar_and_keyboard.glb");

export default Avatar;
