import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

interface Phone3DModelProps {
  handleMouseMove: (e: ThreeEvent<PointerEvent>) => void;
  handleMouseLeave: () => void;
}

const Phone3DModel: React.FC<Phone3DModelProps> = ({ handleMouseMove, handleMouseLeave }) => {
  const phoneRef = useRef<THREE.Group>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  // Load texture once to prevent flickering
  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('/main-sc.jpeg', loadedTexture => {
      // Adjust texture settings
      loadedTexture.minFilter = THREE.LinearFilter;
      loadedTexture.magFilter = THREE.LinearFilter;
      loadedTexture.anisotropy = 16; // Increase for better quality

      // Fix texture scaling
      loadedTexture.repeat.set(1, 1);
      loadedTexture.offset.set(0, 0);

      setTexture(loadedTexture);
    });
  }, []);

  useFrame(() => {
    if (phoneRef.current) {
      // More subtle ambient animation
      phoneRef.current.rotation.y = Math.sin(Date.now() * 0.0003) * 0.05;
    }
  });

  return (
    <group ref={phoneRef} onPointerMove={handleMouseMove} onPointerLeave={handleMouseLeave}>
      {/* Phone Frame - Enhanced to be more visible */}
      <mesh castShadow position={[0, 0, 0]}>
        <boxGeometry args={[2.8, 5.6, 0.4]} />
        <meshStandardMaterial color='#5E4B3E' roughness={0.3} metalness={0.7} envMapIntensity={0.8} />
      </mesh>

      {/* Phone Screen - Fixed texture handling */}
      <mesh position={[0, 0, 0.22]} receiveShadow>
        <planeGeometry args={[2.6, 5.4]} />
        {texture ? (
          <meshStandardMaterial
            color='#FFFFFF'
            roughness={0}
            metalness={0.1}
            map={texture}
            transparent={true}
            toneMapped={false}
          />
        ) : (
          <meshStandardMaterial color='#111111' />
        )}
      </mesh>

      {/* Phone Screen Border - Adding a subtle border */}
      <mesh position={[0, 0, 0.21]} receiveShadow>
        <boxGeometry args={[2.65, 5.45, 0.02]} />
        <meshStandardMaterial color='#222222' roughness={0.1} metalness={0.9} />
      </mesh>

      {/* Home Button */}
      <mesh position={[0, -2.4, 0.25]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.1, 32]} />
        <meshStandardMaterial color='#333333' roughness={0.5} />
      </mesh>
    </group>
  );
};

const Phone3D: React.FC = () => {
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);

  // Add a subtle constant rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => [prev[0], prev[1] + 0.002, prev[2]]);
    }, 16);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: ThreeEvent<PointerEvent>) => {
    // Convert pointer position to rotation angles with dampened response
    if (e.point) {
      const x = (e.point.y / 4) * Math.PI * 0.15;
      const y = (e.point.x / 4) * Math.PI * 0.15;
      setRotation([-x, y, 0]);
    }
  };

  const handleMouseLeave = () => {
    // Smoothly reset rotation
    setRotation([0, 0, 0]);
  };

  return (
    <div className='h-96 md:h-128 w-full relative'>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 8], fov: 25 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
      >
        <color attach='background' args={['transparent']} />
        <ambientLight intensity={0.8} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={1.2}
          castShadow
          shadow-mapSize={[512, 512]}
        />
        <directionalLight position={[-5, 5, 5]} intensity={0.8} castShadow />

        <group rotation={rotation}>
          <Phone3DModel handleMouseMove={handleMouseMove} handleMouseLeave={handleMouseLeave} />
        </group>
      </Canvas>
    </div>
  );
};

export default Phone3D;
