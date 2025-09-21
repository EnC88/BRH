'use client';
import { Canvas } from '@react-three/fiber';
import { Suspense, useRef } from 'react';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

function TeddyBear() {
  const { scene } = useGLTF('/teddy_bear/scene.gltf');
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = Math.sin(state.clock.elapsedTime) * 0.05; // gentle floating
    }
  });

  return <primitive ref={ref} object={scene} scale={0.65} position={[0, 0, 0]} />;
}

export default function Background3D() {
  return (
    <Canvas
      style={{ 
        position: 'fixed', 
        bottom: '80px', 
        left: '2rem', 
        width: '12rem', 
        height: '12rem', 
        zIndex: 20, 
        pointerEvents: 'auto' 
      }}
      camera={{ position: [0, 0, 3], fov: 50 }}
      shadows
    >
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={0.8} 
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <Suspense fallback={null}>
        <Environment preset="sunset" />
        <TeddyBear />
      </Suspense>
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        enableRotate={true}
        autoRotate={false}
        dampingFactor={0.1}
        enableDamping={true}
      />
    </Canvas>
  );
}
