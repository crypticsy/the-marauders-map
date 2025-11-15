import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { Character } from '../map/Character';

interface Character3DProps {
  character: Character;
  isActive: boolean;
}

/**
 * Renders an animated character with footsteps on the map
 */
export const Character3D: React.FC<Character3DProps> = ({ character, isActive }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (isActive) {
      character.update(delta);
    }
  });

  if (!isActive) return null;

  const pos = character.getPosition3D(0.5);

  return (
    <group ref={groupRef} position={[pos.x, pos.y, pos.z]}>
      {/* Main glowing footprint */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.4, 24]} />
        <meshStandardMaterial
          color={character.color}
          emissive={character.color}
          emissiveIntensity={0.8}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Glow ring effect */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.4, 0.6, 32]} />
        <meshStandardMaterial
          color={character.color}
          emissive={character.color}
          emissiveIntensity={0.4}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Animated pulse ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.6, 0.8, 32]} />
        <meshStandardMaterial
          color={character.color}
          emissive={character.color}
          emissiveIntensity={0.6}
          transparent
          opacity={0.2}
        />
      </mesh>

      {/* Character name label */}
      <Text
        position={[0, 0.8, 0]}
        fontSize={0.4}
        color={character.color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.015}
        outlineColor="#000000"
        font="https://fonts.gstatic.com/s/shadowsintolight/v19/UqyNK9UOIntux_czAvDQx_ZcHqZXBNQDcsr4xzSMYA.woff"
      >
        {character.name}
      </Text>
    </group>
  );
};
