import { useRef, RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Shared look & feel for everything drawn on the parchment
 */
export const INK = '#2e1d10';
export const INK_FADED = '#5a3f26';
export const PARCHMENT = '#e3cb9c';
export const FLOOR = '#dcc08c';

export const WALL_HEIGHT = 0.7;
export const WALL_THICKNESS = 0.34;

// Self-hosted so labels never fall back to a default font
const base = import.meta.env.BASE_URL;
export const FONT_REGULAR = `${base}fonts/IMFellEnglish-Regular.ttf`;
export const FONT_ITALIC = `${base}fonts/IMFellEnglish-Italic.ttf`;
export const FONT_CAPS = `${base}fonts/IMFellEnglishSC-Regular.ttf`;

// Ink spreads outward from the Great Hall when the map opens
export const REVEAL_SPEED = 28; // Units per second
export const REVEAL_DURATION = 1.1; // Seconds for one element to fade in

export const revealDelay = (x: number, z: number): number =>
  0.3 + Math.sqrt(x * x + z * z) / REVEAL_SPEED;

/**
 * Fade every material inside a group in from nothing, after a delay,
 * so the map appears to ink itself onto the parchment
 */
export const useInkReveal = (groupRef: RefObject<THREE.Object3D>, delay: number) => {
  const state = useRef<{ start: number | null; targets: Array<{ material: THREE.Material; opacity: number; transparent: boolean }>; done: boolean }>({
    start: null,
    targets: [],
    done: false,
  });

  useFrame(({ clock }) => {
    const reveal = state.current;
    if (reveal.done || !groupRef.current) return;

    if (reveal.start === null) {
      reveal.start = clock.elapsedTime;
      groupRef.current.traverse((object) => {
        const materials = (object as THREE.Mesh).material;
        if (!materials) return;
        (Array.isArray(materials) ? materials : [materials]).forEach((material) => {
          reveal.targets.push({ material, opacity: material.opacity, transparent: material.transparent });
          material.transparent = true;
          material.opacity = 0;
          material.needsUpdate = true;
        });
      });
    }

    const progress = Math.min(Math.max((clock.elapsedTime - reveal.start - delay) / REVEAL_DURATION, 0), 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    reveal.targets.forEach(({ material, opacity }) => {
      material.opacity = opacity * eased;
    });

    if (progress >= 1) {
      reveal.targets.forEach(({ material, opacity, transparent }) => {
        material.opacity = opacity;
        material.transparent = transparent;
        material.needsUpdate = true;
      });
      reveal.done = true;
    }
  });
};

// Deterministic randomness so the hand-drawn wobble is stable between renders
export const seededRandom = (seed: number) => {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
};

const textureCache = new Map<string, THREE.Texture>();

const cachedTexture = (key: string, draw: (ctx: CanvasRenderingContext2D, size: number) => void, size = 256) => {
  const cached = textureCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  draw(canvas.getContext('2d')!, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  textureCache.set(key, texture);
  return texture;
};

/**
 * Floor patterns, drawn in faint ink on a transparent canvas
 */
export const getFloorTexture = (floor: 'stone' | 'grass' | 'wood'): THREE.Texture =>
  cachedTexture(`floor-${floor}`, (ctx, size) => {
    const random = seededRandom(floor.length * 97);
    ctx.strokeStyle = 'rgba(46, 29, 16, 0.55)';
    ctx.lineCap = 'round';

    if (floor === 'stone') {
      // Staggered flagstones
      const rows = 4;
      const rowHeight = size / rows;
      ctx.lineWidth = 2;
      for (let row = 0; row < rows; row++) {
        const y = row * rowHeight;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(size, y);
        ctx.stroke();
        const shift = row % 2 === 0 ? 0 : size / 4;
        for (let x = shift; x < size + 1; x += size / 2) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + (random() - 0.5) * 4, y + rowHeight);
          ctx.stroke();
        }
      }
    } else if (floor === 'wood') {
      // Long planks
      ctx.lineWidth = 1.5;
      for (let y = 0; y < size; y += size / 8) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(size, y);
        ctx.stroke();
      }
    } else {
      // Grass tufts
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 40; i++) {
        const x = random() * size;
        const y = random() * size;
        for (let blade = -1; blade <= 1; blade++) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + blade * 4, y - 7 - random() * 3);
          ctx.stroke();
        }
      }
    }
  });

/**
 * Wavy ripple lines for water
 */
export const getWaterTexture = (): THREE.Texture =>
  cachedTexture('water', (ctx, size) => {
    const random = seededRandom(11);
    ctx.strokeStyle = 'rgba(46, 29, 16, 0.5)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    for (let i = 0; i < 18; i++) {
      const x = random() * size;
      const y = random() * size;
      ctx.beginPath();
      for (let t = 0; t <= 24; t++) {
        const px = x + t * 1.6;
        const py = y + Math.sin(t / 2.4) * 3;
        if (t === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  });

/**
 * Top-down tree canopy doodle used by forests and lone trees
 */
export const getTreeTexture = (): THREE.Texture =>
  cachedTexture('tree', (ctx, size) => {
    const center = size / 2;
    const random = seededRandom(5);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Scalloped canopy outline
    ctx.beginPath();
    const lobes = 9;
    for (let i = 0; i <= lobes; i++) {
      const angle = (i / lobes) * Math.PI * 2;
      const nextAngle = ((i + 1) / lobes) * Math.PI * 2;
      const radius = size * 0.4 + random() * size * 0.04;
      const x = center + Math.cos(angle) * radius;
      const y = center + Math.sin(angle) * radius;
      const cx = center + Math.cos((angle + nextAngle) / 2) * radius * 1.22;
      const cy = center + Math.sin((angle + nextAngle) / 2) * radius * 1.22;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.quadraticCurveTo(cx, cy, x, y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(205, 176, 124, 1)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(46, 29, 16, 0.95)';
    ctx.lineWidth = size * 0.05;
    ctx.stroke();

    // Inner leaf hatching
    ctx.lineWidth = size * 0.025;
    ctx.strokeStyle = 'rgba(46, 29, 16, 0.75)';
    for (let i = 0; i < 6; i++) {
      const angle = random() * Math.PI * 2;
      const radius = size * (0.1 + random() * 0.18);
      const x = center + Math.cos(angle) * radius;
      const y = center + Math.sin(angle) * radius;
      ctx.beginPath();
      ctx.arc(x, y, size * 0.06, Math.PI * 0.9, Math.PI * 1.9);
      ctx.stroke();
    }
  }, 128);

/**
 * Compass rose for the corner of the map
 */
export const getCompassTexture = (): THREE.Texture =>
  cachedTexture('compass', (ctx, size) => {
    const c = size / 2;
    ctx.strokeStyle = INK;
    ctx.fillStyle = INK;
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.arc(c, c, size * 0.36, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(c, c, size * 0.32, 0, Math.PI * 2);
    ctx.stroke();

    // Eight-pointed star, alternating filled and outlined halves
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
      const length = i % 2 === 0 ? size * 0.44 : size * 0.26;
      const side = size * 0.06;
      const tipX = c + Math.cos(angle) * length;
      const tipY = c + Math.sin(angle) * length;
      const leftX = c + Math.cos(angle - Math.PI / 2) * side;
      const leftY = c + Math.sin(angle - Math.PI / 2) * side;
      const rightX = c + Math.cos(angle + Math.PI / 2) * side;
      const rightY = c + Math.sin(angle + Math.PI / 2) * side;

      ctx.beginPath();
      ctx.moveTo(c, c);
      ctx.lineTo(leftX, leftY);
      ctx.lineTo(tipX, tipY);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(c, c);
      ctx.lineTo(rightX, rightY);
      ctx.lineTo(tipX, tipY);
      ctx.closePath();
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.font = `${size * 0.09}px "IM Fell English", serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', c, size * 0.03 + size * 0.02);
    ctx.fillText('S', c, size * 0.95);
    ctx.fillText('E', size * 0.96, c);
    ctx.fillText('W', size * 0.04, c);
  }, 512);
