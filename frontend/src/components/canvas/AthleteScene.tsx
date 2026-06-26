'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Procedural Particle Field (representing metabolic fuel or data stream)
function ParticleField({ count = 250, scrollProgress = 0 }) {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Create random coordinates and assign static colors
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
      // Speed up particles if scrolled deep
      const speedMultiplier = 1.0 + scrollProgress * 2.5;
      
      const positionsArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        positionsArray[i * 3 + 1] += 0.006 * speedMultiplier; // Move upwards
        if (positionsArray[i * 3 + 1] > 5) {
          positionsArray[i * 3 + 1] = -5; // Reset to bottom
        }
        positionsArray[i * 3] += Math.sin(state.clock.elapsedTime + i) * 0.002;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.rotation.y += 0.001;
    }
  });

  // Interpolate particle color based on scroll progression (green -> cyan -> white-glow)
  const getParticleColor = () => {
    if (scrollProgress < 0.4) return '#39ff14'; // Neon Green for biometrics/scan
    if (scrollProgress < 0.85) return '#00f0ff'; // Cyber Blue for workout/dashboard
    return '#ffffff'; // White for final transformation
  };

  return (
    <Points ref={pointsRef} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color={getParticleColor()}
        size={0.06}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.45}
      />
    </Points>
  );
}

// Nutrition particles flowing into the core (Section 05 effect)
function NutritionFlow({ scrollProgress = 0 }) {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 100;
  
  // Create circular paths and starting coordinates
  const [positions] = useState(() => {
    const arr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.0 + Math.random() * 2.0;
      arr[i * 3] = Math.cos(angle) * radius; // X
      arr[i * 3 + 1] = (Math.random() - 0.5) * 4.0; // Y
      arr[i * 3 + 2] = Math.sin(angle) * radius; // Z
    }
    return arr;
  });

  useFrame((state) => {
    if (pointsRef.current) {
      const positionsArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
      const active = scrollProgress >= 0.55 && scrollProgress <= 0.78;
      
      for (let i = 0; i < particleCount; i++) {
        if (active) {
          // Attract particles toward chest core position [0, 0.7, 0]
          const x = positionsArray[i * 3];
          const y = positionsArray[i * 3 + 1] - 0.7;
          const z = positionsArray[i * 3 + 2];
          
          positionsArray[i * 3] -= x * 0.04;
          positionsArray[i * 3 + 1] -= y * 0.04;
          positionsArray[i * 3 + 2] -= z * 0.04;

          // If close to core, reset back to outside bounds
          const distance = Math.sqrt(x*x + y*y + z*z);
          if (distance < 0.15) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 2.5 + Math.random() * 1.5;
            positionsArray[i * 3] = Math.cos(angle) * radius;
            positionsArray[i * 3 + 1] = 0.7 + (Math.random() - 0.5) * 2.0;
            positionsArray[i * 3 + 2] = Math.sin(angle) * radius;
          }
        } else {
          // Slow ambient floating when inactive
          positionsArray[i * 3 + 1] += Math.sin(state.clock.elapsedTime + i) * 0.001;
        }
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const isActive = scrollProgress >= 0.55 && scrollProgress <= 0.78;

  return (
    <Points ref={pointsRef} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color={isActive ? '#39ff14' : '#00f0ff'}
        size={isActive ? 0.09 : 0.03}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={isActive ? 0.8 : 0.15}
      />
    </Points>
  );
}

interface HumanoidProps {
  scrollProgress: number;
  activeMetric: string;
}

function HolographicHumanoid({ scrollProgress, activeMetric }: HumanoidProps) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const visorRef = useRef<THREE.Mesh>(null);
  const orbitRing1Ref = useRef<THREE.Mesh>(null);
  const orbitRing2Ref = useRef<THREE.Mesh>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [time, setTime] = useState(0);

  // Pre-allocated vectors to prevent GC allocations in useFrame
  const mannequinPos = useRef(new THREE.Vector3(0, 0, 0));
  const cameraPos = useRef(new THREE.Vector3(0, 0.5, 4.2));
  const cameraLookAt = useRef(new THREE.Vector3(0, 0.5, 0));
  const headRotY = useRef(0);
  const headRotX = useRef(0);

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

  // Update timer animation frame at 33 FPS when stationary at the bottom
  useEffect(() => {
    let interval: any;
    if (scrollProgress > 0.85) {
      interval = setInterval(() => {
        setTime((t) => t + 0.03);
      }, 30);
    } else {
      setTime(0);
    }
    return () => clearInterval(interval);
  }, [scrollProgress]);

  // Joints model array
  const joints = React.useMemo(() => [
    { name: 'head', pos: new THREE.Vector3(0, 1.4, 0), size: 0.14 },
    { name: 'neck', pos: new THREE.Vector3(0, 1.05, 0), size: 0.06 },
    { name: 'chest', pos: new THREE.Vector3(0, 0.7, 0), size: 0.11 },
    { name: 'pelvis', pos: new THREE.Vector3(0, -0.2, 0), size: 0.12 },
    // Left side
    { name: 'l-shoulder', pos: new THREE.Vector3(-0.45, 0.75, 0), size: 0.08 },
    { name: 'l-elbow', pos: new THREE.Vector3(-0.7, 0.25, 0.05), size: 0.06 },
    { name: 'l-wrist', pos: new THREE.Vector3(-0.85, -0.2, 0.1), size: 0.05 },
    { name: 'l-hip', pos: new THREE.Vector3(-0.2, -0.25, 0), size: 0.08 },
    { name: 'l-knee', pos: new THREE.Vector3(-0.22, -0.85, 0.05), size: 0.07 },
    { name: 'l-ankle', pos: new THREE.Vector3(-0.24, -1.45, 0.1), size: 0.06 },
    // Right side
    { name: 'r-shoulder', pos: new THREE.Vector3(0.45, 0.75, 0), size: 0.08 },
    { name: 'r-elbow', pos: new THREE.Vector3(0.7, 0.25, 0.05), size: 0.06 },
    { name: 'r-wrist', pos: new THREE.Vector3(0.85, -0.2, 0.1), size: 0.05 },
    { name: 'r-hip', pos: new THREE.Vector3(0.2, -0.25, 0), size: 0.08 },
    { name: 'r-knee', pos: new THREE.Vector3(0.22, -0.85, 0.05), size: 0.07 },
    { name: 'r-ankle', pos: new THREE.Vector3(0.24, -1.45, 0.1), size: 0.06 },
  ], []);

  // Bones mapping array
  const bones = React.useMemo(() => [
    { start: 'head', end: 'neck' },
    { start: 'neck', end: 'chest' },
    { start: 'chest', end: 'pelvis' },
    // Left arm
    { start: 'chest', end: 'l-shoulder' },
    { start: 'l-shoulder', end: 'l-elbow' },
    { start: 'l-elbow', end: 'l-wrist' },
    // Right arm
    { start: 'chest', end: 'r-shoulder' },
    { start: 'r-shoulder', end: 'r-elbow' },
    { start: 'r-elbow', end: 'r-wrist' },
    // Left leg
    { start: 'pelvis', end: 'l-hip' },
    { start: 'l-hip', end: 'l-knee' },
    { start: 'l-knee', end: 'l-ankle' },
    // Right leg
    { start: 'pelvis', end: 'r-hip' },
    { start: 'r-hip', end: 'r-knee' },
    { start: 'r-knee', end: 'r-ankle' },
  ], []);

  // Scroll triggers segment mapping
  // Hero (0.0 -> 0.15)
  // Section 02 scan (0.15 -> 0.3)
  // Section 03 workout (0.3 -> 0.45)
  // Section 04 adaptive (0.45 -> 0.6)
  // Section 05 nutrition (0.6 -> 0.75)
  // Section 06 dashboard (0.75 -> 0.9)
  // Section 07 / Final CTA transformation (0.9 -> 1.0)
  
  // Calculate transformation physical factors dynamically (Base -> Athletic -> Elite)
  // Base: 1.0, Athletic: 1.25, Elite: 1.55
  const evolutionFactor = 1.0 + (scrollProgress > 0.3 ? (scrollProgress - 0.3) * 0.75 : 0);
  const muscleRadius = 0.016 * evolutionFactor;
  const chestPlateScaleX = 1.0 + (scrollProgress > 0.3 ? (scrollProgress - 0.3) * 0.6 : 0);
  const shoulderWidthMultiplier = 1.0 + (scrollProgress > 0.3 ? (scrollProgress - 0.3) * 0.25 : 0);

  // Dynamic biomechanical joint coordinates mapping logic
  const getJointPos = (name: string, defaultPos: THREE.Vector3) => {
    const pos = defaultPos.clone();
    
    // Shift shoulders laterally based on evolution
    if (name.includes('shoulder')) {
      pos.x *= shoulderWidthMultiplier;
    } else if (name.includes('elbow') || name.includes('wrist')) {
      // Adjust limbs outward if shoulders expanded
      pos.x += (pos.x > 0 ? 1 : -1) * (shoulderWidthMultiplier - 1.0) * 0.45;
    }

    // Apply double bicep flex activity at bottom section
    if (scrollProgress > 0.85 && time > 0) {
      const curl = Math.sin(time * 2.5) * 0.5 + 0.5; // range 0 to 1
      
      const isLeft = name.startsWith('l-');
      const shX = (isLeft ? -0.45 : 0.45) * shoulderWidthMultiplier;
      const shPos = new THREE.Vector3(shX, 0.75, 0);

      // Upper arm length (Shoulder to Elbow) and Forearm length (Elbow to Wrist)
      const lenUpper = 0.561;
      const lenForearm = 0.477;

      if (name.includes('elbow')) {
        // Flexed elbow direction relative to shoulder (raised horizontally, forward and out)
        const dirEl = new THREE.Vector3(isLeft ? -0.85 : 0.85, 0.45, 0.25).normalize();
        const flexedElPos = shPos.clone().add(dirEl.multiplyScalar(lenUpper));
        pos.lerp(flexedElPos, curl);
      }
      
      if (name.includes('wrist')) {
        // Compute the flexed elbow position to chain the forearm from
        const dirEl = new THREE.Vector3(isLeft ? -0.85 : 0.85, 0.45, 0.25).normalize();
        const flexedElPos = shPos.clone().add(dirEl.multiplyScalar(lenUpper));
        
        // Flexed wrist direction relative to elbow (pointing up and in towards the head/shoulder)
        const dirWr = new THREE.Vector3(isLeft ? 0.55 : -0.55, 0.75, 0.35).normalize();
        const flexedWrPos = flexedElPos.clone().add(dirWr.multiplyScalar(lenForearm));
        pos.lerp(flexedWrPos, curl);
      }
    }
    
    return pos;
  };

  useFrame((state) => {
    const isMobile = window.innerWidth < 768;

    // 1. Core breathing & sway motions
    const breath = Math.sin(state.clock.elapsedTime * 2.0) * 0.035; // Breathing pace
    const sway = Math.sin(state.clock.elapsedTime * 0.7) * 0.04;    // Body shift sway

    // 2. Camera & Mannequin LERP coordinates
    const targetManPos = mannequinPos.current.set(0, 0, 0);
    const targetCamPos = cameraPos.current.set(0, 0.5, 4.2);
    const targetCamLookAt = cameraLookAt.current.set(0, 0.5, 0);

    if (!isMobile) {
      if (scrollProgress <= 0.15) {
        // Hero: Centered
        const p = scrollProgress / 0.15;
        targetManPos.set(0, 0, 0);
        targetCamPos.set(0, 0.5, 4.2);
        targetCamLookAt.set(0, 0.5, 0);
      } else if (scrollProgress <= 0.3) {
        // Section 02 (Body Scan): Shift Right, Camera zoom core
        const p = (scrollProgress - 0.15) / 0.15;
        targetManPos.lerpVectors(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.65, 0, 0), p);
        targetCamPos.lerpVectors(new THREE.Vector3(0, 0.5, 4.2), new THREE.Vector3(0.7, 0.7, 2.7), p);
        targetCamLookAt.lerpVectors(new THREE.Vector3(0, 0.5, 0), new THREE.Vector3(0.55, 0.5, 0), p);
      } else if (scrollProgress <= 0.45) {
        // Section 03 (Workout Gen): Shift Left, Profile camera
        const p = (scrollProgress - 0.3) / 0.15;
        targetManPos.lerpVectors(new THREE.Vector3(0.65, 0, 0), new THREE.Vector3(-0.65, 0, 0), p);
        targetCamPos.lerpVectors(new THREE.Vector3(0.7, 0.7, 2.7), new THREE.Vector3(-0.7, 0.4, 2.8), p);
        targetCamLookAt.lerpVectors(new THREE.Vector3(0.55, 0.5, 0), new THREE.Vector3(-0.55, 0.2, 0), p);
      } else if (scrollProgress <= 0.6) {
        // Section 04 (Adaptive Intel): Sway center
        const p = (scrollProgress - 0.45) / 0.15;
        targetManPos.lerpVectors(new THREE.Vector3(-0.65, 0, 0), new THREE.Vector3(0, 0, 0), p);
        targetCamPos.lerpVectors(new THREE.Vector3(-0.7, 0.4, 2.8), new THREE.Vector3(0, 0.4, 3.6), p);
        targetCamLookAt.lerpVectors(new THREE.Vector3(-0.55, 0.2, 0), new THREE.Vector3(0, 0.3, 0), p);
      } else if (scrollProgress <= 0.75) {
        // Section 05 (Nutrition): Shift Right, Camera zoom out
        const p = (scrollProgress - 0.6) / 0.15;
        targetManPos.lerpVectors(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.6, -0.3, 0), p);
        targetCamPos.lerpVectors(new THREE.Vector3(0, 0.4, 3.6), new THREE.Vector3(0.4, 0.1, 4.0), p);
        targetCamLookAt.lerpVectors(new THREE.Vector3(0, 0.3, 0), new THREE.Vector3(0.4, 0, 0), p);
      } else if (scrollProgress <= 0.9) {
        // Section 06 (Dashboard): Mid-close, Profile angles
        const p = (scrollProgress - 0.75) / 0.15;
        targetManPos.lerpVectors(new THREE.Vector3(0.6, -0.3, 0), new THREE.Vector3(-0.55, 0.1, 0), p);
        targetCamPos.lerpVectors(new THREE.Vector3(0.4, 0.1, 4.0), new THREE.Vector3(-0.55, 0.5, 3.0), p);
        targetCamLookAt.lerpVectors(new THREE.Vector3(0.4, 0, 0), new THREE.Vector3(-0.45, 0.4, 0), p);
      } else {
        // Section 07 / Final CTA (Transformation peak): Mannequin center, extreme close
        const p = Math.min(1.0, (scrollProgress - 0.9) / 0.1);
        targetManPos.lerpVectors(new THREE.Vector3(-0.55, 0.1, 0), new THREE.Vector3(0, 0.1, 0), p);
        targetCamPos.lerpVectors(new THREE.Vector3(-0.55, 0.5, 3.0), new THREE.Vector3(0, 0.75, 2.05), p);
        targetCamLookAt.lerpVectors(new THREE.Vector3(-0.45, 0.4, 0), new THREE.Vector3(0, 0.75, 0), p);
      }
    }

    if (groupRef.current) {
      // 3. Smooth translation and orientation lerping
      groupRef.current.position.lerp(targetManPos, 0.05);

      // Sway offset on rotation Y & X
      const targetRotY = state.clock.elapsedTime * 0.18 + mouse.x * 0.35 + sway * 0.5;
      const targetRotX = mouse.y * 0.12;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.08);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.08);
    }

    // Smooth camera positioning
    state.camera.position.lerp(targetCamPos, 0.05);
    state.camera.lookAt(targetCamLookAt);

    // 4. Scanner ring height sweep (Section 02 active)
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2;
      ringRef.current.rotation.z += 0.008;
      
      const inScanSection = scrollProgress >= 0.12 && scrollProgress <= 0.35;
      if (inScanSection) {
        ringRef.current.scale.set(1, 1, 1);
        // Clean sweep up and down
        ringRef.current.position.y = Math.sin(state.clock.elapsedTime * 2.0) * 1.7;
      } else {
        // Slow float
        ringRef.current.scale.lerp(new THREE.Vector3(0.001, 0.001, 0.001), 0.1);
      }
    }

    // 5. Visor Head Tracking
    if (visorRef.current) {
      // Dampen cursor position to point visor
      const targetHeadY = mouse.x * 0.55;
      const targetHeadX = -mouse.y * 0.35;
      headRotY.current = THREE.MathUtils.lerp(headRotY.current, targetHeadY, 0.1);
      headRotX.current = THREE.MathUtils.lerp(headRotX.current, targetHeadX, 0.1);
      
      visorRef.current.rotation.y = headRotY.current;
      visorRef.current.rotation.x = headRotX.current;
    }

    // 6. Orbiting Rings Rotation
    if (orbitRing1Ref.current) {
      orbitRing1Ref.current.rotation.z = state.clock.elapsedTime * 0.5;
    }
    if (orbitRing2Ref.current) {
      orbitRing2Ref.current.rotation.y = -state.clock.elapsedTime * 0.8;
    }
  });

  // Calculate emissive values dynamically for pulsing neon nodes
  const pulseIntensity = useRef(0);
  useFrame((state) => {
    pulseIntensity.current = 0.55 + Math.sin(state.clock.elapsedTime * 3.5) * 0.45;
  });

  const getMetricHighlight = (jointName: string) => {
    if (activeMetric === '') return false;
    
    // Match highlighted sections to custom metrics on hover
    if (activeMetric === 'height' && jointName === 'head') return true;
    if (activeMetric === 'weight' && (jointName === 'chest' || jointName === 'pelvis')) return true;
    if (activeMetric === 'bmi' && jointName === 'chest') return true;
    if (activeMetric === 'bodyFat' && jointName === 'pelvis') return true;
    if (activeMetric === 'bmr' && jointName === 'neck') return true;
    if (activeMetric === 'tdee' && jointName === 'chest') return true;
    return false;
  };

  // Section indicators to control glows
  const inWorkoutSection = scrollProgress >= 0.28 && scrollProgress <= 0.48;
  const inNeuralSection = scrollProgress >= 0.43 && scrollProgress <= 0.63;
  const inNutritionSection = scrollProgress >= 0.58 && scrollProgress <= 0.78;
  const inDashboardSection = scrollProgress >= 0.73 && scrollProgress <= 0.92;
  const inTransformationSection = scrollProgress >= 0.88;

  // Dynamic visual activation: pulse green/white on heavy flex contraction at bottom CTA
  const curlVal = scrollProgress > 0.85 && time > 0 ? Math.sin(time * 2.5) * 0.5 + 0.5 : 0;

  return (
    <group ref={groupRef}>
      {/* 1. Spine vertebrae discs */}
      {Array.from({ length: 6 }).map((_, idx) => {
        const y = -0.15 + idx * 0.22; // pelvis to neck
        const scale = 1.0 - Math.abs(idx - 3) * 0.12;
        return (
          <mesh key={`spine-${idx}`} position={[0, y, 0]} scale={[evolutionFactor, evolutionFactor, evolutionFactor]}>
            <torusGeometry args={[0.13 * scale, 0.016, 8, 24]} />
            <meshStandardMaterial
              color={inNeuralSection ? "#39ff14" : "#00f0ff"}
              wireframe
              transparent
              opacity={0.35}
              roughness={0.1}
              metalness={0.9}
            />
          </mesh>
        );
      })}

      {/* 2. Rib cage struts */}
      {Array.from({ length: 5 }).map((_, idx) => {
        const y = 0.38 + idx * 0.12; // chest region
        const width = 0.32 - (idx * 0.025);
        return (
          <mesh key={`rib-${idx}`} position={[0, y, 0]} rotation={[0.08, 0, 0]}>
            <torusGeometry args={[width, 0.012, 6, 24, Math.PI]} />
            <meshStandardMaterial
              color="#00f0ff"
              transparent
              opacity={0.25}
              roughness={0.1}
              metalness={0.9}
            />
          </mesh>
        );
      })}

      {/* 3. Glassmorphic Chest Plate Armor */}
      <mesh position={[0, 0.75, 0.13]} rotation={[0.04, 0, 0]}>
        <boxGeometry args={[0.31 * chestPlateScaleX, 0.24, 0.05]} />
        <meshPhysicalMaterial
          color={inWorkoutSection ? '#39ff14' : '#00f0ff'}
          transparent
          opacity={0.32}
          roughness={0.15}
          metalness={0.8}
          transmission={0.65}
          thickness={0.2}
          emissive={inWorkoutSection ? '#39ff14' : '#00f0ff'}
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* 4. Head Visor Segment */}
      <group ref={visorRef} position={[0, 1.4, 0]}>
        {/* Skull node */}
        <mesh>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshPhysicalMaterial
            color="#00f0ff"
            transparent
            opacity={0.25}
            roughness={0.2}
            metalness={0.85}
            transmission={0.4}
            thickness={0.1}
          />
        </mesh>
        {/* Glowing holographic visor */}
        <mesh position={[0, 0.02, 0.12]}>
          <boxGeometry args={[0.2, 0.05, 0.03]} />
          <meshBasicMaterial
            color="#39ff14"
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {/* 5. Joint Nodes */}
      {joints.map((joint) => {
        const isHoveredHighlight = getMetricHighlight(joint.name);
        const isPulseActive = isHoveredHighlight || 
          (inWorkoutSection && (joint.name.includes('shoulder') || joint.name.includes('elbow'))) ||
          (inNutritionSection && (joint.name === 'chest' || joint.name === 'pelvis'));

        let nodeColor = isPulseActive ? '#39ff14' : '#00f0ff';
        if (scrollProgress > 0.85) {
          if (joint.name.includes('shoulder') || joint.name.includes('elbow') || joint.name.includes('wrist') || joint.name === 'chest') {
            nodeColor = curlVal > 0.75 ? '#ffffff' : (curlVal > 0.3 ? '#39ff14' : '#00f0ff');
          }
        }
        
        // Increase node evolution scale dynamically on scroll
        const jointScale = isHoveredHighlight ? 1.4 : (1.0 + (scrollProgress > 0.3 ? (scrollProgress - 0.3) * 0.4 : 0));

        const pos = getJointPos(joint.name, joint.pos);

        return (
          <group key={joint.name} position={pos} scale={[jointScale, jointScale, jointScale]}>
            <mesh>
              <sphereGeometry args={[joint.size, 12, 12]} />
              <meshStandardMaterial
                color={nodeColor}
                wireframe
                transparent
                opacity={0.4}
                roughness={0.1}
                metalness={0.95}
              />
            </mesh>
            {/* Glowing core/emissive interior indicator */}
            <mesh>
              <sphereGeometry args={[joint.size * 0.4, 8, 8]} />
              <meshBasicMaterial
                color={nodeColor}
                transparent
                opacity={isPulseActive ? pulseIntensity.current * 0.8 + 0.2 : 0.45}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          </group>
        );
      })}

      {/* 6. Parallel Muscle Fiber Connectors */}
      {bones.map((bone, i) => {
        const startJoint = joints.find((j) => j.name === bone.start)!;
        const endJoint = joints.find((j) => j.name === bone.end)!;

        const startPos = getJointPos(bone.start, startJoint.pos);
        const endPos = getJointPos(bone.end, endJoint.pos);

        const direction = new THREE.Vector3().subVectors(endPos, startPos);
        const length = direction.length();
        const midpoint = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5);
        
        const up = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction.clone().normalize());

        // Determine displacement vector to render parallel fiber tubes
        const perpDirection = new THREE.Vector3(-direction.z, 0, direction.x).normalize().multiplyScalar(0.045 * evolutionFactor);

        const leftMidpoint = midpoint.clone().add(perpDirection);
        const rightMidpoint = midpoint.clone().sub(perpDirection);

        const isArmOrChestBone = bone.start === 'chest' || bone.start.includes('shoulder') || bone.start.includes('elbow');
        let fiberColor = (inWorkoutSection && isArmOrChestBone) ? '#39ff14' : '#00f0ff';
        if (scrollProgress > 0.85) {
          // Muscle fibers shift color during contraction flex
          fiberColor = curlVal > 0.75 ? '#ffffff' : (curlVal > 0.3 ? '#39ff14' : '#00f0ff');
        }

        return (
          <group key={i}>
            {/* Strand A - scaled radially on X & Z axis */}
            <mesh position={leftMidpoint} quaternion={quaternion} scale={[evolutionFactor, 1.0, evolutionFactor]}>
              <cylinderGeometry args={[0.016, 0.016, length, 6]} />
              <meshStandardMaterial
                color={fiberColor}
                wireframe
                transparent
                opacity={inWorkoutSection ? 0.35 : 0.22}
                roughness={0.15}
                metalness={0.9}
              />
            </mesh>
            {/* Strand B - scaled radially on X & Z axis */}
            <mesh position={rightMidpoint} quaternion={quaternion} scale={[evolutionFactor, 1.0, evolutionFactor]}>
              <cylinderGeometry args={[0.0128, 0.0128, length, 6]} />
              <meshStandardMaterial
                color={fiberColor}
                wireframe
                transparent
                opacity={inWorkoutSection ? 0.35 : 0.22}
                roughness={0.15}
                metalness={0.9}
              />
            </mesh>
          </group>
        );
      })}

      {/* 7. Neural Transmission Lines (Section 04 active) */}
      {inNeuralSection && (
        <group>
          {joints.filter(j => j.name !== 'head' && j.name !== 'chest').map((j, idx) => {
            let jPos = j.pos.clone();
            if (j.name.includes('shoulder')) {
              jPos.x *= shoulderWidthMultiplier;
            } else if (j.name.includes('elbow') || j.name.includes('wrist')) {
              jPos.x += (jPos.x > 0 ? 1 : -1) * (shoulderWidthMultiplier - 1.0) * 0.45;
            }
            
            // Draw a thin visual node connection linking chest to extremities
            return (
              <line key={`neural-${idx}`}>
                <bufferGeometry attach="geometry">
                  <float32BufferAttribute
                    attach="attributes-position"
                    args={[new Float32Array([0, 0.7, 0, jPos.x, jPos.y, jPos.z]), 3]}
                  />
                </bufferGeometry>
                <lineBasicMaterial
                  color="#39ff14"
                  transparent
                  opacity={0.35}
                  linewidth={1}
                />
              </line>
            );
          })}
        </group>
      )}

      {/* 8. Orbiting Dashboard Analytics Rings (Section 06 active) */}
      {inDashboardSection && (
        <group position={[0, 0.3, 0]}>
          {/* Ring 1 - Tilt Angle */}
          <mesh ref={orbitRing1Ref} rotation={[0.4, 0, 0]}>
            <torusGeometry args={[0.9, 0.008, 4, 32]} />
            <meshBasicMaterial
              color="#00f0ff"
              transparent
              opacity={0.65}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          {/* Ring 2 - Reverse tilt */}
          <mesh ref={orbitRing2Ref} rotation={[-0.3, 0, 0]}>
            <torusGeometry args={[1.05, 0.006, 4, 32]} />
            <meshBasicMaterial
              color="#39ff14"
              transparent
              opacity={0.5}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      )}

      {/* 9. Scanning laser ring (Section 02 active) */}
      <mesh ref={ringRef} position={[0, 0, 0]}>
        <torusGeometry args={[1.15, 0.02, 6, 36]} />
        <meshBasicMaterial
          color="#39ff14"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 10. Glowing Core Chest Power Node */}
      <mesh position={[0, 0.7, 0.08]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshPhysicalMaterial
          color={inTransformationSection ? '#ffffff' : '#39ff14'}
          transparent
          opacity={0.85}
          roughness={0.1}
          metalness={0.9}
          transmission={0.2}
          emissive={inTransformationSection ? '#ffffff' : '#39ff14'}
          emissiveIntensity={inTransformationSection ? 1.8 + curlVal * 1.4 : 0.8}
        />
      </mesh>
    </group>
  );
}

// Dynamic cyber grid mapping floor
function GridFloor({ scrollProgress = 0 }) {
  const gridRef = useRef<THREE.GridHelper>(null);

  useFrame(() => {
    if (gridRef.current) {
      gridRef.current.position.z = (scrollProgress * 25.0) % 4; // Repeating loop animation
    }
  });

  return (
    <gridHelper
      ref={gridRef}
      args={[40, 40, '#00f0ff', '#090a0d']}
      position={[0, -2.4, 0]}
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
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]} intensity={1.8} color="#ffffff" />
        <pointLight position={[8, 4, 8]} intensity={1.5} color="#00f0ff" />
        <pointLight position={[-8, -4, -8]} intensity={1.2} color="#39ff14" />
        
        <HolographicHumanoid scrollProgress={scrollProgress} activeMetric={activeMetric} />
        <ParticleField count={220} scrollProgress={scrollProgress} />
        <NutritionFlow scrollProgress={scrollProgress} />
        <GridFloor scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
}
