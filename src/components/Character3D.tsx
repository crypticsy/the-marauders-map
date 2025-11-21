import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { Character } from '../map/Character';
import { PlayerCharacter } from '../map/PlayerCharacter';

interface Character3DProps {
  character: Character | PlayerCharacter;
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
  const [stepTimer, setStepTimer] = useState(0);
  const [previousPositions, setPreviousPositions] = useState<Array<{x: number, z: number, rotation: number, time: number}>>([]);
  const [currentRotation, setCurrentRotation] = useState(0);

  // Track previous position to detect movement from ANY source (AI or keyboard)
  const previousPositionRef = useRef<{x: number, z: number} | null>(null);

  // Failsafe for genuinely stuck characters (not resting)
  const lastMoveTimeRef = useRef<number>(0);
  const stuckCheckPositionRef = useRef<{x: number, z: number} | null>(null);
  const hasAttemptedMovementRef = useRef<boolean>(false);

  // Create footprint texture once using useMemo (must be before conditional return!)
  const footprintTexture = useMemo(() => createFootprintTexture(), []);

  useFrame((state, delta) => {
    if (isActive) {
      // Get position BEFORE update
      const oldPos = previousPositionRef.current || character.getPosition2D();

      // Update character (AI pathfinding)
      character.update(delta);

      // Get position AFTER update (includes both AI and keyboard movement)
      const newPos = character.getPosition2D();

      // Store current position for next frame
      previousPositionRef.current = { ...newPos };

      // Check if character moved significantly
      const distance = Math.sqrt(
        Math.pow(newPos.x - oldPos.x, 2) +
        Math.pow(newPos.z - oldPos.z, 2)
      );

      // Track if character is attempting to move (not just resting)
      if (distance > 0.001) {
        hasAttemptedMovementRef.current = true;
      }

      // Update current rotation when moving to know which direction to face
      if (distance > 0.01) {
        const angle = Math.atan2(newPos.z - oldPos.z, newPos.x - oldPos.x);
        setCurrentRotation(angle);
      }

      // Failsafe: Check if character is genuinely stuck (trying to move but can't)
      if (!stuckCheckPositionRef.current) {
        stuckCheckPositionRef.current = { ...newPos };
        lastMoveTimeRef.current = state.clock.elapsedTime;
      } else {
        const stuckDistance = Math.sqrt(
          Math.pow(newPos.x - stuckCheckPositionRef.current.x, 2) +
          Math.pow(newPos.z - stuckCheckPositionRef.current.z, 2)
        );

        // If character has made progress, update check position
        if (stuckDistance > 0.5) {
          stuckCheckPositionRef.current = { ...newPos };
          lastMoveTimeRef.current = state.clock.elapsedTime;
          hasAttemptedMovementRef.current = false;
        }
        // Only reset if they've tried to move but haven't made progress (stuck in wall)
        else if (hasAttemptedMovementRef.current && state.clock.elapsedTime - lastMoveTimeRef.current > 8) {
          console.log(`${character.name} is stuck in wall! Resetting...`);
          character.reset();
          stuckCheckPositionRef.current = null;
          hasAttemptedMovementRef.current = false;
        }
      }

      // Add footstep every 0.2 units traveled (only if actually moving)
      const newStepTimer = stepTimer + distance;
      if (newStepTimer > 0.2 && distance > 0.01) {
        // Calculate rotation based on movement direction
        const angle = Math.atan2(newPos.z - oldPos.z, newPos.x - oldPos.x);

        setPreviousPositions(prev => {
          const updated = [...prev, {
            x: newPos.x,
            z: newPos.z,
            rotation: angle,
            time: state.clock.elapsedTime
          }];
          // Keep only last 5 footsteps for better trail
          return updated.slice(-5);
        });

        setStepTimer(0);
      } else {
        setStepTimer(newStepTimer);
      }
    }
  });

  if (!isActive) return null;

  const pos = character.getPosition3D(0.05);

  // Use the most recent trail rotation for current position, or fallback to currentRotation
  const displayRotation = previousPositions.length > 0
    ? previousPositions[previousPositions.length - 1].rotation
    : currentRotation;

  return (
    <group ref={groupRef}>
      {/* Render trail of footsteps - always facing movement direction */}
      {previousPositions.map((step, index) => {
        const age = previousPositions.length - index;
        // Better fade gradient: newest (0.85) -> oldest (0.15)
        const opacity = Math.max(0.15, 0.85 - age * 0.14);
        const isLeft = index % 2 === 0;
        const offsetX = isLeft ? -0.25 : 0.25;

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
            <planeGeometry args={[0.5, 1.0]} />
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

      {/* Current position - two shoe stamps facing movement direction (matching trail exactly) */}
      {/* Left shoe */}
      <mesh
        position={[
          pos.x + Math.cos(displayRotation + Math.PI / 2) * -0.25,
          0.08,
          pos.z + Math.sin(displayRotation + Math.PI / 2) * -0.25
        ]}
        rotation={[-Math.PI / 2, 0, displayRotation + Math.PI / 2]}
      >
        <planeGeometry args={[0.5, 1.0]} />
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
        position={[
          pos.x + Math.cos(displayRotation + Math.PI / 2) * 0.25,
          0.08,
          pos.z + Math.sin(displayRotation + Math.PI / 2) * 0.25
        ]}
        rotation={[-Math.PI / 2, 0, displayRotation - Math.PI / 2]}
      >
        <planeGeometry args={[0.5, 1.0]} />
        <meshBasicMaterial
          map={footprintTexture}
          transparent
          opacity={0.9}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <group position={[pos.x, 0.08, pos.z]}>

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
