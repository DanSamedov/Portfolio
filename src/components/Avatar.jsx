import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, useAnimations } from "@react-three/drei";

function Model(props) {
  const { scene, animations } = useGLTF(
    "./src/assets/models/avatar_and_keyboard.glb"
  );
  const { ref, actions } = useAnimations(animations, scene);

  useEffect(() => {
    actions[Object.keys(actions)[0]].play();
  }, [actions]);

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
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 6]} intensity={1.3} />
      <directionalLight position={[-6, 7, -5]} intensity={1.0} />
      <Suspense fallback={null}>
        <Model scale={0.03} rotation-y={Math.PI / -2.5} />
      </Suspense>
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  );
};

useGLTF.preload("./src/assets/models/avatar_and_keyboard.glb");

export default Avatar;
