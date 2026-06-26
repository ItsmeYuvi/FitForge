'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Procedural Particle Cloud (Floating metrics)
function ParticleField({ count = 250 }) {
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
      // Float particles upward
      const positionsArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        positionsArray[i * 3 + 1] += 0.005; // Move up along Y axis
        if (positionsArray[i * 3 + 1] > 5) {
          positionsArray[i * 3 + 1] = -5; // Reset back to bottom
        }
        // Add a slight sine wave wobble to X axis
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
        opacity={0.6}
      />
    </Points>
  );
}

// Inner glowing skeletal framework representing the Holographic Athlete
function HolographicHumanoid({ activeMetric = '' }) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  
  // Track mouse coordinates
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Joints schema
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

  // Bones (connections between joints)
  const bones = [
    { start: 'head', end: 'neck' },
    { start: 'neck', end: 'chest' },
    { start: 'chest', end: 'pelvis' },
    // Upper body left
    { start: 'chest', end: 'l-shoulder' },
    { start: 'l-shoulder', end: 'l-elbow' },
    { start: 'l-elbow', end: 'l-wrist' },
    // Upper body right
    { start: 'chest', end: 'r-shoulder' },
    { start: 'r-shoulder', end: 'r-elbow' },
    { start: 'r-elbow', end: 'r-wrist' },
    // Lower body left
    { start: 'pelvis', end: 'l-hip' },
    { start: 'l-hip', end: 'l-knee' },
    { start: 'l-knee', end: 'l-ankle' },
    // Lower body right
    { start: 'pelvis', end: 'r-hip' },
    { start: 'r-hip', end: 'r-knee' },
    { start: 'r-knee', end: 'r-ankle' },
  ];

  useFrame((state) => {
    if (groupRef.current) {
      // Rotation and slight tilt following mouse
      const targetRotationY = state.clock.elapsedTime * 0.25 + mouse.x * 0.4;
      const targetRotationX = mouse.y * 0.15;
      
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, 0.08);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, 0.08);

      // Scroll dependent vertical animation
      const scrollY = window.scrollY;
      const targetY = -scrollY * 0.0015;
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.05);
    }

    if (ringRef.current) {
      // Scanning ring rotates and goes up/down
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

      {/* 2. Skeletal Connective Lines */}
      {bones.map((bone, i) => {
        const startJoint = joints.find((j) => j.name === bone.start)!;
        const endJoint = joints.find((j) => j.name === bone.end)!;

        // Form line segments using cylinders for 3D thickness
        const direction = new THREE.Vector3().subVectors(endJoint.pos, startJoint.pos);
        const length = direction.length();
        const midpoint = new THREE.Vector3().addVectors(startJoint.pos, endJoint.pos).multiplyScalar(0.5);
        
        // Quaternion logic to rotate cylinder between two points
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

      {/* 3. Outer Scanning Level Ring */}
      <mesh ref={ringRef} position={[0, 0, 0]}>
        <torusGeometry args={[1.3, 0.03, 8, 48]} />
        <meshBasicMaterial
          color="#39ff14"
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* 4. Core glowing node */}
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

// Infinite grid floor mapping
function GridFloor() {
  const gridRef = useRef<THREE.GridHelper>(null);

  useFrame((state) => {
    if (gridRef.current) {
      // Scroll moves grid perspective
      const scrollY = window.scrollY;
      gridRef.current.position.z = (scrollY * 0.002) % 4; // Repeating texture offset effect
    }
  });

  return (
    <gridHelper
      ref={gridRef}
      args={[40, 40, '#00f0ff', '#0a0a0c']}
      position={[0, -2.5, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

interface SceneProps {
  activeMetric?: string;
}

export default function AthleteScene({ activeMetric = '' }: SceneProps) {
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
        
        <HolographicHumanoid activeMetric={activeMetric} />
        <ParticleField count={200} />
        <GridFloor />
      </Canvas>
    </div>
  );
}
