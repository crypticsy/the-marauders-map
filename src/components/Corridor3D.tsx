import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Corridor } from '../map/Corridor';
import { Room } from '../map/Room';
import { Vector2 } from '../map/types';

interface Corridor3DProps {
  corridor: Corridor;
  roomA: Room;
  roomB: Room;
  isActive: boolean;
}

/**
 * Renders a hand-drawn style corridor between two rooms
 */
export const Corridor3D: React.FC<Corridor3DProps> = ({
  corridor,
  roomA,
  roomB,
  isActive,
}) => {
  const waypoints = useMemo(() => {
    return corridor.getWaypoints(roomA, roomB);
  }, [corridor, roomA, roomB]);

  // Create a hand-drawn style path using curves
  const pathCurve = useMemo(() => {
    if (waypoints.length < 2) return null;

    const points: THREE.Vector3[] = waypoints.map(
      (wp) => new THREE.Vector3(wp.x, 0.05, wp.z)
    );

    return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.3);
  }, [waypoints]);

  if (!pathCurve || !isActive) return null;

  return (
    <group>
      {/* Main corridor path - hand-drawn style */}
      <mesh>
        <tubeGeometry args={[pathCurve, 64, corridor.width / 2, 8, false]} />
        <meshStandardMaterial
          color="#8b6f47"
          transparent
          opacity={0.15}
          emissive="#5a3e2b"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Ink outline for hand-drawn effect */}
      <mesh>
        <tubeGeometry args={[pathCurve, 64, corridor.width / 2 + 0.05, 8, false]} />
        <meshStandardMaterial
          color="#000000"
          transparent
          opacity={0.2}
          wireframe
        />
      </mesh>

      {/* Render connection point markers (subtle) */}
      {waypoints.map((wp, index) => (
        <mesh key={index} position={[wp.x, 0.02, wp.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.15, 16]} />
          <meshStandardMaterial
            color="#8b6f47"
            transparent
            opacity={0.1}
          />
        </mesh>
      ))}
    </group>
  );
};
