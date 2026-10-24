import React, { useRef } from 'react';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import { ObstacleImpl } from '../map/Obstacle';
import { INK, revealDelay, useInkReveal } from './mapTheme';

interface Obstacle3DProps {
  obstacle: ObstacleImpl;
}

/**
 * Renders furniture as an inked outline over a parchment-coloured block
 */
export const Obstacle3D: React.FC<Obstacle3DProps> = ({ obstacle }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { x, z } = obstacle.position;
  useInkReveal(groupRef, revealDelay(x, z) + 0.3);

  return (
    <group ref={groupRef} position={[x, obstacle.height / 2, z]}>
      <mesh>
        {obstacle.shape === 'round' ? (
          <cylinderGeometry args={[obstacle.size.x / 2, obstacle.size.x / 2, obstacle.height, 28]} />
        ) : (
          <boxGeometry args={[obstacle.size.x, obstacle.height, obstacle.size.z]} />
        )}
        <meshStandardMaterial color="#d6b98a" roughness={1} />
        <Edges color={INK} threshold={20} />
      </mesh>
    </group>
  );
};
