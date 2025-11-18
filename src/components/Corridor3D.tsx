import React, { useMemo } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { Corridor } from '../map/Corridor';
import { Room } from '../map/Room';

interface Corridor3DProps {
  corridor: Corridor;
  roomA: Room;
  roomB: Room;
  isActive: boolean;
}

interface CorridorSegment {
  start: THREE.Vector3;
  end: THREE.Vector3;
  direction: THREE.Vector3;
  length: number;
  rotation: number;
  midPoint: THREE.Vector3;
}

/**
 * Renders a corridor between two rooms with straight segments and natural bends
 * Structure matches Room3D component for consistency
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

  // Create straight corridor segments between waypoints
  const segments = useMemo(() => {
    if (waypoints.length < 2) return [];

    const segs: CorridorSegment[] = [];

    for (let i = 0; i < waypoints.length - 1; i++) {
      const start = new THREE.Vector3(waypoints[i].x, 0, waypoints[i].z);
      const end = new THREE.Vector3(waypoints[i + 1].x, 0, waypoints[i + 1].z);

      const direction = new THREE.Vector3().subVectors(end, start).normalize();
      const length = start.distanceTo(end);
      const rotation = Math.atan2(direction.z, direction.x);
      const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

      segs.push({ start, end, direction, length, rotation, midPoint });
    }

    return segs;
  }, [waypoints]);

  // Create outline border points (similar to Room's outlinePoints)
  const outlinePoints = useMemo(() => {
    if (segments.length === 0) return { left: [], right: [] };

    const left: THREE.Vector3[] = [];
    const right: THREE.Vector3[] = [];
    const halfWidth = corridor.width / 2;

    segments.forEach((segment) => {
      const perpX = -segment.direction.z;
      const perpZ = segment.direction.x;

      left.push(new THREE.Vector3(
        segment.start.x + perpX * halfWidth,
        0.03,
        segment.start.z + perpZ * halfWidth
      ));

      right.push(new THREE.Vector3(
        segment.start.x - perpX * halfWidth,
        0.03,
        segment.start.z - perpZ * halfWidth
      ));
    });

    // Add final end point
    const lastSegment = segments[segments.length - 1];
    const perpX = -lastSegment.direction.z;
    const perpZ = lastSegment.direction.x;

    left.push(new THREE.Vector3(
      lastSegment.end.x + perpX * halfWidth,
      0.03,
      lastSegment.end.z + perpZ * halfWidth
    ));

    right.push(new THREE.Vector3(
      lastSegment.end.x - perpX * halfWidth,
      0.03,
      lastSegment.end.z - perpZ * halfWidth
    ));

    return { left, right };
  }, [segments, corridor.width]);

  if (segments.length === 0 || !isActive) return null;

  const inkColor = '#3d2817';
  const wallHeight = 1.8;
  const halfWidth = corridor.width / 2;

  return (
    <group>
      {/* Floor - similar to Room's floor */}
      {segments.map((segment, index) => (
        <mesh
          key={`floor-${index}`}
          position={[segment.midPoint.x, 0.02, segment.midPoint.z]}
          rotation={[-Math.PI / 2, 0, segment.rotation]}
          receiveShadow
        >
          <planeGeometry args={[segment.length, corridor.width]} />
          <meshStandardMaterial
            color={inkColor}
            transparent
            opacity={0.12}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Corridor outline border on floor - similar to Room's outline */}
      <Line points={outlinePoints.left} color={inkColor} lineWidth={2} />
      <Line points={outlinePoints.right} color={inkColor} lineWidth={2} />

      {/* Walls group - similar to Room's walls */}
      {segments.map((segment, index) => {
        const perpX = -segment.direction.z;
        const perpZ = segment.direction.x;

        return (
          <group key={`walls-${index}`}>
            {/* Left wall - runs along corridor, faces inward */}
            <mesh
              position={[
                segment.midPoint.x + perpX * halfWidth,
                wallHeight / 2,
                segment.midPoint.z + perpZ * halfWidth,
              ]}
              rotation={[0, segment.rotation, 0]}
              castShadow
            >
              <planeGeometry args={[segment.length, wallHeight]} />
              <meshStandardMaterial
                color={inkColor}
                transparent
                opacity={0.08}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Right wall - runs along corridor, faces inward */}
            <mesh
              position={[
                segment.midPoint.x - perpX * halfWidth,
                wallHeight / 2,
                segment.midPoint.z - perpZ * halfWidth,
              ]}
              rotation={[0, segment.rotation + Math.PI, 0]}
              castShadow
            >
              <planeGeometry args={[segment.length, wallHeight]} />
              <meshStandardMaterial
                color={inkColor}
                transparent
                opacity={0.08}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        );
      })}

      {/* Top edge borders - similar to Room's top edges */}
      <Line
        points={outlinePoints.left.map(p => new THREE.Vector3(p.x, wallHeight, p.z))}
        color={inkColor}
        lineWidth={1.5}
        opacity={0.4}
      />
      <Line
        points={outlinePoints.right.map(p => new THREE.Vector3(p.x, wallHeight, p.z))}
        color={inkColor}
        lineWidth={1.5}
        opacity={0.4}
      />

      {/* Arches spanning across corridor - unique to corridors */}
      {segments.map((segment, segIndex) => {
        const perpX = -segment.direction.z;
        const perpZ = segment.direction.x;
        const numArches = Math.max(2, Math.ceil(segment.length / 2));

        return Array.from({ length: numArches }).map((_, archIndex) => {
          const t = (archIndex + 0.5) / numArches;
          const archPos = new THREE.Vector3().lerpVectors(segment.start, segment.end, t);
          const archPoints: THREE.Vector3[] = [];

          // Create semicircular arch from left to right wall
          const steps = 10;
          for (let i = 0; i <= steps; i++) {
            const archT = i / steps;
            const angle = Math.PI * archT;
            const archY = wallHeight + Math.sin(angle) * 0.35;
            const offsetAcross = (archT - 0.5) * corridor.width;

            archPoints.push(new THREE.Vector3(
              archPos.x + perpX * offsetAcross,
              archY,
              archPos.z + perpZ * offsetAcross
            ));
          }

          return (
            <Line
              key={`arch-${segIndex}-${archIndex}`}
              points={archPoints}
              color={inkColor}
              lineWidth={1.5}
              opacity={0.4}
            />
          );
        });
      })}
    </group>
  );
};
