import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { Character } from '../map/Character';

interface Character3DProps {
  character: Character;
  isActive: boolean;
}

// Create footprint texture using canvas (much simpler than geometry!)
const createFootprintTexture = (): THREE.Texture => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Set drawing style
  ctx.fillStyle = '#3d2817'; // Ink color

  const width = 50;
  const heelHeight = 70;
  const toeHeight = 90;
  const gap = 15;
  const centerX = canvas.width / 2;
  const startY = 30;

  // Draw heel section (bottom rectangle with slightly rounded corners)
  ctx.beginPath();
  ctx.roundRect(centerX - width / 2, startY, width, heelHeight, 5);
  ctx.fill();

  // Draw toe section (rounded top)
  const toeY = startY + heelHeight + gap;
  ctx.beginPath();
  ctx.moveTo(centerX - width / 2, toeY);
  ctx.lineTo(centerX - width / 2, toeY + toeHeight * 0.6);
  // Rounded toe top
  ctx.quadraticCurveTo(
    centerX - width / 2, toeY + toeHeight,
    centerX, toeY + toeHeight
  );
  ctx.quadraticCurveTo(
    centerX + width / 2, toeY + toeHeight,
    centerX + width / 2, toeY + toeHeight * 0.6
  );
  ctx.lineTo(centerX + width / 2, toeY);
  ctx.closePath();
  ctx.fill();

  // Create texture
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

/**
 * Renders an animated character with footsteps on the map
 */
export const Character3D: React.FC<Character3DProps> = ({ character, isActive }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [footstepToggle, setFootstepToggle] = useState(false);
  const [stepTimer, setStepTimer] = useState(0);
  const [previousPositions, setPreviousPositions] = useState<Array<{x: number, z: number, rotation: number, time: number}>>([]);

  // Create footprint texture once using useMemo (must be before conditional return!)
  const footprintTexture = useMemo(() => createFootprintTexture(), []);

  useFrame((state, delta) => {
    if (isActive) {
      const oldPos = character.getPosition2D();
      character.update(delta);
      const newPos = character.getPosition2D();

      // Check if character moved significantly
      const distance = Math.sqrt(
        Math.pow(newPos.x - oldPos.x, 2) +
        Math.pow(newPos.z - oldPos.z, 2)
      );

      // Add footstep every 0.5 units traveled
      const newStepTimer = stepTimer + distance;
      if (newStepTimer > 0.5) {
        // Calculate rotation based on movement direction
        const angle = Math.atan2(newPos.z - oldPos.z, newPos.x - oldPos.x);

        setPreviousPositions(prev => {
          const updated = [...prev, {
            x: newPos.x,
            z: newPos.z,
            rotation: angle,
            time: state.clock.elapsedTime
          }];
          // Keep only last 8 footsteps
          return updated.slice(-8);
        });

        setFootstepToggle(!footstepToggle);
        setStepTimer(0);
      } else {
        setStepTimer(newStepTimer);
      }
    }
  });

  if (!isActive) return null;

  const pos = character.getPosition3D(0.05);

  return (
    <group ref={groupRef}>
      {/* Render trail of footsteps - using texture on planes */}
      {previousPositions.map((step, index) => {
        const age = previousPositions.length - index;
        const opacity = Math.max(0.2, 0.85 - age * 0.1);
        const isLeft = index % 2 === 0;
        const offsetX = isLeft ? -0.15 : 0.15;

        return (
          <mesh
            key={`${step.x}-${step.z}-${index}`}
            position={[
              step.x + Math.cos(step.rotation + Math.PI / 2) * offsetX,
              0.08,
              step.z + Math.sin(step.rotation + Math.PI / 2) * offsetX
            ]}
            rotation={[-Math.PI / 2, 0, isLeft ? step.rotation + Math.PI / 2 : step.rotation - Math.PI / 2]}
          >
            <planeGeometry args={[0.3, 0.6]} />
            <meshBasicMaterial
              map={footprintTexture}
              transparent
              opacity={opacity}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}

      {/* Current position - two shoe stamps */}
      <group position={[pos.x, 0.08, pos.z]}>
        {/* Left shoe */}
        <mesh
          position={[-0.18, 0, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.3, 0.6]} />
          <meshBasicMaterial
            map={footprintTexture}
            transparent
            opacity={0.9}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Right shoe */}
        <mesh
          position={[0.18, 0, 0]}
          rotation={[-Math.PI / 2, 0, Math.PI]}
        >
          <planeGeometry args={[0.3, 0.6]} />
          <meshBasicMaterial
            map={footprintTexture}
            transparent
            opacity={0.9}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Character name label - still use character color for identification */}
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.35}
          color={character.color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
          font="https://fonts.gstatic.com/s/shadowsintolight/v19/UqyNK9UOIntux_czAvDQx_ZcHqZXBNQDcsr4xzSMYA.woff"
        >
          {character.name}
        </Text>
      </group>
    </group>
  );
};
