import React from 'react';
import { ObstacleImpl } from '../map/Obstacle';

interface Obstacle3DProps {
  obstacle: ObstacleImpl;
  isActive: boolean;
}

/**
 * Renders an obstacle (furniture, wall, decoration) in 3D
 */
export const Obstacle3D: React.FC<Obstacle3DProps> = ({ obstacle, isActive }) => {
  if (!isActive) return null;

  const getColor = () => {
    switch (obstacle.type) {
      case 'furniture':
        return '#8B4513'; // Brown
      case 'wall':
        return '#696969'; // Dark gray
      case 'decoration':
        return '#DAA520'; // Goldenrod
      default:
        return '#888888';
    }
  };

  const getOpacity = () => {
    switch (obstacle.type) {
      case 'furniture':
        return 0.4;
      case 'wall':
        return 0.6;
      case 'decoration':
        return 0.3;
      default:
        return 0.4;
    }
  };

  return (
    <mesh
      position={[obstacle.position.x, obstacle.height / 2, obstacle.position.z]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[obstacle.size.x, obstacle.height, obstacle.size.z]} />
      <meshStandardMaterial
        color={getColor()}
        transparent
        opacity={getOpacity()}
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  );
};
