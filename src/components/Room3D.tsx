import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import { Room } from '../map/Room';

interface Room3DProps {
  room: Room;
  isActive: boolean;
}

export const Room3D: React.FC<Room3DProps> = ({ room, isActive }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (groupRef.current) {
      room.update(isActive, hovered);
      groupRef.current.scale.y = room.getScale();
    }
  });

  const { x, y, z } = room.position;
  const [width, height, depth] = [room.size.x, room.size.y, room.size.z];

  // Consistent ink color for all rooms
  const inkColor = '#3d2817';
  const wallOpacity = hovered ? 0.15 : 0.08;

  // Create outline points for the room border
  const outlinePoints = useMemo(() => {
    const hw = width / 2;
    const hd = depth / 2;
    return [
      new THREE.Vector3(-hw, 0, -hd),
      new THREE.Vector3(hw, 0, -hd),
      new THREE.Vector3(hw, 0, hd),
      new THREE.Vector3(-hw, 0, hd),
      new THREE.Vector3(-hw, 0, -hd), // Close the loop
    ];
  }, [width, depth]);

  return (
    <group position={[x, y, z]}>
      {/* Floor - visible base */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial
          color={inkColor}
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Room outline border on floor */}
      <Line
        points={outlinePoints}
        color={inkColor}
        lineWidth={2}
        position={[0, 0.03, 0]}
      />

      {/* 3D walls group - NO TOP */}
      <group
        ref={groupRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* North Wall */}
        <mesh position={[0, height / 2, -depth / 2]} castShadow>
          <planeGeometry args={[width, height]} />
          <meshStandardMaterial
            color={inkColor}
            transparent
            opacity={wallOpacity}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* South Wall */}
        <mesh position={[0, height / 2, depth / 2]} rotation={[0, Math.PI, 0]} castShadow>
          <planeGeometry args={[width, height]} />
          <meshStandardMaterial
            color={inkColor}
            transparent
            opacity={wallOpacity}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* East Wall */}
        <mesh position={[width / 2, height / 2, 0]} rotation={[0, -Math.PI / 2, 0]} castShadow>
          <planeGeometry args={[depth, height]} />
          <meshStandardMaterial
            color={inkColor}
            transparent
            opacity={wallOpacity}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* West Wall */}
        <mesh position={[-width / 2, height / 2, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <planeGeometry args={[depth, height]} />
          <meshStandardMaterial
            color={inkColor}
            transparent
            opacity={wallOpacity}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Top edges to show room boundary (thin lines) */}
        <Line
          points={outlinePoints.map(p => new THREE.Vector3(p.x, height, p.z))}
          color={inkColor}
          lineWidth={1.5}
          opacity={0.4}
        />
      </group>

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
