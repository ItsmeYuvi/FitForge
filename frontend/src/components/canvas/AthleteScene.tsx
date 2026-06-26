'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Procedural Particle Cloud (Floating metrics)
function ParticleField({ count = 200, scrollProgress = 0 }) {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Create random particle coordinates
  const [positions] = useState(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 8;     // X
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10;  // Y
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8;   // Z
    }
    return arr;
  });

  useFrame((state) => {
    if (pointsRef.current) {
      // Speed up particles if scrolled deep (combustion effect)
      const speedMultiplier = 1.0 + scrollProgress * 3.0;
      
      const positionsArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        positionsArray[i * 3 + 1] += 0.005 * speedMultiplier; // Move up along Y axis
        if (positionsArray[i * 3 + 1] > 5) {
          positionsArray[i * 3 + 1] = -5; // Reset back to bottom
        }
        positionsArray[i * 3] += Math.sin(state.clock.elapsedTime + i) * 0.002;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.rotation.y += 0.001;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#39ff14"
        size={0.06}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.5}
      />
    </Points>
  );
}

// Interactive mannequin reacting to mouse movements and snapping checkpoints
interface HumanoidProps {
  scrollProgress: number;
  activeMetric: string;
}

function HolographicHumanoid({ scrollProgress, activeMetric }: HumanoidProps) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Scale down movement offsets slightly to ensure smooth tracking
      setMouse({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Joint Nodes
  const joints = [
    { name: 'head', pos: new THREE.Vector3(0, 1.4, 0), size: 0.22 },
    { name: 'neck', pos: new THREE.Vector3(0, 1.05, 0), size: 0.08 },
    { name: 'chest', pos: new THREE.Vector3(0, 0.7, 0), size: 0.15 },
    { name: 'pelvis', pos: new THREE.Vector3(0, -0.2, 0), size: 0.16 },
    // Left side
    { name: 'l-shoulder', pos: new THREE.Vector3(-0.55, 0.75, 0), size: 0.1 },
    { name: 'l-elbow', pos: new THREE.Vector3(-0.85, 0.25, 0), size: 0.08 },
    { name: 'l-wrist', pos: new THREE.Vector3(-1.05, -0.25, 0), size: 0.07 },
    { name: 'l-hip', pos: new THREE.Vector3(-0.25, -0.25, 0), size: 0.1 },
    { name: 'l-knee', pos: new THREE.Vector3(-0.3, -0.9, 0), size: 0.09 },
    { name: 'l-ankle', pos: new THREE.Vector3(-0.35, -1.5, 0), size: 0.08 },
    // Right side
    { name: 'r-shoulder', pos: new THREE.Vector3(0.55, 0.75, 0), size: 0.1 },
    { name: 'r-elbow', pos: new THREE.Vector3(0.85, 0.25, 0), size: 0.08 },
    { name: 'r-wrist', pos: new THREE.Vector3(1.05, -0.25, 0), size: 0.07 },
    { name: 'r-hip', pos: new THREE.Vector3(0.25, -0.25, 0), size: 0.1 },
    { name: 'r-knee', pos: new THREE.Vector3(0.3, -0.9, 0), size: 0.09 },
    { name: 'r-ankle', pos: new THREE.Vector3(0.35, -1.5, 0), size: 0.08 },
  ];

  // Bones (connection segments)
  const bones = [
    { start: 'head', end: 'neck' },
    { start: 'neck', end: 'chest' },
    { start: 'chest', end: 'pelvis' },
    // Left body
    { start: 'chest', end: 'l-shoulder' },
    { start: 'l-shoulder', end: 'l-elbow' },
    { start: 'l-elbow', end: 'l-wrist' },
    // Right body
    { start: 'chest', end: 'r-shoulder' },
    { start: 'r-shoulder', end: 'r-elbow' },
    { start: 'r-elbow', end: 'r-wrist' },
    // Left legs
    { start: 'pelvis', end: 'l-hip' },
    { start: 'l-hip', end: 'l-knee' },
    { start: 'l-knee', end: 'l-ankle' },
    // Right legs
    { start: 'pelvis', end: 'r-hip' },
    { start: 'r-hip', end: 'r-knee' },
    { start: 'r-knee', end: 'r-ankle' },
  ];

  useFrame((state) => {
    // 1. Calculate target positions based on scrollProgress checkpoints
    const targetMannequinPos = new THREE.Vector3(0, 0, 0);
    const targetCameraPos = new THREE.Vector3(0, 0.5, 4.2);
    const targetCameraLookAt = new THREE.Vector3(0, 0.5, 0);

    // Disable camera movement on small screens to maintain layout text readability
    const isMobile = window.innerWidth < 768;

    if (!isMobile) {
      if (scrollProgress <= 0.25) {
        // Interpolate Hero -> Body Scan (Athlete moves right, camera zooms core)
        const p = scrollProgress / 0.25;
        targetMannequinPos.lerpVectors(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.7, 0, 0), p);
        targetCameraPos.lerpVectors(new THREE.Vector3(0, 0.5, 4.2), new THREE.Vector3(0.8, 0.7, 2.7), p);
        targetCameraLookAt.lerpVectors(new THREE.Vector3(0, 0.5, 0), new THREE.Vector3(0.6, 0.5, 0), p);
      } else if (scrollProgress <= 0.5) {
        // Interpolate Body Scan -> Digital Twin (Athlete moves left, camera profiles side)
        const p = (scrollProgress - 0.25) / 0.25;
        targetMannequinPos.lerpVectors(new THREE.Vector3(0.7, 0, 0), new THREE.Vector3(-0.7, 0, 0), p);
        targetCameraPos.lerpVectors(new THREE.Vector3(0.8, 0.7, 2.7), new THREE.Vector3(-0.8, 0.4, 3.0), p);
        targetCameraLookAt.lerpVectors(new THREE.Vector3(0.6, 0.5, 0), new THREE.Vector3(-0.6, 0.2, 0), p);
      } else if (scrollProgress <= 0.75) {
        // Interpolate Digital Twin -> Nutrition (Athlete center-right, camera zooms out)
        const p = (scrollProgress - 0.5) / 0.25;
        targetMannequinPos.lerpVectors(new THREE.Vector3(-0.7, 0, 0), new THREE.Vector3(0.5, -0.4, 0), p);
        targetCameraPos.lerpVectors(new THREE.Vector3(-0.8, 0.4, 3.0), new THREE.Vector3(0, 0.2, 4.2), p);
        targetCameraLookAt.lerpVectors(new THREE.Vector3(-0.6, 0.2, 0), new THREE.Vector3(0.2, 0, 0), p);
      } else {
        // Interpolate Nutrition -> Final CTA (Athlete returns to center, camera zooms extreme close)
        const p = Math.min(1.0, (scrollProgress - 0.75) / 0.25);
        targetMannequinPos.lerpVectors(new THREE.Vector3(0.5, -0.4, 0), new THREE.Vector3(0, 0.1, 0), p);
        targetCameraPos.lerpVectors(new THREE.Vector3(0, 0.2, 4.2), new THREE.Vector3(0, 0.7, 2.0), p);
        targetCameraLookAt.lerpVectors(new THREE.Vector3(0.2, 0, 0), new THREE.Vector3(0, 0.7, 0), p);
      }
    }

    // 2. Smoothly LERP state coordinate changes
    if (groupRef.current) {
      groupRef.current.position.lerp(targetMannequinPos, 0.05);

      // Auto rotation + mouse interaction offset
      const targetRotY = state.clock.elapsedTime * 0.25 + mouse.x * 0.4;
      const targetRotX = mouse.y * 0.15;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.08);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.08);
    }

    // Lerp Camera coordinates
    state.camera.position.lerp(targetCameraPos, 0.05);
    state.camera.lookAt(targetCameraLookAt);

    // Scanner ring animation
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2;
      ringRef.current.rotation.z += 0.01;
      ringRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 1.8;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 1. Joint Nodes */}
      {joints.map((joint) => {
        const isHighlighted = activeMetric !== '';
        const nodeColor = isHighlighted ? '#39ff14' : '#00f0ff';
        
        return (
          <mesh key={joint.name} position={joint.pos}>
            <sphereGeometry args={[joint.size, 12, 12]} />
            <meshBasicMaterial
              color={nodeColor}
              wireframe
              transparent
              opacity={0.4}
            />
          </mesh>
        );
      })}

      {/* 2. Bones Connectors */}
      {bones.map((bone, i) => {
        const startJoint = joints.find((j) => j.name === bone.start)!;
        const endJoint = joints.find((j) => j.name === bone.end)!;

        const direction = new THREE.Vector3().subVectors(endJoint.pos, startJoint.pos);
        const length = direction.length();
        const midpoint = new THREE.Vector3().addVectors(startJoint.pos, endJoint.pos).multiplyScalar(0.5);
        
        const up = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction.clone().normalize());

        return (
          <mesh key={i} position={midpoint} quaternion={quaternion}>
            <cylinderGeometry args={[0.02, 0.02, length, 6]} />
            <meshBasicMaterial
              color="#00f0ff"
              wireframe
              transparent
              opacity={0.25}
            />
          </mesh>
        );
      })}

      {/* 3. Outer Scanning Torus Ring */}
      <mesh ref={ringRef} position={[0, 0, 0]}>
        <torusGeometry args={[1.3, 0.03, 8, 48]} />
        <meshBasicMaterial
          color="#39ff14"
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* 4. Glowing Core Node */}
      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshBasicMaterial
          color="#39ff14"
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
}

// Dynamic grid mapping floor
function GridFloor({ scrollProgress = 0 }) {
  const gridRef = useRef<THREE.GridHelper>(null);

  useFrame(() => {
    if (gridRef.current) {
      gridRef.current.position.z = (scrollProgress * 20.0) % 4; // grid repeat animation
    }
  });

  return (
    <gridHelper
      ref={gridRef}
      args={[40, 40, '#00f0ff', '#0a0a0c']}
      position={[0, -2.5, 0]}
    />
  );
}

interface SceneProps {
  scrollProgress?: number;
  activeMetric?: string;
}

export default function AthleteScene({ scrollProgress = 0, activeMetric = '' }: SceneProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-10 select-none">
      <Canvas
        camera={{ position: [0, 0.5, 4.2], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#00f0ff" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#39ff14" />
        
        <HolographicHumanoid scrollProgress={scrollProgress} activeMetric={activeMetric} />
        <ParticleField count={180} scrollProgress={scrollProgress} />
        <GridFloor scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
}
