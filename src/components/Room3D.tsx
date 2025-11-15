import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { Room } from '../map/Room';

interface Room3DProps {
  room: Room;
  isActive: boolean;
}

export const Room3D: React.FC<Room3DProps> = ({ room, isActive }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current) {
      room.update(isActive, hovered);
      meshRef.current.scale.y = room.getScale();
    }
  });

  const { x, y, z } = room.position;
  const [width, height, depth] = [room.size.x, room.size.y, room.size.z];

  return (
    <group position={[x, y, z]}>
      {/* Base outline on parchment */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial
          color={room.color}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
          emissive={room.color}
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* 3D pop-up walls */}
      <mesh
        ref={meshRef}
        position={[0, height / 2, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
      >
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={room.color}
          transparent
          opacity={room.getOpacity()}
          wireframe
          emissive={room.color}
          emissiveIntensity={room.getEmissiveIntensity()}
        />
      </mesh>

      {/* Label */}
      {isActive && (
        <Text
          position={[0, height + 0.5, 0]}
          fontSize={0.6}
          color="#000000"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.015}
          outlineColor="#e8dcc4"
          font="https://fonts.gstatic.com/s/imfellenglish/v16/Ktk1ALSLW8zDe0rthJysWrnLsAz3F6mZVY9Y5w.woff"
        >
          {room.name}
        </Text>
      )}
    </group>
  );
};
