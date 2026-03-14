import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Sphere, Torus, Cylinder, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { MotionValue } from 'framer-motion';

function Particles({ count = 1000, mouseX, mouseY }: { count?: number, mouseX?: MotionValue<number>, mouseY?: MotionValue<number> }) {
  const points = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return positions;
  }, [count]);

  useFrame((state, delta) => {
    if (points.current) {
      points.current.rotation.x -= delta / 10;
      points.current.rotation.y -= delta / 15;
      
      if (mouseX && mouseY) {
        // Subtle parallax effect based on mouse position
        points.current.position.x = THREE.MathUtils.lerp(points.current.position.x, mouseX.get() * 2, 0.05);
        points.current.position.y = THREE.MathUtils.lerp(points.current.position.y, -mouseY.get() * 2, 0.05);
      }
    }
  });

  return (
    <Points ref={points} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#00f0ff"
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.4}
      />
    </Points>
  );
}

function FloatingObjects({ mouseX, mouseY }: { mouseX?: MotionValue<number>, mouseY?: MotionValue<number> }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current && mouseX && mouseY) {
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, mouseX.get() * 1.5, 0.05);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, -mouseY.get() * 1.5, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, mouseY.get() * 0.5, 0.05);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouseX.get() * 0.5, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Coin 1 */}
      <Float speed={1.5} rotationIntensity={1.5} floatIntensity={2}>
        <Cylinder args={[0.8, 0.8, 0.1, 32]} position={[-3, 2, -2]} rotation={[Math.PI / 4, 0, 0]}>
          <meshStandardMaterial color="#00f0ff" roughness={0.1} metalness={0.8} />
        </Cylinder>
      </Float>

      {/* Coin 2 */}
      <Float speed={2} rotationIntensity={2} floatIntensity={1.5}>
        <Cylinder args={[0.5, 0.5, 0.1, 32]} position={[4, -1, -3]} rotation={[-Math.PI / 3, Math.PI / 4, 0]}>
          <meshStandardMaterial color="#10b981" roughness={0.2} metalness={0.9} />
        </Cylinder>
      </Float>

      {/* Abstract Graph/Torus */}
      <Float speed={1} rotationIntensity={1} floatIntensity={1}>
        <Torus args={[1.5, 0.05, 16, 100]} position={[2, 2, -4]} rotation={[Math.PI / 2, 0, Math.PI / 4]}>
          <meshStandardMaterial color="#00f0ff" wireframe opacity={0.3} transparent />
        </Torus>
      </Float>

      {/* Sphere/Data point */}
      <Float speed={2.5} rotationIntensity={1} floatIntensity={2}>
        <Sphere args={[0.4, 32, 32]} position={[-2, -2, -1]}>
          <meshStandardMaterial color="#10b981" roughness={0.3} metalness={0.7} wireframe />
        </Sphere>
      </Float>
    </group>
  );
}

export default function LoginBackground({ mouseX, mouseY }: { mouseX?: MotionValue<number>, mouseY?: MotionValue<number> }) {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#00f0ff" />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#10b981" />
        <Environment preset="city" />
        <Particles count={1500} mouseX={mouseX} mouseY={mouseY} />
        <FloatingObjects mouseX={mouseX} mouseY={mouseY} />
      </Canvas>
    </div>
  );
}
