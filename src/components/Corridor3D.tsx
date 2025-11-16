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

/**
 * Renders a corridor between two rooms with transparent top
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

  // Create corridor path
  const pathCurve = useMemo(() => {
    if (waypoints.length < 2) return null;
    const points: THREE.Vector3[] = waypoints.map(
      (wp) => new THREE.Vector3(wp.x, 0, wp.z)
    );
    return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.3);
  }, [waypoints]);

  // Create corridor segments for walls
  const corridorSegments = useMemo(() => {
    if (!pathCurve) return [];

    const segments: Array<{
      position: THREE.Vector3;
      rotation: number;
      width: number;
    }> = [];

    const divisions = 50;
    for (let i = 0; i < divisions; i++) {
      const t = i / divisions;
      const point = pathCurve.getPoint(t);
      const tangent = pathCurve.getTangent(t);
      const angle = Math.atan2(tangent.z, tangent.x);

      segments.push({
        position: point,
        rotation: angle,
        width: corridor.width / divisions,
      });
    }

    return segments;
  }, [pathCurve, corridor.width]);

  // Create border lines along corridor edges
  const { leftBorder, rightBorder } = useMemo(() => {
    if (!pathCurve) return { leftBorder: [], rightBorder: [] };

    const left: THREE.Vector3[] = [];
    const right: THREE.Vector3[] = [];
    const halfWidth = corridor.width / 2;

    const divisions = 50;
    for (let i = 0; i <= divisions; i++) {
      const t = i / divisions;
      const point = pathCurve.getPoint(t);
      const tangent = pathCurve.getTangent(t);

      // Perpendicular vector for width
      const perpX = -tangent.z;
      const perpZ = tangent.x;

      left.push(new THREE.Vector3(
        point.x + perpX * halfWidth,
        0.03,
        point.z + perpZ * halfWidth
      ));

      right.push(new THREE.Vector3(
        point.x - perpX * halfWidth,
        0.03,
        point.z - perpZ * halfWidth
      ));
    }

    return { leftBorder: left, rightBorder: right };
  }, [pathCurve, corridor.width]);

  if (!pathCurve || !isActive) return null;

  const inkColor = '#3d2817';
  const wallHeight = 1.5;

  return (
    <group>
      

      {/* Side walls - NO TOP */}
      {corridorSegments.map((segment, index) => {
        const halfWidth = corridor.width / 2;
        return (
          <React.Fragment key={`walls-${index}`}>
            {/* Left wall */}
            <mesh
              position={[
                segment.position.x + Math.cos(segment.rotation + Math.PI / 2) * halfWidth,
                wallHeight / 2,
                segment.position.z + Math.sin(segment.rotation + Math.PI / 2) * halfWidth,
              ]}
              rotation={[0, segment.rotation + Math.PI / 2, 0]}
            >
              <planeGeometry args={[segment.width * 1.1, wallHeight]} />
              <meshStandardMaterial
                color={inkColor}
                transparent
                opacity={0.08}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Right wall */}
            <mesh
              position={[
                segment.position.x - Math.cos(segment.rotation + Math.PI / 2) * halfWidth,
                wallHeight / 2,
                segment.position.z - Math.sin(segment.rotation + Math.PI / 2) * halfWidth,
              ]}
              rotation={[0, segment.rotation - Math.PI / 2, 0]}
            >
              <planeGeometry args={[segment.width * 1.1, wallHeight]} />
              <meshStandardMaterial
                color={inkColor}
                transparent
                opacity={0.08}
                side={THREE.DoubleSide}
              />
            </mesh>
          </React.Fragment>
        );
      })}

      {/* Border lines at floor level */}
      {leftBorder.length > 0 && (
        <>
          <Line
            points={leftBorder}
            color={inkColor}
            lineWidth={2}
          />
          <Line
            points={rightBorder}
            color={inkColor}
            lineWidth={2}
          />
        </>
      )}

      {/* Top edge borders */}
      {leftBorder.length > 0 && (
        <>
          <Line
            points={leftBorder.map(p => new THREE.Vector3(p.x, wallHeight, p.z))}
            color={inkColor}
            lineWidth={1.5}
            opacity={0.4}
          />
          <Line
            points={rightBorder.map(p => new THREE.Vector3(p.x, wallHeight, p.z))}
            color={inkColor}
            lineWidth={1.5}
            opacity={0.4}
          />
        </>
      )}
    </group>
  );
};
