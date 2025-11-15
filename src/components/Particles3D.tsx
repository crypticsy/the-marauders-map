import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MagicParticlesProps {
  count?: number;
  isActive: boolean;
}

export const MagicParticles: React.FC<MagicParticlesProps> = ({ count = 100, isActive }) => {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate random particle positions
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Position
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = Math.random() * 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;

      // Color (golden magical glow)
      const goldenColor = new THREE.Color('#ffd700');
      colors[i * 3] = goldenColor.r;
      colors[i * 3 + 1] = goldenColor.g;
      colors[i * 3 + 2] = goldenColor.b;
    }

    return { positions, colors };
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current && isActive) {
      // Rotate particles slowly
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;

      // Animate particle positions
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        // Float up and down
        positions[i3 + 1] += Math.sin(state.clock.elapsedTime + i) * 0.01;

        // Reset if too high
        if (positions[i3 + 1] > 15) {
          positions[i3 + 1] = 0;
        }
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  if (!isActive) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
