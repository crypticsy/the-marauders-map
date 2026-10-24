import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { Line, Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { DecorationConfig, Vector2 } from '../map/types';
import { MAP_BOUNDS } from '../map/MapData';
import {
  INK,
  INK_FADED,
  PARCHMENT,
  FONT_ITALIC,
  FONT_CAPS,
  getWaterTexture,
  getTreeTexture,
  getCompassTexture,
  revealDelay,
  seededRandom,
  useInkReveal,
} from './mapTheme';

const MAP_WIDTH = MAP_BOUNDS.maxX - MAP_BOUNDS.minX;
const MAP_DEPTH = MAP_BOUNDS.maxZ - MAP_BOUNDS.minZ;
const MAP_CENTER = { x: (MAP_BOUNDS.minX + MAP_BOUNDS.maxX) / 2, z: (MAP_BOUNDS.minZ + MAP_BOUNDS.maxZ) / 2 };

const flatLine = (points: Vector2[], y = 0.04) => points.map((p) => new THREE.Vector3(p.x, y, p.z));

const centroid = (points: Vector2[]): Vector2 => ({
  x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
  z: points.reduce((sum, p) => sum + p.z, 0) / points.length,
});

const isInsidePolygon = (point: Vector2, polygon: Vector2[]): boolean => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i];
    const b = polygon[j];
    if (a.z > point.z !== b.z > point.z && point.x < ((b.x - a.x) * (point.z - a.z)) / (b.z - a.z) + a.x) {
      inside = !inside;
    }
  }
  return inside;
};

// Smooth a rough outline into a closed hand-drawn curve
const smoothOutline = (points: Vector2[], samples = 120): Vector2[] => {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(p.x, 0, p.z)), true, 'centripetal');
  return curve.getPoints(samples).map((p) => ({ x: p.x, z: p.z }));
};

const shrinkTowards = (points: Vector2[], center: Vector2, amount: number): Vector2[] =>
  points.map((p) => ({ x: center.x + (p.x - center.x) * amount, z: center.z + (p.z - center.z) * amount }));

/**
 * Italic place name with a parchment halo so it stays legible over ink
 */
const PlaceLabel: React.FC<{ text: string; position: Vector2; size: number; caps?: boolean; y?: number }> = ({
  text,
  position,
  size,
  caps = false,
  y = 0.3,
}) => (
  <Text
    position={[position.x, y, position.z]}
    rotation={[-Math.PI / 2, 0, 0]}
    fontSize={size}
    anchorX="center"
    anchorY="middle"
    color={INK}
    font={caps ? FONT_CAPS : FONT_ITALIC}
    outlineWidth={size * 0.12}
    outlineColor={PARCHMENT}
  >
    {text}
  </Text>
);

/**
 * Wrap a decoration so it inks in with the rest of the map
 */
const Reveal: React.FC<{ at: Vector2; extraDelay?: number; children: React.ReactNode }> = ({ at, extraDelay = 0, children }) => {
  const groupRef = useRef<THREE.Group>(null);
  useInkReveal(groupRef, revealDelay(at.x, at.z) + extraDelay);
  return <group ref={groupRef}>{children}</group>;
};

/**
 * The parchment sheet itself: paper texture, scorched edges, and a ruled border
 */
export const Parchment: React.FC = () => {
  const paper = useTexture(`${import.meta.env.BASE_URL}textures/old-paper.jpg`);

  const scorch = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;
    const random = seededRandom(42);

    // Darken toward every edge
    const edges: Array<[number, number, number, number]> = [
      [0, 0, 0, 1024],
      [0, 1024, 0, 0],
      [0, 0, 1024, 0],
      [1024, 0, 0, 0],
    ];
    edges.forEach(([x0, y0, x1, y1]) => {
      const gradient = ctx.createLinearGradient(x0, y0, x0 + (x1 - x0) * 0.09, y0 + (y1 - y0) * 0.09);
      gradient.addColorStop(0, 'rgba(70, 42, 18, 0.75)');
      gradient.addColorStop(1, 'rgba(70, 42, 18, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1024, 1024);
    });

    // Soft age stains
    for (let i = 0; i < 26; i++) {
      const x = random() * 1024;
      const y = random() * 1024;
      const radius = 20 + random() * 70;
      const stain = ctx.createRadialGradient(x, y, 0, x, y, radius);
      stain.addColorStop(0, `rgba(110, 72, 36, ${0.06 + random() * 0.08})`);
      stain.addColorStop(1, 'rgba(110, 72, 36, 0)');
      ctx.fillStyle = stain;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  const paperTexture = useMemo(() => {
    const texture = paper.clone();
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);
    texture.needsUpdate = true;
    return texture;
  }, [paper]);

  const border = (inset: number) => {
    const { minX, maxX, minZ, maxZ } = MAP_BOUNDS;
    return flatLine(
      [
        { x: minX + inset, z: minZ + inset },
        { x: maxX - inset, z: minZ + inset },
        { x: maxX - inset, z: maxZ - inset },
        { x: minX + inset, z: maxZ - inset },
        { x: minX + inset, z: minZ + inset },
      ],
      0.05
    );
  };

  const corners: Vector2[] = [
    { x: MAP_BOUNDS.minX + 2.4, z: MAP_BOUNDS.minZ + 2.4 },
    { x: MAP_BOUNDS.maxX - 2.4, z: MAP_BOUNDS.minZ + 2.4 },
    { x: MAP_BOUNDS.maxX - 2.4, z: MAP_BOUNDS.maxZ - 2.4 },
    { x: MAP_BOUNDS.minX + 2.4, z: MAP_BOUNDS.maxZ - 2.4 },
  ];

  return (
    <group>
      {/* Shadow under the sheet so it reads as paper lying on a desk */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[MAP_CENTER.x + 1.2, -0.2, MAP_CENTER.z + 1.6]}>
        <planeGeometry args={[MAP_WIDTH + 2, MAP_DEPTH + 2]} />
        <meshBasicMaterial color="#3d2817" transparent opacity={0.22} depthWrite={false} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[MAP_CENTER.x, 0, MAP_CENTER.z]}>
        <planeGeometry args={[MAP_WIDTH, MAP_DEPTH]} />
        <meshBasicMaterial map={paperTexture} color="#f3dfb6" />
      </mesh>

      {/* Wash of pale parchment so the paper grain stays subtle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[MAP_CENTER.x, 0.003, MAP_CENTER.z]}>
        <planeGeometry args={[MAP_WIDTH, MAP_DEPTH]} />
        <meshBasicMaterial color="#ead7b0" transparent opacity={0.55} depthWrite={false} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[MAP_CENTER.x, 0.005, MAP_CENTER.z]}>
        <planeGeometry args={[MAP_WIDTH, MAP_DEPTH]} />
        <meshBasicMaterial map={scorch} transparent depthWrite={false} />
      </mesh>

      {/* Double ruled border with corner rosettes */}
      <Reveal at={{ x: 0, z: 0 }} extraDelay={1.2}>
        <Line points={border(2.4)} color={INK} lineWidth={2.2} />
        <Line points={border(3.3)} color={INK} lineWidth={1} />
        {corners.map((corner, index) => (
          <group key={index} position={[corner.x, 0.05, corner.z]}>
            <mesh rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
              <planeGeometry args={[1.5, 1.5]} />
              <meshBasicMaterial color={INK} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, Math.PI / 4]} position={[0, 0.01, 0]}>
              <planeGeometry args={[0.8, 0.8]} />
              <meshBasicMaterial color={PARCHMENT} />
            </mesh>
          </group>
        ))}
      </Reveal>
    </group>
  );
};

/**
 * "Messrs Moony, Wormtail, Padfoot & Prongs..." title block across the top
 */
export const TitleCartouche: React.FC = () => {
  const top = MAP_BOUNDS.minZ + 4.6;
  const frame = flatLine([
    { x: -19, z: top - 0.6 },
    { x: 19, z: top - 0.6 },
    { x: 19, z: top + 9.4 },
    { x: -19, z: top + 9.4 },
    { x: -19, z: top - 0.6 },
  ]);

  return (
    <Reveal at={{ x: 0, z: 0 }} extraDelay={1.4}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, top + 4.4]}>
        <planeGeometry args={[38, 10]} />
        <meshBasicMaterial color={PARCHMENT} transparent opacity={0.65} />
      </mesh>
      <Line points={frame} color={INK} lineWidth={1.6} />
      <Line points={flatLine([{ x: -12, z: top + 5.9 }, { x: 12, z: top + 5.9 }])} color={INK_FADED} lineWidth={1} />
      <Text position={[0, 0.06, top + 0.9]} rotation={[-Math.PI / 2, 0, 0]} fontSize={1.05} anchorX="center" anchorY="middle" color={INK} font={FONT_ITALIC}>
        Messrs Moony, Wormtail, Padfoot &amp; Prongs
      </Text>
      <Text position={[0, 0.06, top + 2.4]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.78} anchorX="center" anchorY="middle" color={INK} font={FONT_ITALIC}>
        Purveyors of Aids to Magical Mischief-Makers
      </Text>
      <Text position={[0, 0.06, top + 3.7]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.78} anchorX="center" anchorY="middle" color={INK} font={FONT_ITALIC}>
        are proud to present
      </Text>
      <Text position={[0, 0.06, top + 7.7]} rotation={[-Math.PI / 2, 0, 0]} fontSize={2.6} letterSpacing={0.06} anchorX="center" anchorY="middle" color={INK} font={FONT_CAPS}>
        The Marauder's Map
      </Text>
    </Reveal>
  );
};

export const CompassRose: React.FC<{ position: Vector2; size: number }> = ({ position, size }) => (
  <Reveal at={position} extraDelay={0.6}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[position.x, 0.04, position.z]}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial map={getCompassTexture()} transparent depthWrite={false} />
    </mesh>
  </Reveal>
);

const Lake: React.FC<{ decoration: Extract<DecorationConfig, { kind: 'lake' }> }> = ({ decoration }) => {
  const { outline, shape, center } = useMemo(() => {
    const smooth = smoothOutline(decoration.outline);
    const lakeShape = new THREE.Shape(smooth.map((p) => new THREE.Vector2(p.x, -p.z)));
    return { outline: smooth, shape: lakeShape, center: centroid(decoration.outline) };
  }, [decoration]);

  const water = useMemo(() => {
    const texture = getWaterTexture().clone();
    texture.repeat.set(0.12, 0.12);
    texture.needsUpdate = true;
    return texture;
  }, []);

  return (
    <Reveal at={center}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <shapeGeometry args={[shape]} />
        <meshBasicMaterial color="#cfb07c" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
        <shapeGeometry args={[shape]} />
        <meshBasicMaterial map={water} transparent opacity={0.7} depthWrite={false} />
      </mesh>
      <Line points={flatLine([...outline, outline[0]])} color={INK} lineWidth={2.2} />
      <Line points={flatLine(shrinkTowards([...outline, outline[0]], center, 0.93))} color={INK_FADED} lineWidth={1} />
      <PlaceLabel text={decoration.name} position={center} size={1.5} />
    </Reveal>
  );
};

const Forest: React.FC<{ decoration: Extract<DecorationConfig, { kind: 'forest' }> }> = ({ decoration }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Jittered grid of trees, kept inside the outline
  const trees = useMemo(() => {
    const random = seededRandom(7);
    const xs = decoration.outline.map((p) => p.x);
    const zs = decoration.outline.map((p) => p.z);
    const spacing = 2.3 / decoration.density;
    const placed: Array<{ x: number; z: number; scale: number; rotation: number }> = [];
    for (let x = Math.min(...xs); x <= Math.max(...xs); x += spacing) {
      for (let z = Math.min(...zs); z <= Math.max(...zs); z += spacing) {
        const point = { x: x + (random() - 0.5) * spacing * 0.9, z: z + (random() - 0.5) * spacing * 0.9 };
        if (isInsidePolygon(point, decoration.outline)) {
          placed.push({ ...point, scale: 1.9 + random() * 1.2, rotation: random() * Math.PI * 2 });
        }
      }
    }
    // Draw back-to-front so nearer canopies overlap farther ones
    return placed.sort((a, b) => a.z - b.z);
  }, [decoration]);

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    const matrix = new THREE.Matrix4();
    const rotation = new THREE.Quaternion();
    const tilt = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
    trees.forEach((tree, index) => {
      rotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), tree.rotation).multiply(tilt);
      matrix.compose(
        new THREE.Vector3(tree.x, 0.06 + index * 0.0004, tree.z),
        rotation,
        new THREE.Vector3(tree.scale, tree.scale, tree.scale)
      );
      meshRef.current!.setMatrixAt(index, matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [trees]);

  const center = centroid(decoration.outline);

  return (
    <Reveal at={center}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, trees.length]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={getTreeTexture()} transparent alphaTest={0.4} />
      </instancedMesh>
      <PlaceLabel text={decoration.name} position={{ x: center.x - 2, z: center.z + 2 }} size={1.6} y={0.8} />
    </Reveal>
  );
};

const Pitch: React.FC<{ decoration: Extract<DecorationConfig, { kind: 'pitch' }> }> = ({ decoration }) => {
  const { position, size } = decoration;

  const ellipse = (rx: number, rz: number, cx = position.x, cz = position.z) =>
    flatLine(
      Array.from({ length: 73 }, (_, i) => {
        const angle = (i / 72) * Math.PI * 2;
        return { x: cx + Math.cos(angle) * rx, z: cz + Math.sin(angle) * rz };
      })
    );

  // Three goal hoops at each end of the pitch
  const hoops = [-1, 1].flatMap((end) =>
    [-2.2, 0, 2.2].map((offset) => ({ x: position.x + offset, z: position.z + end * (size.z / 2 - 2.4) }))
  );

  return (
    <Reveal at={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[position.x, 0.02, position.z]} scale={[size.x / 2, size.z / 2, 1]}>
        <circleGeometry args={[1, 64]} />
        <meshBasicMaterial color="#d8bd88" />
      </mesh>
      <Line points={ellipse(size.x / 2, size.z / 2)} color={INK} lineWidth={2} />
      <Line points={ellipse(size.x / 2 - 0.8, size.z / 2 - 0.8)} color={INK_FADED} lineWidth={1} />
      <Line points={ellipse(1.6, 1.6)} color={INK_FADED} lineWidth={1} />
      <Line
        points={flatLine([{ x: position.x - size.x / 2 + 0.8, z: position.z }, { x: position.x + size.x / 2 - 0.8, z: position.z }])}
        color={INK_FADED}
        lineWidth={1}
      />
      {hoops.map((hoop, index) => (
        <Line key={index} points={ellipse(0.5, 0.5, hoop.x, hoop.z)} color={INK} lineWidth={1.6} />
      ))}
      <PlaceLabel text={decoration.name} position={{ x: position.x, z: position.z + 5 }} size={1.2} />
    </Reveal>
  );
};

const LoneTree: React.FC<{ decoration: Extract<DecorationConfig, { kind: 'tree' }> }> = ({ decoration }) => {
  const { position, radius } = decoration;

  // Thrashing branches sketched around the canopy
  const branches = useMemo(() => {
    const random = seededRandom(3);
    return Array.from({ length: 9 }, (_, i) => {
      const angle = (i / 9) * Math.PI * 2 + random() * 0.3;
      const points: Vector2[] = [];
      for (let t = 0; t <= 6; t++) {
        const r = radius * (0.9 + t * 0.12);
        const wobble = Math.sin(t * 1.4 + i) * 0.18;
        points.push({ x: position.x + Math.cos(angle + wobble) * r, z: position.z + Math.sin(angle + wobble) * r });
      }
      return flatLine(points, 0.07);
    });
  }, [position, radius]);

  return (
    <Reveal at={position}>
      {branches.map((points, index) => (
        <Line key={index} points={points} color={INK} lineWidth={1.4} />
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[position.x, 0.08, position.z]}>
        <planeGeometry args={[radius * 2.2, radius * 2.2]} />
        <meshBasicMaterial map={getTreeTexture()} transparent alphaTest={0.4} />
      </mesh>
      <PlaceLabel text={decoration.name} position={{ x: position.x, z: position.z - radius - 1.6 }} size={0.85} />
    </Reveal>
  );
};

const Passage: React.FC<{ decoration: Extract<DecorationConfig, { kind: 'passage' }> }> = ({ decoration }) => {
  const points = decoration.points;
  const end = points[points.length - 1];
  const before = points[points.length - 2];
  const curve = useMemo(() => {
    if (points.length < 3) return flatLine(points, 0.09);
    const spline = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(p.x, 0.09, p.z)));
    return spline.getPoints(points.length * 16);
  }, [points]);

  // Keep the label just inside the border, beside the passage's end
  const labelAt = {
    x: Math.min(Math.max(end.x, MAP_BOUNDS.minX + 12), MAP_BOUNDS.maxX - 12),
    z: Math.min(Math.max(end.z + Math.sign(end.z - before.z) * 1.2, MAP_BOUNDS.minZ + 5), MAP_BOUNDS.maxZ - 4.6),
  };

  return (
    <Reveal at={points[0]} extraDelay={1.6}>
      <Line points={curve} color={INK_FADED} lineWidth={1.6} dashed dashSize={0.35} gapSize={0.45} />
      <PlaceLabel text={decoration.name} position={labelAt} size={0.75} />
    </Reveal>
  );
};

const Stairs: React.FC<{ decoration: Extract<DecorationConfig, { kind: 'stairs' }> }> = ({ decoration }) => {
  const { position, size, direction } = decoration;
  const lines = useMemo(() => {
    const result: THREE.Vector3[][] = [];
    const halfX = size.x / 2;
    const halfZ = size.z / 2;
    result.push(
      flatLine(
        [
          { x: position.x - halfX, z: position.z - halfZ },
          { x: position.x + halfX, z: position.z - halfZ },
          { x: position.x + halfX, z: position.z + halfZ },
          { x: position.x - halfX, z: position.z + halfZ },
          { x: position.x - halfX, z: position.z - halfZ },
        ],
        0.05
      )
    );
    const steps = Math.round((direction === 'z' ? size.z : size.x) / 0.45);
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      result.push(
        direction === 'z'
          ? flatLine([{ x: position.x - halfX, z: position.z - halfZ + t * size.z }, { x: position.x + halfX, z: position.z - halfZ + t * size.z }], 0.05)
          : flatLine([{ x: position.x - halfX + t * size.x, z: position.z - halfZ }, { x: position.x - halfX + t * size.x, z: position.z + halfZ }], 0.05)
      );
    }
    return result;
  }, [position, size, direction]);

  return (
    <Reveal at={position} extraDelay={0.4}>
      {lines.map((points, index) => (
        <Line key={index} points={points} color={index === 0 ? INK : INK_FADED} lineWidth={index === 0 ? 1.6 : 1} />
      ))}
    </Reveal>
  );
};

/**
 * Everything on the parchment that isn't a walkable room or corridor
 */
export const Grounds3D: React.FC<{ decorations: DecorationConfig[] }> = ({ decorations }) => (
  <group>
    {decorations.map((decoration) => {
      switch (decoration.kind) {
        case 'lake':
          return <Lake key={decoration.id} decoration={decoration} />;
        case 'forest':
          return <Forest key={decoration.id} decoration={decoration} />;
        case 'pitch':
          return <Pitch key={decoration.id} decoration={decoration} />;
        case 'tree':
          return <LoneTree key={decoration.id} decoration={decoration} />;
        case 'passage':
          return <Passage key={decoration.id} decoration={decoration} />;
        case 'stairs':
          return <Stairs key={decoration.id} decoration={decoration} />;
        case 'label':
          return (
            <Reveal key={decoration.id} at={decoration.position} extraDelay={0.8}>
              <PlaceLabel text={decoration.name} position={decoration.position} size={decoration.size} />
            </Reveal>
          );
      }
    })}
  </group>
);
