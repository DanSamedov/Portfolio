import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, useAnimations } from "@react-three/drei";

function Model(props) {
  const { scene, animations } = useGLTF(
    "./src/assets/models/avatar_and_keyboard.glb"
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
      action.reset().play();
      const startAt = Math.min(
        Math.max(0.01, action.getClip().duration * 0.25),
        action.getClip().duration - 0.01
      );
      action.time = startAt;
    }
  }, [actions, names]);

  return <primitive ref={ref} object={scene} {...props} />;
}

const Avatar = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 35 }}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
      }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 8, 6]} intensity={1.3} />
      <directionalLight position={[-6, 7, -5]} intensity={1.0} />
      <Suspense fallback={null}>
        <Model scale={1.1} rotation-y={Math.PI / -3} rotation-x={0.5} />
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

useGLTF.preload("./src/assets/models/avatar_and_keyboard.glb");

export default Avatar;
