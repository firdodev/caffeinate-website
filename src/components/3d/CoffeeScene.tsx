import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PresentationControls } from '@react-three/drei';
import * as THREE from 'three';

const CoffeeBubble = ({ position, speed, size }) => {
  const bubbleRef = useRef();
  const startY = position[1];

  useFrame(state => {
    if (bubbleRef.current) {
      // Move bubble upward with slight random horizontal movement
      bubbleRef.current.position.y += speed;
      bubbleRef.current.position.x += Math.sin(state.clock.getElapsedTime() * 2 + position[0]) * 0.003;
      bubbleRef.current.position.z += Math.cos(state.clock.getElapsedTime() * 2 + position[2]) * 0.003;

      // Reset position when bubble reaches top
      if (bubbleRef.current.position.y > startY + 0.5) {
        bubbleRef.current.position.y = startY - 0.2;
      }
    }
  });

  return (
    <mesh ref={bubbleRef} position={position}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshStandardMaterial color='#5E2A17' transparent opacity={0.8} roughness={0.3} metalness={0.4} />
    </mesh>
  );
};

const CoffeeSurface = () => {
  const surfaceRef = useRef();
  const coffeeGeometry = useRef();

  // Create ripple effect with vertex displacement
  useFrame(state => {
    if (coffeeGeometry.current && coffeeGeometry.current.attributes.position) {
      const positions = coffeeGeometry.current.attributes.position;
      const time = state.clock.getElapsedTime();

      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const z = positions.getZ(i);
        const distance = Math.sqrt(x * x + z * z);

        if (distance < 0.85) {
          // Only affect points inside the cup
          const y =
            Math.sin(distance * 8 - time * 1.5) * 0.03 +
            Math.sin(x * 6 + time) * 0.02 +
            Math.sin(z * 6 + time * 0.7) * 0.02;
          positions.setY(i, y);
        }
      }

      positions.needsUpdate = true;
    }

    if (surfaceRef.current) {
      // Slow rotation for the coffee surface
      surfaceRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <mesh ref={surfaceRef} position={[0, 0.51, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry ref={coffeeGeometry} args={[1.8, 1.8, 32, 32]} />
      <meshStandardMaterial
        color='#3B1D0F'
        roughness={0.2}
        metalness={0.5}
        side={THREE.DoubleSide}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
};

const Steam = () => {
  const steamParticles = useMemo(() => {
    return [...Array(15)].map((_, i) => ({
      position: [(Math.random() - 0.5) * 0.7, 0.8 + Math.random() * 0.5, (Math.random() - 0.5) * 0.7],
      scale: 0.05 + Math.random() * 0.1,
      speed: 0.003 + Math.random() * 0.005,
      rotation: Math.random() * Math.PI,
      rotationSpeed: (Math.random() - 0.5) * 0.01
    }));
  }, []);

  return (
    <group>
      {steamParticles.map((particle, i) => (
        <SteamParticle key={i} {...particle} />
      ))}
    </group>
  );
};

const SteamParticle = ({ position, scale, speed, rotation, rotationSpeed }) => {
  const particleRef = useRef();
  const startY = position[1];

  useFrame(state => {
    if (particleRef.current) {
      particleRef.current.position.y += speed;
      particleRef.current.position.x += Math.sin(state.clock.getElapsedTime() + position[0]) * 0.001;
      particleRef.current.position.z += Math.cos(state.clock.getElapsedTime() + position[2]) * 0.001;
      particleRef.current.rotation.z += rotationSpeed;

      // Fade out as it rises
      const material = particleRef.current.material;
      const lifeRatio = (particleRef.current.position.y - startY) / 0.8;
      material.opacity = Math.max(0, 0.7 * (1 - lifeRatio));

      // Reset when it's too high or faded out
      if (particleRef.current.position.y > startY + 0.8 || material.opacity < 0.05) {
        particleRef.current.position.y = startY;
        particleRef.current.position.x = position[0] + (Math.random() - 0.5) * 0.4;
        particleRef.current.position.z = position[2] + (Math.random() - 0.5) * 0.4;
        material.opacity = 0.7;
      }
    }
  });

  return (
    <mesh ref={particleRef} position={position} rotation={[0, 0, rotation]}>
      <planeGeometry args={[scale, scale * 1.5]} />
      <meshStandardMaterial color='white' transparent opacity={0.7} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
};

const CoffeeCup = () => {
  const cupRef = useRef();
  const coffeeRef = useRef();

  useFrame(state => {
    if (cupRef.current) {
      cupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.1;
    }

    if (coffeeRef.current) {
      // Slow up and down motion for brewing effect
      coffeeRef.current.position.y = 0 + Math.sin(state.clock.getElapsedTime() * 0.8) * 0.02;
    }
  });

  // Generate coffee bubbles
  const bubbles = useMemo(() => {
    return [...Array(20)].map((_, i) => ({
      position: [(Math.random() - 0.5) * 0.7, 0.3 + Math.random() * 0.2, (Math.random() - 0.5) * 0.7],
      speed: 0.001 + Math.random() * 0.002,
      size: 0.02 + Math.random() * 0.04
    }));
  }, []);

  return (
    <group ref={cupRef}>
      {/* Cup body - more tapered for realistic appearance */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1, 0.75, 1.6, 32]} />
        <meshStandardMaterial color='#F2EEE5' roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Inner cup wall */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.9, 0.7, 1.45, 32]} />
        <meshStandardMaterial color='#E6D8C2' roughness={0.3} side={THREE.BackSide} />
      </mesh>

      {/* Cup base */}
      <mesh position={[0, -0.85, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 0.9, 0.1, 32]} />
        <meshStandardMaterial color='#F2EEE5' roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Cup handle */}
      <group position={[0, 0, 0]}>
        <mesh position={[1.2, -0.2, 0]} castShadow>
          <torusGeometry args={[0.35, 0.1, 16, 32, Math.PI]} />
          <meshStandardMaterial color='#F2EEE5' roughness={0.4} metalness={0.1} />
        </mesh>
      </group>

      {/* Coffee liquid */}
      <group ref={coffeeRef}>
        {/* Main coffee volume */}
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.85, 0.65, 1, 32]} />
          <meshStandardMaterial color='#3B1D0F' roughness={0.3} metalness={0.2} transparent opacity={0.95} />
        </mesh>

        {/* Dynamic coffee surface */}
        <CoffeeSurface />

        {/* Coffee bubbles */}
        {bubbles.map((bubble, i) => (
          <CoffeeBubble key={i} {...bubble} />
        ))}
      </group>

      {/* Steam effect */}
      <Steam />
    </group>
  );
};

const CoffeeScene = () => {
  return (
    <div className='h-96 md:h-128 w-full'>
      <Canvas
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
        shadows
        camera={{ position: [0, 3, 7], fov: 40 }}
      >
        {/* <color attach='background' args={['transparent']} /> */}
        <ambientLight intensity={0.6} />
        <spotLight
          position={[5, 8, 5]}
          angle={0.25}
          penumbra={1}
          intensity={1}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} castShadow />

        <PresentationControls
          global
          zoom={0.8}
          rotation={[0, -Math.PI / 6, 0]}
          polar={[-Math.PI / 4, Math.PI / 4]}
          azimuth={[-Math.PI / 4, Math.PI / 4]}
        >
          <CoffeeCup />

          {/* Plate under the coffee cup */}
          <mesh position={[0, -0.95, 0]} receiveShadow rotation={[0, 0, 0]}>
            <cylinderGeometry args={[1.5, 1.5, 0.1, 32]} />
            <meshStandardMaterial color='#FFFFFF' roughness={0.4} metalness={0.1} />
          </mesh>

          {/* Surface the coffee is sitting on */}
          {/* <mesh position={[0, -1.05, 0]} receiveShadow rotation={[0, 0, 0]}>
            <planeGeometry args={[15, 15]} />
            <meshStandardMaterial color='#402218' roughness={0.8} metalness={0.1} />
          </mesh> */}
        </PresentationControls>

        <Environment preset='apartment' />
        <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 2.2} />
      </Canvas>
    </div>
  );
};

export default CoffeeScene;
