import React, { useRef, useMemo } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { Room, WallSide } from '../map/Room';
import {
  INK,
  FLOOR,
  WALL_HEIGHT,
  WALL_THICKNESS,
  FONT_CAPS,
  getFloorTexture,
  revealDelay,
  useInkReveal,
} from './mapTheme';

interface Room3DProps {
  room: Room;
  doorWidths: Record<string, number>; // Connection point name -> corridor width
  isHovered: boolean;
  onHoverChange: (roomId: string | null) => void;
}

interface WallPiece {
  position: [number, number, number];
  size: [number, number, number];
  rotationY: number;
}

/**
 * Straight wall runs for a rectangular room, leaving gaps where corridors enter
 */
const buildRectWalls = (room: Room, doorWidths: Record<string, number>): WallPiece[] => {
  const hw = room.size.x / 2;
  const hd = room.size.z / 2;
  const t = WALL_THICKNESS;
  const sides: Record<WallSide, { alongX: boolean; fixed: number; length: number }> = {
    north: { alongX: true, fixed: -hd, length: room.size.x },
    south: { alongX: true, fixed: hd, length: room.size.x },
    east: { alongX: false, fixed: hw, length: room.size.z },
    west: { alongX: false, fixed: -hw, length: room.size.z },
  };
  const doorways = room.getDoorways();
  const pieces: WallPiece[] = [];

  (Object.keys(sides) as WallSide[]).forEach((side) => {
    const { alongX, fixed, length } = sides[side];

    const gaps = doorways
      .filter((door) => door.side === side)
      .map((door) => {
        const along = alongX ? door.offset.x : door.offset.z;
        const half = (doorWidths[door.name] ?? 2.5) / 2;
        return [along - half, along + half] as [number, number];
      })
      .sort((a, b) => a[0] - b[0]);

    // Walk along the wall, emitting solid runs between doorway gaps
    let cursor = -length / 2 - t / 2;
    const end = length / 2 + t / 2;
    [...gaps, [end, end] as [number, number]].forEach(([gapStart, gapEnd]) => {
      if (gapStart - cursor > 0.01) {
        const center = (cursor + gapStart) / 2;
        const runLength = gapStart - cursor;
        pieces.push(
          alongX
            ? { position: [center, WALL_HEIGHT / 2, fixed], size: [runLength, WALL_HEIGHT, t], rotationY: 0 }
            : { position: [fixed, WALL_HEIGHT / 2, center], size: [t, WALL_HEIGHT, runLength], rotationY: 0 }
        );
      }
      cursor = Math.max(cursor, gapEnd);
    });
  });

  return pieces;
};

/**
 * Circular wall for tower rooms, built from short straight pieces
 */
const buildRoundWalls = (room: Room, doorWidths: Record<string, number>): WallPiece[] => {
  const radius = room.getRadius();
  const segments = 56;
  const step = (Math.PI * 2) / segments;
  const doorArcs = room.getDoorways().map((door) => ({
    angle: Math.atan2(door.offset.z, door.offset.x),
    half: Math.asin(Math.min(1, (doorWidths[door.name] ?? 2.5) / 2 / radius)),
  }));
  const pieces: WallPiece[] = [];

  for (let i = 0; i < segments; i++) {
    const angle = (i + 0.5) * step;
    const inDoorway = doorArcs.some(({ angle: doorAngle, half }) => {
      const diff = Math.atan2(Math.sin(angle - doorAngle), Math.cos(angle - doorAngle));
      return Math.abs(diff) < half + step / 2;
    });
    if (inDoorway) continue;

    const chord = 2 * radius * Math.sin(step / 2) + 0.06;
    pieces.push({
      position: [Math.cos(angle) * radius, WALL_HEIGHT / 2, Math.sin(angle) * radius],
      size: [chord, WALL_HEIGHT, WALL_THICKNESS],
      rotationY: -angle - Math.PI / 2,
    });
  }

  return pieces;
};

export const Room3D: React.FC<Room3DProps> = ({ room, doorWidths, isHovered, onHoverChange }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { x, z } = room.position;
  const isRound = room.shape === 'round';

  useInkReveal(groupRef, revealDelay(x, z));

  const walls = useMemo(
    () => (isRound ? buildRoundWalls(room, doorWidths) : buildRectWalls(room, doorWidths)),
    [room, doorWidths, isRound]
  );

  // Repeat the floor pattern roughly every four map units
  const floorTexture = useMemo(() => {
    const texture = getFloorTexture(room.floor).clone();
    texture.repeat.set(room.size.x / 4, room.size.z / 4);
    texture.needsUpdate = true;
    return texture;
  }, [room]);

  const floorGeometry = isRound ? (
    <circleGeometry args={[room.getRadius(), 48]} />
  ) : (
    <planeGeometry args={[room.size.x, room.size.z]} />
  );

  // Scale the name to the room so long names still fit
  const fontSize = Math.min(1.05, Math.max(0.62, room.size.x / 12));

  return (
    <group ref={groupRef} position={[x, 0, z]}>
      {/* Floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHoverChange(room.id);
        }}
        onPointerOut={() => onHoverChange(null)}
      >
        {floorGeometry}
        <meshBasicMaterial color={isHovered ? '#e9d4a8' : FLOOR} />
      </mesh>

      {/* Floor pattern */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        {floorGeometry}
        <meshBasicMaterial map={floorTexture} transparent opacity={0.35} depthWrite={false} />
      </mesh>

      {/* Ink walls */}
      {walls.map((wall, index) => (
        <mesh key={index} position={wall.position} rotation={[0, wall.rotationY, 0]}>
          <boxGeometry args={wall.size} />
          <meshStandardMaterial color={INK} roughness={1} />
        </mesh>
      ))}

      {/* Name written on the floor */}
      <Text
        position={[room.labelOffset.x, 0.06, room.labelOffset.z]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={fontSize}
        maxWidth={room.size.x * 0.8}
        lineHeight={1.05}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        color={INK}
        font={FONT_CAPS}
      >
        {room.name}
      </Text>
    </group>
  );
};
