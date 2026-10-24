import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Line, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Character } from '../map/Character';
import { PlayerCharacter } from '../map/PlayerCharacter';
import { INK, PARCHMENT, FONT_ITALIC, seededRandom } from './mapTheme';

interface Character3DProps {
  character: Character | PlayerCharacter;
  isActive: boolean;
  isHighlighted?: boolean;
}

interface Footprint {
  x: number;
  z: number;
  rotation: number;
  isLeft: boolean;
  born: number; // Clock time the print was stamped
}

const TRAIL_STEPS = 6; // Prints visible behind a walker, whatever their speed
const POOL_SIZE = TRAIL_STEPS + 2; // Prints kept per character; the oldest is reused first
const STRIDE = 0.6; // Distance travelled between prints (alternating feet)
const FOOT_SIZE: [number, number] = [0.32, 0.8];
const FOOT_SPREAD = 0.15; // Sideways offset of each foot from the walking line
const INK_IN = 0.18; // Seconds for a fresh print to soak into the parchment
const HOLD = 0.5; // Seconds a print stays fully inked
const FADE = 0.9; // Seconds a print takes to fade away
const SETTLE_TIME = 0.35; // Standing still this long plants both feet side by side
const PRINT_OPACITY = 0.88;

// Shoe-sole prints (toe pointing up the texture); the right foot is the left mirrored
const footprintTextures: { left?: THREE.Texture; right?: THREE.Texture } = {};
const getFootprintTexture = (isLeft: boolean): THREE.Texture => {
  const key = isLeft ? 'left' : 'right';
  const cached = footprintTextures[key];
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;
  if (!isLeft) {
    ctx.translate(64, 0);
    ctx.scale(-1, 1);
  }
  ctx.fillStyle = INK;
  ctx.shadowColor = INK;
  ctx.shadowBlur = 3; // Slight ink bleed at the edges

  // Sole: toe box bulging toward the big toe, curving in at the arch
  ctx.beginPath();
  ctx.moveTo(26, 6);
  ctx.bezierCurveTo(44, 2, 60, 16, 59, 40);
  ctx.bezierCurveTo(58, 60, 50, 74, 44, 90);
  ctx.bezierCurveTo(36, 94, 24, 94, 14, 90);
  ctx.bezierCurveTo(6, 72, 3, 46, 6, 28);
  ctx.bezierCurveTo(9, 14, 15, 8, 26, 6);
  ctx.fill();

  // Block heel
  ctx.beginPath();
  ctx.moveTo(18, 106);
  ctx.lineTo(42, 106);
  ctx.quadraticCurveTo(46, 106, 46, 110);
  ctx.lineTo(46, 138);
  ctx.bezierCurveTo(46, 152, 38, 156, 30, 156);
  ctx.bezierCurveTo(22, 156, 14, 152, 14, 138);
  ctx.lineTo(14, 110);
  ctx.quadraticCurveTo(14, 106, 18, 106);
  ctx.fill();

  // Dry-ink speckles so each print looks stamped rather than painted
  const random = seededRandom(isLeft ? 17 : 29);
  ctx.globalCompositeOperation = 'destination-out';
  ctx.shadowBlur = 0;
  for (let i = 0; i < 14; i++) {
    ctx.fillStyle = `rgba(0, 0, 0, ${0.25 + random() * 0.35})`;
    ctx.beginPath();
    ctx.arc(10 + random() * 44, 10 + random() * 140, 1 + random() * 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  footprintTextures[key] = texture;
  return texture;
};

/**
 * Scroll-style banner shape with notched ends, sized around the name
 */
const bannerShape = (width: number, height: number): { shape: THREE.Shape; outline: THREE.Vector3[] } => {
  const hw = width / 2;
  const hh = height / 2;
  const notch = height * 0.45;
  const points = [
    new THREE.Vector2(-hw - notch, hh),
    new THREE.Vector2(hw + notch, hh),
    new THREE.Vector2(hw, 0),
    new THREE.Vector2(hw + notch, -hh),
    new THREE.Vector2(-hw - notch, -hh),
    new THREE.Vector2(-hw, 0),
  ];
  return {
    shape: new THREE.Shape(points),
    outline: [...points, points[0]].map((p) => new THREE.Vector3(p.x, p.y, 0.01)),
  };
};

/**
 * Renders a character as inked footprints that stamp onto the parchment and fade,
 * plus a name banner. Prints live in a fixed pool of meshes updated every frame,
 * so walking never triggers React re-renders.
 */
export const Character3D: React.FC<Character3DProps> = ({ character, isActive, isHighlighted = false }) => {
  const currentRef = useRef<THREE.Group>(null);
  const bannerRef = useRef<THREE.Group>(null);
  const printRefs = useRef<Array<THREE.Mesh | null>>([]);

  const movement = useRef({
    previous: null as { x: number; z: number } | null,
    sinceStep: 0,
    heading: 0,
    nextIsLeft: true,
    stillFor: 0,
    settled: false,
    prints: [] as Footprint[],
    // Failsafe for genuinely stuck characters (not resting)
    stuckCheck: null as { x: number; z: number } | null,
    lastProgressTime: 0,
    triedToMove: false,
  });

  const textures = useMemo(() => ({ left: getFootprintTexture(true), right: getFootprintTexture(false) }), []);

  const banner = useMemo(() => {
    const width = character.name.length * 0.2 + 0.1;
    return { width, ...bannerShape(width, 0.62) };
  }, [character.name]);

  useFrame((state, delta) => {
    if (!isActive) return;
    const m = movement.current;
    const now = state.clock.elapsedTime;
    const oldPos = m.previous || character.getPosition2D();

    character.update(delta);

    const newPos = character.getPosition2D();
    m.previous = { ...newPos };
    const distance = Math.hypot(newPos.x - oldPos.x, newPos.z - oldPos.z);

    if (distance > 0.001) m.triedToMove = true;
    if (distance > 0.002) m.heading = Math.atan2(newPos.z - oldPos.z, newPos.x - oldPos.x);

    // Reset characters that keep trying to move but make no progress
    if (!m.stuckCheck) {
      m.stuckCheck = { ...newPos };
      m.lastProgressTime = now;
    } else if (Math.hypot(newPos.x - m.stuckCheck.x, newPos.z - m.stuckCheck.z) > 0.5) {
      m.stuckCheck = { ...newPos };
      m.lastProgressTime = now;
      m.triedToMove = false;
    } else if (m.triedToMove && now - m.lastProgressTime > 8) {
      console.log(`${character.name} is stuck in wall! Resetting...`);
      character.reset();
      m.stuckCheck = null;
      m.triedToMove = false;
    }

    const stamp = (x: number, z: number, isLeft: boolean) => {
      const side = isLeft ? FOOT_SPREAD : -FOOT_SPREAD; // Left foot sits to the left of the heading
      m.prints.push({
        x: x + Math.cos(m.heading - Math.PI / 2) * side,
        z: z + Math.sin(m.heading - Math.PI / 2) * side,
        rotation: m.heading,
        isLeft,
        born: now,
      });
      if (m.prints.length > POOL_SIZE) m.prints.shift();
    };

    if (distance > 0.0005) {
      // Walking: stamp alternating feet every stride
      m.stillFor = 0;
      m.settled = false;
      m.sinceStep += distance;
      if (m.sinceStep >= STRIDE || m.prints.length === 0) {
        m.sinceStep = 0;
        stamp(newPos.x, newPos.z, m.nextIsLeft);
        m.nextIsLeft = !m.nextIsLeft;
      }
    } else {
      // Standing: bring the trailing foot alongside the last print
      m.stillFor += delta;
      if (!m.settled && m.stillFor > SETTLE_TIME && m.prints.length > 0) {
        const last = m.prints[m.prints.length - 1];
        const lastSide = last.isLeft ? FOOT_SPREAD : -FOOT_SPREAD;
        const centerX = last.x - Math.cos(last.rotation - Math.PI / 2) * lastSide;
        const centerZ = last.z - Math.sin(last.rotation - Math.PI / 2) * lastSide;
        m.heading = last.rotation;
        stamp(centerX, centerZ, !last.isLeft);
        m.nextIsLeft = last.isLeft;
        m.settled = true;
      }
    }

    // Animate the pool: ink in with a small stamp, hold, then fade out.
    // The newest pair never fades, so a standing character keeps both feet on the map.
    const newestPair = m.prints.length - 2;
    for (let i = 0; i < POOL_SIZE; i++) {
      const mesh = printRefs.current[i];
      if (!mesh) continue;
      const print = m.prints[i];
      if (!print) {
        mesh.visible = false;
        continue;
      }

      const age = now - print.born;
      const inked = Math.min(age / INK_IN, 1);
      const faded = i >= newestPair ? 1 : 1 - Math.min(Math.max((age - HOLD) / FADE, 0), 1);
      // Taper the tail so fast walkers don't drag a long line of prints
      const stepsBehind = m.prints.length - 1 - i;
      const tapered = Math.min(Math.max((TRAIL_STEPS - stepsBehind) / 3, 0), 1);
      const opacity = PRINT_OPACITY * inked * faded * tapered;
      mesh.visible = opacity > 0.01;
      if (!mesh.visible) continue;

      const material = mesh.material as THREE.MeshBasicMaterial;
      material.opacity = opacity;
      const map = print.isLeft ? textures.left : textures.right;
      if (material.map !== map) material.map = map;

      mesh.position.set(print.x, 0.075 + i * 0.0005, print.z);
      mesh.rotation.set(-Math.PI / 2, 0, -print.rotation - Math.PI / 2);
      mesh.scale.setScalar(1 + (1 - inked) * 0.3);
    }

    // Banner follows the character and grows as the camera pulls back so names stay readable
    if (currentRef.current) currentRef.current.position.set(newPos.x, 0, newPos.z);
    if (bannerRef.current && currentRef.current) {
      const cameraDistance = state.camera.position.distanceTo(currentRef.current.position);
      const scale = Math.min(Math.max(cameraDistance / 26, 1), 3.2) * (isHighlighted ? 1.35 : 1);
      bannerRef.current.scale.setScalar(scale);
      bannerRef.current.position.y = 1.2 + scale * 0.35;
    }
  });

  if (!isActive) return null;

  return (
    <group>
      {/* Footprint pool, positioned and faded each frame */}
      {Array.from({ length: POOL_SIZE }, (_, index) => (
        <mesh key={index} ref={(mesh) => (printRefs.current[index] = mesh)} visible={false}>
          <planeGeometry args={FOOT_SIZE} />
          <meshBasicMaterial map={textures.left} transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}

      <group ref={currentRef}>
        {/* Name on a little scroll banner that always faces the viewer */}
        <Billboard ref={bannerRef} position={[0, 1.5, 0]}>
          <mesh>
            <shapeGeometry args={[banner.shape]} />
            <meshBasicMaterial color={PARCHMENT} />
          </mesh>
          <Line points={banner.outline} color={INK} lineWidth={1.4} />
          <Text position={[0, -0.02, 0.02]} fontSize={0.38} color={INK} anchorX="center" anchorY="middle" font={FONT_ITALIC}>
            {character.name}
          </Text>
        </Billboard>
      </group>
    </group>
  );
};
