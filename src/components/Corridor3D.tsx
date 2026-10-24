import React, { useMemo, useRef } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { Corridor } from '../map/Corridor';
import { Room } from '../map/Room';
import { Vector2 } from '../map/types';
import { INK, INK_FADED, FLOOR, WALL_HEIGHT, WALL_THICKNESS, revealDelay, useInkReveal } from './mapTheme';

interface Corridor3DProps {
  corridor: Corridor;
  roomA: Room;
  roomB: Room;
}

interface Piece {
  position: [number, number, number];
  length: number;
  rotationY: number;
}

/**
 * Offset a polyline sideways, mitring the corners so parallel walls stay
 * exactly one corridor-width apart around bends
 */
const offsetPolyline = (points: Vector2[], distance: number): Vector2[] =>
  points.map((point, i) => {
    const normalOf = (from: Vector2, to: Vector2) => {
      const dx = to.x - from.x;
      const dz = to.z - from.z;
      const length = Math.sqrt(dx * dx + dz * dz) || 1;
      return { x: -dz / length, z: dx / length };
    };
    const incoming = i > 0 ? normalOf(points[i - 1], point) : null;
    const outgoing = i < points.length - 1 ? normalOf(point, points[i + 1]) : null;

    if (incoming && outgoing) {
      const scale = distance / (1 + incoming.x * outgoing.x + incoming.z * outgoing.z);
      return { x: point.x + (incoming.x + outgoing.x) * scale, z: point.z + (incoming.z + outgoing.z) * scale };
    }
    const normal = (incoming || outgoing)!;
    return { x: point.x + normal.x * distance, z: point.z + normal.z * distance };
  });

/**
 * Turn a polyline into box placements; `extend` lengthens interior joints
 * so neighbouring pieces overlap and corners close cleanly
 */
const polylinePieces = (points: Vector2[], extend: number, y: number): Piece[] =>
  points.slice(0, -1).map((start, i) => {
    const end = points[i + 1];
    const dx = end.x - start.x;
    const dz = end.z - start.z;
    const length = Math.sqrt(dx * dx + dz * dz);
    const startExtra = i > 0 ? extend : 0;
    const endExtra = i < points.length - 2 ? extend : 0;
    const dirX = dx / (length || 1);
    const dirZ = dz / (length || 1);
    const shift = (endExtra - startExtra) / 2;
    return {
      position: [(start.x + end.x) / 2 + dirX * shift, y, (start.z + end.z) / 2 + dirZ * shift],
      length: length + startExtra + endExtra,
      rotationY: -Math.atan2(dz, dx),
    };
  });

/**
 * Renders a corridor between two rooms: an inked hallway indoors,
 * or a dashed footpath out on the grounds
 */
export const Corridor3D: React.FC<Corridor3DProps> = ({ corridor, roomA, roomB }) => {
  const groupRef = useRef<THREE.Group>(null);
  const waypoints = useMemo(() => corridor.getWaypoints(roomA, roomB), [corridor, roomA, roomB]);
  const halfWidth = corridor.width / 2;
  const isPath = corridor.style === 'path';

  const middle = waypoints[Math.floor(waypoints.length / 2)] || { x: 0, z: 0 };
  useInkReveal(groupRef, revealDelay(middle.x, middle.z));

  const { floors, leftWall, rightWall, leftEdge, rightEdge } = useMemo(() => {
    const left = offsetPolyline(waypoints, halfWidth);
    const right = offsetPolyline(waypoints, -halfWidth);
    const toLine = (points: Vector2[]) => points.map((p) => new THREE.Vector3(p.x, 0.05, p.z));
    return {
      floors: polylinePieces(waypoints, halfWidth, 0.015),
      leftWall: polylinePieces(left, WALL_THICKNESS / 2, WALL_HEIGHT / 2),
      rightWall: polylinePieces(right, WALL_THICKNESS / 2, WALL_HEIGHT / 2),
      leftEdge: toLine(left),
      rightEdge: toLine(right),
    };
  }, [waypoints, halfWidth]);

  if (waypoints.length < 2) return null;

  return (
    <group ref={groupRef}>
      {/* Floor */}
      {floors.map((piece, index) => (
        <mesh key={`floor-${index}`} position={piece.position} rotation={[-Math.PI / 2, 0, piece.rotationY]}>
          <planeGeometry args={[piece.length, corridor.width]} />
          <meshBasicMaterial color={FLOOR} transparent={isPath} opacity={isPath ? 0.55 : 1} />
        </mesh>
      ))}

      {isPath ? (
        // Footpath edges drawn as dashed ink
        <>
          <Line points={leftEdge} color={INK_FADED} lineWidth={1.5} dashed dashSize={0.6} gapSize={0.45} />
          <Line points={rightEdge} color={INK_FADED} lineWidth={1.5} dashed dashSize={0.6} gapSize={0.45} />
        </>
      ) : (
        // Hallway walls
        [...leftWall, ...rightWall].map((piece, index) => (
          <mesh key={`wall-${index}`} position={piece.position} rotation={[0, piece.rotationY, 0]}>
            <boxGeometry args={[piece.length + WALL_THICKNESS / 2, WALL_HEIGHT, WALL_THICKNESS]} />
            <meshStandardMaterial color={INK} roughness={1} />
          </mesh>
        ))
      )}
    </group>
  );
};
