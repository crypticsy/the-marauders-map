import { RoomConfig, CorridorConfig, CharacterConfig, DecorationConfig, ObstacleConfig, Vector2 } from './types';

/**
 * Hogwarts Map Configuration
 * Defines all rooms, corridors, grounds and characters for the Marauder's Map.
 *
 * Rooms are declared without connection points; each link below adds a doorway
 * to both rooms and routes an orthogonal corridor between them automatically.
 */

type Side = 'north' | 'south' | 'east' | 'west';

interface RoomDef {
  id: string;
  name: string;
  x: number;
  z: number;
  w: number; // Width (x); diameter for round rooms
  d: number; // Depth (z); ignored for round rooms
  shape?: 'rect' | 'round';
  floor?: 'stone' | 'grass' | 'wood';
  labelOffset?: Vector2;
  obstacles?: ObstacleConfig[];
}

interface LinkDef {
  a: string;
  sideA: Side;
  b: string;
  sideB: Side;
  offsetA?: number; // Slide the doorway along the wall
  offsetB?: number;
  width?: number;
  style?: 'hall' | 'path';
}

// Map extents (the parchment); everything is laid out inside these bounds
export const MAP_BOUNDS = { minX: -74, maxX: 74, minZ: -60, maxZ: 58 };

// Shorthand for furniture
const piece = (
  id: string,
  name: string,
  x: number,
  z: number,
  w: number,
  d: number,
  height = 0.5,
  shape: 'box' | 'round' = 'box'
): ObstacleConfig => ({ id, name, position: { x, z }, size: { x: w, z: d }, height, type: 'furniture', shape });

const ROOM_DEFS: RoomDef[] = [
  // ── Towers (far north) ───────────────────────────────────────────────
  {
    id: 'gryffindor', name: 'Gryffindor Tower', x: -36, z: -36, w: 11, d: 11, shape: 'round',
    obstacles: [
      piece('gryff_fire', 'Fireplace', 0, -3.6, 2.2, 0.8, 0.6),
      piece('gryff_sofa', 'Armchair', -2.6, 1.6, 1, 1, 0.4),
      piece('gryff_sofa2', 'Armchair', 2.6, 1.6, 1, 1, 0.4),
    ],
  },
  {
    id: 'divination', name: 'Divination', x: -16, z: -36, w: 8, d: 8, shape: 'round',
    obstacles: [piece('crystal_ball', 'Crystal Ball', 0, -1.6, 0.8, 0.8, 0.5, 'round')],
    labelOffset: { x: 0, z: 1 },
  },
  {
    id: 'astronomy_tower', name: 'Astronomy Tower', x: 0, z: -40, w: 9, d: 9, shape: 'round',
    obstacles: [piece('telescope', 'Telescope', 0, -2.2, 0.7, 0.7, 0.8, 'round')],
    labelOffset: { x: 0, z: 0.8 },
  },
  {
    id: 'room_of_requirement', name: 'Room of Requirement', x: 16, z: -36, w: 9, d: 7,
    obstacles: [piece('ror_cabinet', 'Vanishing Cabinet', 3.2, -2, 1, 1, 0.9)],
    labelOffset: { x: 0, z: 0.6 },
  },
  {
    id: 'ravenclaw', name: 'Ravenclaw Tower', x: 36, z: -36, w: 11, d: 11, shape: 'round',
    obstacles: [
      piece('raven_statue', 'Rowena Statue', 0, -3.4, 1, 1, 0.9, 'round'),
      piece('raven_desk', 'Study Desk', 2.8, 1.8, 1.4, 0.8, 0.4),
    ],
  },
  {
    id: 'owlery', name: 'Owlery', x: -58, z: -24, w: 7, d: 7, shape: 'round',
    obstacles: [piece('perch', 'Perch', 0, 0, 0.8, 0.8, 0.6, 'round')],
    labelOffset: { x: 0, z: 1.8 },
  },

  // ── Upper floor ──────────────────────────────────────────────────────
  {
    id: 'transfiguration', name: 'Transfiguration', x: -36, z: -20, w: 13, d: 8,
    obstacles: [
      piece('trans_desk', "McGonagall's Desk", 3.6, -2.4, 3, 0.8),
      piece('trans_bench1', 'Bench', -4, 2, 2.4, 0.6, 0.35),
      piece('trans_bench2', 'Bench', 4, 2, 2.4, 0.6, 0.35),
    ],
  },
  {
    id: 'grand_staircase', name: 'Grand Staircase', x: 0, z: -20, w: 10, d: 10, floor: 'wood',
    labelOffset: { x: 0, z: 3.6 },
  },
  {
    id: 'charms', name: 'Charms', x: 36, z: -20, w: 13, d: 8,
    obstacles: [
      piece('charms_desk', "Flitwick's Books", -3.6, -2.4, 2.4, 0.8, 0.6),
      piece('charms_bench1', 'Bench', -4, 2, 2.4, 0.6, 0.35),
      piece('charms_bench2', 'Bench', 4, 2, 2.4, 0.6, 0.35),
    ],
  },
  {
    id: 'dumbledore_office', name: "Headmaster's Office", x: -18, z: -12, w: 8, d: 8, shape: 'round',
    obstacles: [
      piece('dumbledore_desk', 'Desk', 0, -2, 2, 0.8),
      piece('pensieve', 'Pensieve', -1.8, 1.4, 0.8, 0.8, 0.5, 'round'),
    ],
    labelOffset: { x: 0.6, z: 1.2 },
  },
  {
    id: 'trophy_room', name: 'Trophy Room', x: 18, z: -12, w: 9, d: 7,
    obstacles: [
      piece('trophy_case1', 'Trophy Cabinet', -3.4, -2.6, 1.4, 0.6, 0.9),
      piece('trophy_case2', 'Trophy Cabinet', 0, -2.6, 1.4, 0.6, 0.9),
      piece('trophy_case3', 'Trophy Cabinet', 3.4, -2.6, 1.4, 0.6, 0.9),
    ],
    labelOffset: { x: 0, z: 0.6 },
  },

  // ── Main floor ───────────────────────────────────────────────────────
  {
    id: 'dada', name: 'Defence Against the Dark Arts', x: -36, z: -2, w: 13, d: 9,
    obstacles: [
      piece('dada_desk', 'Teacher Desk', 3.4, -2.8, 2.6, 0.8),
      piece('dada_skeleton', 'Dragon Skeleton', -4.6, 2.6, 1.4, 1.4, 0.7, 'round'),
    ],
  },
  {
    id: 'great_hall', name: 'The Great Hall', x: 0, z: -2, w: 19, d: 12,
    obstacles: [
      piece('staff_table', 'Staff Table', 0, -2.9, 10, 0.8),
      piece('table_gryffindor', 'Gryffindor Table', -6.3, 1.2, 1, 4.4),
      piece('table_hufflepuff', 'Hufflepuff Table', -2.1, 1.2, 1, 4.4),
      piece('table_ravenclaw', 'Ravenclaw Table', 2.1, 1.2, 1, 4.4),
      piece('table_slytherin', 'Slytherin Table', 6.3, 1.2, 1, 4.4),
    ],
    labelOffset: { x: 0, z: 4.6 },
  },
  {
    id: 'library', name: 'Library', x: 36, z: -2, w: 13, d: 10,
    obstacles: [
      piece('lib_shelf1', 'Bookshelf', -4.4, -1, 0.6, 4.4, 1.0),
      piece('lib_shelf2', 'Bookshelf', 4.4, -1, 0.6, 4.4, 1.0),
      piece('lib_table', 'Reading Table', 0, 2.6, 3, 1),
    ],
    labelOffset: { x: 0, z: -0.8 },
  },
  {
    id: 'restricted_section', name: 'Restricted Section', x: 54, z: -2, w: 8, d: 8,
    obstacles: [
      piece('restricted_shelf1', 'Dark Books', -2, -2.4, 3, 0.6, 1.0),
      piece('restricted_shelf2', 'Dark Books', 1.6, 2.4, 3, 0.6, 1.0),
    ],
  },

  // ── Lower floor & dungeons ───────────────────────────────────────────
  {
    id: 'potions', name: 'Potions Dungeon', x: -36, z: 15, w: 13, d: 8,
    obstacles: [
      piece('cauldron1', 'Cauldron', -3.6, 1.8, 0.9, 0.9, 0.5, 'round'),
      piece('cauldron2', 'Cauldron', 0, 1.8, 0.9, 0.9, 0.5, 'round'),
      piece('cauldron3', 'Cauldron', 3.6, 1.8, 0.9, 0.9, 0.5, 'round'),
      piece('pot_shelf', 'Ingredient Shelf', -5.4, 0, 0.6, 4, 1.0),
    ],
    labelOffset: { x: 0, z: -0.8 },
  },
  {
    id: 'entrance_hall', name: 'Entrance Hall', x: 0, z: 15, w: 13, d: 8,
    obstacles: [
      piece('hourglass1', 'House Points', -4.6, -2.4, 0.7, 0.7, 0.9, 'round'),
      piece('hourglass2', 'House Points', -2.8, -2.4, 0.7, 0.7, 0.9, 'round'),
      piece('hourglass3', 'House Points', 2.8, -2.4, 0.7, 0.7, 0.9, 'round'),
      piece('hourglass4', 'House Points', 4.6, -2.4, 0.7, 0.7, 0.9, 'round'),
    ],
  },
  {
    id: 'hospital_wing', name: 'Hospital Wing', x: 36, z: 15, w: 13, d: 8,
    obstacles: [
      piece('bed1', 'Bed', -4.6, -2.4, 1, 2),
      piece('bed2', 'Bed', -2, -2.4, 1, 2),
      piece('bed3', 'Bed', 2, -2.4, 1, 2),
      piece('bed4', 'Bed', 4.6, -2.4, 1, 2),
    ],
    labelOffset: { x: 0, z: 1.4 },
  },
  {
    id: 'slytherin', name: 'Slytherin Dungeon', x: -36, z: 31, w: 13, d: 8,
    obstacles: [
      piece('slyth_fire', 'Fireplace', 0, 3, 2.4, 0.8, 0.6),
      piece('slyth_chair', 'Armchair', -4.4, -2, 1, 1, 0.4),
      piece('slyth_chair2', 'Armchair', 4.4, -2, 1, 1, 0.4),
    ],
  },
  {
    id: 'courtyard', name: 'Courtyard', x: 0, z: 30, w: 14, d: 8, floor: 'grass',
    obstacles: [piece('fountain', 'Fountain', 0, 0, 2, 2, 0.4, 'round')],
    labelOffset: { x: 0, z: 2.6 },
  },
  {
    id: 'hufflepuff', name: 'Hufflepuff Basement', x: 20, z: 31, w: 10, d: 7,
    obstacles: [piece('huff_barrels', 'Barrels', 3.2, 2, 1.2, 1.2, 0.6, 'round')],
    labelOffset: { x: -0.6, z: -0.4 },
  },
  {
    id: 'kitchens', name: 'Kitchens', x: 38, z: 31, w: 11, d: 7,
    obstacles: [
      piece('kitchen_table', 'Kitchen Table', 0.4, 1.2, 5, 1),
      piece('kitchen_oven', 'Oven', 4.4, -2.2, 1, 1, 0.7),
    ],
    labelOffset: { x: 0, z: -1.2 },
  },

  // ── Grounds ──────────────────────────────────────────────────────────
  {
    id: 'hagrids_hut', name: "Hagrid's Hut", x: -24, z: 47, w: 7, d: 7, shape: 'round', floor: 'wood',
    obstacles: [piece('hagrid_fire', 'Hearth', 0, -2, 1.2, 0.8, 0.5)],
    labelOffset: { x: 0, z: 1 },
  },
  {
    id: 'greenhouses', name: 'Greenhouses', x: 22, z: 47, w: 13, d: 7, floor: 'grass',
    obstacles: [
      piece('mandrakes1', 'Mandrakes', -3.6, -1.8, 2.6, 0.9, 0.4),
      piece('mandrakes2', 'Mandrakes', 3.6, -1.8, 2.6, 0.9, 0.4),
    ],
    labelOffset: { x: 0, z: 1.2 },
  },
];

const LINKS: LinkDef[] = [
  // Towers
  { a: 'gryffindor', sideA: 'south', b: 'transfiguration', sideB: 'north' },
  { a: 'ravenclaw', sideA: 'south', b: 'charms', sideB: 'north' },
  { a: 'astronomy_tower', sideA: 'south', b: 'grand_staircase', sideB: 'north' },
  { a: 'divination', sideA: 'south', b: 'grand_staircase', sideB: 'north', offsetB: -3.4, width: 2.2 },
  { a: 'room_of_requirement', sideA: 'south', b: 'grand_staircase', sideB: 'north', offsetB: 3.4, width: 2.2 },
  { a: 'gryffindor', sideA: 'west', b: 'owlery', sideB: 'east', width: 2.2 },

  // Upper floor
  { a: 'transfiguration', sideA: 'east', b: 'grand_staircase', sideB: 'west' },
  { a: 'grand_staircase', sideA: 'east', b: 'charms', sideB: 'west' },
  { a: 'grand_staircase', sideA: 'south', b: 'great_hall', sideB: 'north', width: 3 },
  { a: 'dumbledore_office', sideA: 'east', b: 'great_hall', sideB: 'north', offsetB: -6, width: 2.2 },
  { a: 'trophy_room', sideA: 'west', b: 'great_hall', sideB: 'north', offsetB: 6, width: 2.2 },

  // Wings
  { a: 'transfiguration', sideA: 'south', b: 'dada', sideB: 'north' },
  { a: 'charms', sideA: 'south', b: 'library', sideB: 'north' },
  { a: 'dada', sideA: 'east', b: 'great_hall', sideB: 'west' },
  { a: 'great_hall', sideA: 'east', b: 'library', sideB: 'west' },
  { a: 'library', sideA: 'east', b: 'restricted_section', sideB: 'west', width: 2.2 },
  { a: 'dada', sideA: 'south', b: 'potions', sideB: 'north' },
  { a: 'library', sideA: 'south', b: 'hospital_wing', sideB: 'north' },
  { a: 'great_hall', sideA: 'south', b: 'entrance_hall', sideB: 'north', width: 3 },

  // Lower floor & dungeons
  { a: 'potions', sideA: 'east', b: 'entrance_hall', sideB: 'west' },
  { a: 'entrance_hall', sideA: 'east', b: 'hospital_wing', sideB: 'west' },
  { a: 'potions', sideA: 'south', b: 'slytherin', sideB: 'north' },
  { a: 'entrance_hall', sideA: 'south', b: 'courtyard', sideB: 'north', width: 3 },
  { a: 'hospital_wing', sideA: 'south', b: 'kitchens', sideB: 'north', offsetB: -2 },
  { a: 'hufflepuff', sideA: 'east', b: 'kitchens', sideB: 'west' },

  // Paths across the grounds
  { a: 'courtyard', sideA: 'west', b: 'hagrids_hut', sideB: 'north', style: 'path', width: 2.2 },
  { a: 'courtyard', sideA: 'south', b: 'greenhouses', sideB: 'west', style: 'path', width: 2.2 },
];

/**
 * Place a doorway on a room wall (on the circle for round rooms)
 */
const doorOffset = (room: RoomDef, side: Side, along: number): Vector2 => {
  if (room.shape === 'round') {
    const r = room.w / 2;
    const across = Math.sqrt(Math.max(r * r - along * along, 0));
    switch (side) {
      case 'north': return { x: along, z: -across };
      case 'south': return { x: along, z: across };
      case 'east': return { x: across, z: along };
      case 'west': return { x: -across, z: along };
    }
  }
  switch (side) {
    case 'north': return { x: along, z: -room.d / 2 };
    case 'south': return { x: along, z: room.d / 2 };
    case 'east': return { x: room.w / 2, z: along };
    case 'west': return { x: -room.w / 2, z: along };
  }
};

const isHorizontal = (side: Side) => side === 'east' || side === 'west';

/**
 * Route an orthogonal corridor between two doorways (straight, L or Z shaped)
 */
const routeCorridor = (a: Vector2, sideA: Side, b: Vector2, sideB: Side): Vector2[] => {
  const eps = 0.01;
  if (isHorizontal(sideA) && isHorizontal(sideB)) {
    if (Math.abs(a.z - b.z) < eps) return [];
    const midX = (a.x + b.x) / 2;
    return [{ x: midX, z: a.z }, { x: midX, z: b.z }];
  }
  if (!isHorizontal(sideA) && !isHorizontal(sideB)) {
    if (Math.abs(a.x - b.x) < eps) return [];
    const midZ = (a.z + b.z) / 2;
    return [{ x: a.x, z: midZ }, { x: b.x, z: midZ }];
  }
  return isHorizontal(sideA) ? [{ x: b.x, z: a.z }] : [{ x: a.x, z: b.z }];
};

const buildMap = (): { rooms: RoomConfig[]; corridors: CorridorConfig[] } => {
  const defs = new Map(ROOM_DEFS.map((def) => [def.id, def]));
  const connectionPoints = new Map<string, { [key: string]: Vector2 }>(
    ROOM_DEFS.map((def) => [def.id, {}])
  );

  // Give each doorway a unique name per room (north, north_2, ...)
  const addDoor = (roomId: string, side: Side, along: number): { name: string; absolute: Vector2 } => {
    const def = defs.get(roomId);
    if (!def) throw new Error(`Unknown room in map links: ${roomId}`);
    const points = connectionPoints.get(roomId)!;
    let name: string = side;
    for (let n = 2; points[name]; n++) name = `${side}_${n}`;
    const offset = doorOffset(def, side, along);
    points[name] = offset;
    return { name, absolute: { x: def.x + offset.x, z: def.z + offset.z } };
  };

  const corridors: CorridorConfig[] = LINKS.map((link) => {
    const doorA = addDoor(link.a, link.sideA, link.offsetA || 0);
    const doorB = addDoor(link.b, link.sideB, link.offsetB || 0);
    return {
      id: `corridor_${link.a}_${link.b}`,
      roomA: link.a,
      roomB: link.b,
      connectionA: doorA.name,
      connectionB: doorB.name,
      width: link.width || 2.6,
      style: link.style || 'hall',
      waypoints: routeCorridor(doorA.absolute, link.sideA, doorB.absolute, link.sideB),
    };
  });

  const rooms: RoomConfig[] = ROOM_DEFS.map((def) => ({
    id: def.id,
    name: def.name,
    position: { x: def.x, y: 0, z: def.z },
    size: { x: def.w, y: 2.5, z: def.shape === 'round' ? def.w : def.d },
    color: '#3d2817',
    connectionPoints: connectionPoints.get(def.id)!,
    obstacles: def.obstacles || [],
    shape: def.shape,
    floor: def.floor,
    labelOffset: def.labelOffset,
  }));

  return { rooms, corridors };
};

const MAP = buildMap();

export const ROOMS: RoomConfig[] = MAP.rooms;

export const CORRIDORS: CorridorConfig[] = MAP.corridors;

export const DECORATIONS: DecorationConfig[] = [
  {
    kind: 'lake',
    id: 'black_lake',
    name: 'The Black Lake',
    outline: [
      { x: 50, z: 18 }, { x: 58, z: 14 }, { x: 66, z: 17 }, { x: 70, z: 26 }, { x: 69, z: 40 },
      { x: 64, z: 51 }, { x: 54, z: 54 }, { x: 44, z: 52 }, { x: 38, z: 44 }, { x: 46, z: 38 },
      { x: 47, z: 27 },
    ],
  },
  {
    kind: 'forest',
    id: 'forbidden_forest',
    name: 'The Forbidden Forest',
    density: 1,
    outline: [
      { x: -71, z: 2 }, { x: -54, z: 0 }, { x: -48, z: 10 }, { x: -50, z: 24 }, { x: -46, z: 38 },
      { x: -34, z: 41 }, { x: -31, z: 55 }, { x: -71, z: 55 },
    ],
  },
  { kind: 'pitch', id: 'quidditch_pitch', name: 'Quidditch Pitch', position: { x: 60, z: -30 }, size: { x: 16, z: 30 } },
  { kind: 'tree', id: 'whomping_willow', name: 'Whomping Willow', position: { x: -10, z: 41 }, radius: 2.2 },
  {
    kind: 'passage',
    id: 'passage_shrieking_shack',
    name: 'to the Shrieking Shack',
    points: [{ x: -10, z: 41 }, { x: -12, z: 48 }, { x: -9, z: 54 }, { x: -12, z: 58 }],
  },
  {
    kind: 'passage',
    id: 'passage_honeydukes',
    name: 'to Honeydukes Cellar',
    points: [{ x: -21, z: -20 }, { x: -24, z: -26 }, { x: -46, z: -28 }, { x: -50, z: -40 }, { x: -46, z: -50 }],
  },
  { kind: 'stairs', id: 'stairs_west', position: { x: -2.6, z: -21 }, size: { x: 2.2, z: 5 }, direction: 'z' },
  { kind: 'stairs', id: 'stairs_east', position: { x: 2.6, z: -21 }, size: { x: 2.2, z: 5 }, direction: 'z' },
  { kind: 'label', id: 'label_one_eyed_witch', name: 'One-Eyed Witch', position: { x: -21, z: -17.6 }, size: 0.75 },
  { kind: 'label', id: 'label_gargoyle', name: 'Gargoyle', position: { x: -10, z: -14.6 }, size: 0.75 },
  { kind: 'label', id: 'label_hogsmeade', name: 'Hogsmeade', position: { x: 0, z: 55 }, size: 1.4 },
];

export const CHARACTERS: CharacterConfig[] = [
  // Main Trio
  {
    id: 'harry',
    name: 'Harry Potter',
    color: '#ff0000',
    speed: 1.8,
    haunts: ['gryffindor', 'great_hall', 'courtyard', 'hagrids_hut'],
  },
  {
    id: 'hermione',
    name: 'Hermione Granger',
    color: '#0000ff',
    speed: 1.5,
    haunts: ['library', 'restricted_section', 'gryffindor', 'transfiguration'],
  },
  {
    id: 'ron',
    name: 'Ron Weasley',
    color: '#ffa500',
    speed: 1.6,
    haunts: ['gryffindor', 'great_hall', 'kitchens'],
  },

  // Professors
  {
    id: 'dumbledore',
    name: 'Albus Dumbledore',
    color: '#9370db',
    speed: 1.1,
    haunts: ['dumbledore_office', 'great_hall', 'astronomy_tower'],
  },
  {
    id: 'mcgonagall',
    name: 'Minerva McGonagall',
    color: '#2e8b57',
    speed: 1.3,
    haunts: ['transfiguration', 'gryffindor', 'great_hall'],
  },
  {
    id: 'snape',
    name: 'Severus Snape',
    color: '#1a1a1a',
    speed: 1.5,
    haunts: ['potions', 'slytherin', 'dada'],
  },
  {
    id: 'hagrid',
    name: 'Rubeus Hagrid',
    color: '#8b4513',
    speed: 1.0,
    haunts: ['hagrids_hut', 'greenhouses', 'courtyard', 'great_hall'],
  },
  {
    id: 'filch',
    name: 'Argus Filch',
    color: '#6b6b47',
    speed: 0.9,
    haunts: ['trophy_room', 'entrance_hall', 'grand_staircase'],
  },

  // Other Students
  {
    id: 'draco',
    name: 'Draco Malfoy',
    color: '#228b22',
    speed: 1.6,
    haunts: ['slytherin', 'potions', 'room_of_requirement'],
  },
  {
    id: 'neville',
    name: 'Neville Longbottom',
    color: '#ffd700',
    speed: 1.3,
    haunts: ['greenhouses', 'gryffindor', 'hospital_wing'],
  },
  {
    id: 'luna',
    name: 'Luna Lovegood',
    color: '#87ceeb',
    speed: 1.1,
    haunts: ['ravenclaw', 'owlery', 'courtyard', 'divination'],
  },
  {
    id: 'ginny',
    name: 'Ginny Weasley',
    color: '#dc143c',
    speed: 1.6,
    haunts: ['gryffindor', 'room_of_requirement', 'great_hall'],
  },
  {
    id: 'fred',
    name: 'Fred Weasley',
    color: '#ff6347',
    speed: 2.0,
    haunts: ['kitchens', 'trophy_room', 'room_of_requirement'],
  },
  {
    id: 'george',
    name: 'George Weasley',
    color: '#ff4500',
    speed: 2.0,
    haunts: ['kitchens', 'trophy_room', 'room_of_requirement'],
  },
];
