import { RoomConfig, CorridorConfig, CharacterConfig } from './types';

/**
 * Hogwarts Map Configuration
 * Defines all rooms, corridors, and characters for the Marauder's Map
 */

export const ROOMS: RoomConfig[] = [
  // Grid Layout: X positions: -30, -20, 0, 20, 30 | Z positions: -30, -20, -10, 0, 10, 20, 30

  // Level Z=-30 (Far North - Towers)
  {
    id: 'gryffindor',
    name: 'Gryffindor Tower',
    position: { x: -30, y: 0, z: -30 },
    size: { x: 5.5, y: 2.5, z: 4.2 },
    color: '#8b0000',
    connectionPoints: {
      south: { x: 0, z: 2.1 },
    },
    obstacles: [
      {
        id: 'gryff_table',
        name: 'Common Room Table',
        position: { x: -1.8, z: -1.2 },
        size: { x: 0.8, z: 0.4 },
        height: 0.8,
        type: 'furniture',
      },
    ],
  },
  {
    id: 'ravenclaw',
    name: 'Ravenclaw Tower',
    position: { x: 30, y: 0, z: -30 },
    size: { x: 5.5, y: 2.5, z: 4.2 },
    color: '#00008b',
    connectionPoints: {
      south: { x: 0, z: 2.1 },
    },
    obstacles: [
      {
        id: 'raven_desk',
        name: 'Study Desk',
        position: { x: 1.8, z: -1.2 },
        size: { x: 0.6, z: 0.4 },
        height: 0.9,
        type: 'furniture',
      },
    ],
  },

  // Level Z=-20 (North - Upper Classrooms)
  {
    id: 'transfiguration',
    name: 'Transfiguration Classroom',
    position: { x: -30, y: 0, z: -20 },
    size: { x: 5, y: 2.5, z: 4 },
    color: '#6a5acd',
    connectionPoints: {
      north: { x: 0, z: -2 },
      south: { x: 0, z: 2 },
      east: { x: 2.5, z: 0 },
    },
    obstacles: [
      {
        id: 'trans_desk',
        name: 'McGonagall Desk',
        position: { x: 1.6, z: -1.2 },
        size: { x: 0.6, z: 0.4 },
        height: 0.8,
        type: 'furniture',
      },
    ],
  },
  {
    id: 'astronomy_tower',
    name: 'Astronomy Tower',
    position: { x: 0, y: 0, z: -20 },
    size: { x: 4.5, y: 3, z: 4.5 },
    color: '#191970',
    connectionPoints: {
      south: { x: 0, z: 2.25 },
      east: { x: 2.25, z: 0 },
      west: { x: -2.25, z: 0 },
    },
    obstacles: [
      {
        id: 'telescope',
        name: 'Telescope',
        position: { x: 1.4, z: 1.4 },
        size: { x: 0.4, z: 0.4 },
        height: 1.2,
        type: 'furniture',
      },
    ],
  },
  {
    id: 'charms',
    name: 'Charms Classroom',
    position: { x: 30, y: 0, z: -20 },
    size: { x: 5, y: 2.5, z: 4 },
    color: '#daa520',
    connectionPoints: {
      north: { x: 0, z: -2 },
      south: { x: 0, z: 2 },
      west: { x: -2.5, z: 0 },
    },
    obstacles: [
      {
        id: 'charms_desk',
        name: 'Flitwick Desk',
        position: { x: -1.6, z: -1.2 },
        size: { x: 0.5, z: 0.3 },
        height: 0.6,
        type: 'furniture',
      },
    ],
  },

  // Level Z=-10 (North Central - Specialized Rooms)
  {
    id: 'divination',
    name: 'Divination Tower',
    position: { x: -20, y: 0, z: -10 },
    size: { x: 4.5, y: 2.5, z: 4.5 },
    color: '#9370db',
    connectionPoints: {
      south: { x: 0, z: 2.25 },
      east: { x: 2.25, z: 0 },
    },
    obstacles: [
      {
        id: 'crystal_ball',
        name: 'Crystal Ball',
        position: { x: 0, z: 0 },
        size: { x: 0.3, z: 0.3 },
        height: 0.5,
        type: 'furniture',
      },
    ],
  },
  {
    id: 'main_corridor',
    name: 'Main Corridor',
    position: { x: 0, y: 0, z: -10 },
    size: { x: 6, y: 2, z: 3 },
    color: '#696969',
    connectionPoints: {
      north: { x: 0, z: -1.5 },
      south: { x: 0, z: 1.5 },
      east: { x: 3, z: 0 },
      west: { x: -3, z: 0 },
    },
    obstacles: [],
  },
  {
    id: 'forbidden_section',
    name: 'Restricted Section',
    position: { x: 20, y: 0, z: -10 },
    size: { x: 4, y: 2.5, z: 3.5 },
    color: '#2f4f4f',
    connectionPoints: {
      south: { x: 0, z: 1.75 },
      west: { x: -2, z: 0 },
    },
    obstacles: [
      {
        id: 'forbidden_shelf',
        name: 'Dark Books Shelf',
        position: { x: 1.2, z: -1 },
        size: { x: 0.3, z: 1 },
        height: 2,
        type: 'furniture',
      },
    ],
  },

  // Level Z=0 (Center - Main Hub)
  {
    id: 'dada',
    name: 'Defense Against Dark Arts',
    position: { x: -20, y: 0, z: 0 },
    size: { x: 5.5, y: 2.5, z: 4.5 },
    color: '#4b0082',
    connectionPoints: {
      east: { x: 2.75, z: 0 },
      north: { x: 0, z: -2.25 },
      south: { x: 0, z: 2.25 },
    },
    obstacles: [
      {
        id: 'dada_desk',
        name: 'Teacher Desk',
        position: { x: 1.8, z: -1.3 },
        size: { x: 0.7, z: 0.4 },
        height: 0.8,
        type: 'furniture',
      },
    ],
  },
  {
    id: 'great_hall',
    name: 'Great Hall',
    position: { x: 0, y: 0, z: 0 },
    size: { x: 9, y: 2, z: 6 },
    color: '#b8860b',
    connectionPoints: {
      north: { x: 0, z: -3 },
      south: { x: 0, z: 3 },
      east: { x: 4.5, z: 0 },
      west: { x: -4.5, z: 0 },
    },
    obstacles: [
      {
        id: 'hall_table1',
        name: 'Long Table',
        position: { x: -2.4, z: -1.5 },
        size: { x: 1.2, z: 0.5 },
        height: 0.8,
        type: 'furniture',
      },
      {
        id: 'hall_table2',
        name: 'Long Table',
        position: { x: 2.4, z: -1.5 },
        size: { x: 2.2, z: 0.5 },
        height: 0.8,
        type: 'furniture',
      },
    ],
  },
  {
    id: 'library',
    name: 'Library',
    position: { x: 20, y: 0, z: 0 },
    size: { x: 6, y: 2.5, z: 5 },
    color: '#8b4513',
    connectionPoints: {
      west: { x: -3, z: 0 },
      north: { x: 0, z: -2.5 },
      south: { x: 0, z: 2.5 },
    },
    obstacles: [
      {
        id: 'lib_shelf1',
        name: 'Bookshelf',
        position: { x: -2, z: -1.5 },
        size: { x: 0.3, z: 0.8 },
        height: 1.8,
        type: 'furniture',
      },
      {
        id: 'lib_shelf2',
        name: 'Bookshelf',
        position: { x: 2, z: -1.5 },
        size: { x: 0.3, z: 0.8 },
        height: 1.8,
        type: 'furniture',
      },
      {
        id: 'lib_table',
        name: 'Reading Table',
        position: { x: -1.8, z: 1.2 },
        size: { x: 0.9, z: 0.5 },
        height: 0.8,
        type: 'furniture',
      },
    ],
  },

  // Level Z=10 (South Central - Services)
  {
    id: 'trophy_room',
    name: 'Trophy Room',
    position: { x: -20, y: 0, z: 10 },
    size: { x: 5, y: 2.5, z: 4 },
    color: '#c0c0c0',
    connectionPoints: {
      north: { x: 0, z: -2 },
      south: { x: 0, z: 2 },
    },
    obstacles: [
      {
        id: 'trophy_case',
        name: 'Trophy Display',
        position: { x: 1.6, z: -1.2 },
        size: { x: 0.4, z: 0.8 },
        height: 1.6,
        type: 'furniture',
      },
    ],
  },
  {
    id: 'courtyard',
    name: 'Courtyard',
    position: { x: 0, y: 0, z: 10 },
    size: { x: 6, y: 1.5, z: 4 },
    color: '#98fb98',
    connectionPoints: {
      north: { x: 0, z: -2 },
      south: { x: 0, z: 2 },
    },
    obstacles: [],
  },
  {
    id: 'hospital_wing',
    name: 'Hospital Wing',
    position: { x: 20, y: 0, z: 10 },
    size: { x: 5.5, y: 2.5, z: 5 },
    color: '#f0f8ff',
    connectionPoints: {
      north: { x: 0, z: -2.5 },
      south: { x: 0, z: 2.5 },
    },
    obstacles: [
      {
        id: 'hospital_bed',
        name: 'Hospital Bed',
        position: { x: -1.8, z: -1.5 },
        size: { x: 0.6, z: 1.2 },
        height: 0.6,
        type: 'furniture',
      },
    ],
  },

  // Level Z=20 (South - Dungeons/Outdoors)
  {
    id: 'potions',
    name: 'Potions Classroom',
    position: { x: -20, y: 0, z: 20 },
    size: { x: 5.5, y: 2, z: 4.5 },
    color: '#654321',
    connectionPoints: {
      north: { x: 0, z: -2.25 },
      south: { x: 0, z: 2.25 },
    },
    obstacles: [
      {
        id: 'pot_cauldron',
        name: 'Cauldron Stand',
        position: { x: 1.5, z: 1.2 },
        size: { x: 0.4, z: 0.4 },
        height: 1.0,
        type: 'furniture',
      },
      {
        id: 'pot_shelf',
        name: 'Ingredient Shelf',
        position: { x: -1.8, z: -1.4 },
        size: { x: 0.25, z: 0.8 },
        height: 1.5,
        type: 'furniture',
      },
    ],
  },
  {
    id: 'dumbledore_office',
    name: "Dumbledore's Office",
    position: { x: 0, y: 0, z: 20 },
    size: { x: 5, y: 3, z: 5 },
    color: '#cd853f',
    connectionPoints: {
      north: { x: 0, z: -2.5 },
      south: { x: 0, z: 2.5 },
    },
    obstacles: [
      {
        id: 'dumbledore_desk',
        name: 'Headmaster Desk',
        position: { x: 1.6, z: 1.6 },
        size: { x: 0.8, z: 0.6 },
        height: 0.9,
        type: 'furniture',
      },
      {
        id: 'pensieve',
        name: 'Pensieve',
        position: { x: -1.6, z: 1.6 },
        size: { x: 0.5, z: 0.5 },
        height: 0.8,
        type: 'furniture',
      },
    ],
  },
  {
    id: 'herbology',
    name: 'Herbology Greenhouse',
    position: { x: 20, y: 0, z: 20 },
    size: { x: 6, y: 2.5, z: 5 },
    color: '#228b22',
    connectionPoints: {
      north: { x: 0, z: -2.5 },
      south: { x: 0, z: 2.5 },
    },
    obstacles: [
      {
        id: 'plant_pot',
        name: 'Mandrake Pot',
        position: { x: -2, z: -1.5 },
        size: { x: 0.5, z: 0.5 },
        height: 0.8,
        type: 'furniture',
      },
    ],
  },

  // Level Z=30 (Far South - Common Rooms) - Aligned for straight corridors
  {
    id: 'slytherin',
    name: 'Slytherin Dungeon',
    position: { x: -20, y: 0, z: 30 },
    size: { x: 5.5, y: 2, z: 4.2 },
    color: '#006400',
    connectionPoints: {
      north: { x: 0, z: -2.1 },
    },
    obstacles: [
      {
        id: 'slyth_chair',
        name: 'Armchair',
        position: { x: -1.8, z: 1.0 },
        size: { x: 0.5, z: 0.5 },
        height: 0.9,
        type: 'furniture',
      },
    ],
  },
  {
    id: 'hufflepuff',
    name: 'Hufflepuff Common Room',
    position: { x: 20, y: 0, z: 30 },
    size: { x: 5.5, y: 2, z: 3.5 },
    color: '#ffd700',
    connectionPoints: {
      north: { x: 0, z: -1.75 },
    },
    obstacles: [
      {
        id: 'huff_couch',
        name: 'Cozy Couch',
        position: { x: 1.8, z: 1.0 },
        size: { x: 1.0, z: 0.5 },
        height: 0.7,
        type: 'furniture',
      },
    ],
  },
];

export const CORRIDORS: CorridorConfig[] = [
  // All corridors are perfectly horizontal or vertical - NO DIAGONALS

  // North Wing - Vertical corridors (z-axis connections)
  {
    id: 'corridor_gryffindor_transfiguration',
    roomA: 'gryffindor',
    roomB: 'transfiguration',
    connectionA: 'south',
    connectionB: 'north',
    width: 2.5,
    waypoints: [], // Straight vertical: both at x=-30
  },
  {
    id: 'corridor_ravenclaw_charms',
    roomA: 'ravenclaw',
    roomB: 'charms',
    connectionA: 'south',
    connectionB: 'north',
    width: 2.5,
    waypoints: [], // Straight vertical: both at x=30
  },
  {
    id: 'corridor_astronomy_main',
    roomA: 'astronomy_tower',
    roomB: 'main_corridor',
    connectionA: 'south',
    connectionB: 'north',
    width: 2.5,
    waypoints: [], // Straight vertical: both at x=0
  },

  // North Wing - Horizontal corridors (x-axis connections at z=-20)
  {
    id: 'corridor_transfiguration_astronomy',
    roomA: 'transfiguration',
    roomB: 'astronomy_tower',
    connectionA: 'east',
    connectionB: 'west',
    width: 2.5,
    waypoints: [], // Straight horizontal: both at z=-20
  },
  {
    id: 'corridor_astronomy_charms',
    roomA: 'astronomy_tower',
    roomB: 'charms',
    connectionA: 'east',
    connectionB: 'west',
    width: 2.5,
    waypoints: [], // Straight horizontal: both at z=-20
  },

  // North Central - Horizontal corridors (x-axis connections at z=-10)
  {
    id: 'corridor_divination_main',
    roomA: 'divination',
    roomB: 'main_corridor',
    connectionA: 'east',
    connectionB: 'west',
    width: 2.5,
    waypoints: [], // Straight horizontal: both at z=-10
  },
  {
    id: 'corridor_main_forbidden',
    roomA: 'main_corridor',
    roomB: 'forbidden_section',
    connectionA: 'east',
    connectionB: 'west',
    width: 2.5,
    waypoints: [], // Straight horizontal: both at z=-10
  },

  // Central - Vertical corridors
  {
    id: 'corridor_divination_dada',
    roomA: 'divination',
    roomB: 'dada',
    connectionA: 'south',
    connectionB: 'north',
    width: 2.5,
    waypoints: [], // Straight vertical: both at x=-20
  },
  {
    id: 'corridor_main_hall',
    roomA: 'main_corridor',
    roomB: 'great_hall',
    connectionA: 'south',
    connectionB: 'north',
    width: 3.0,
    waypoints: [], // Straight vertical: both at x=0
  },
  {
    id: 'corridor_forbidden_library',
    roomA: 'forbidden_section',
    roomB: 'library',
    connectionA: 'south',
    connectionB: 'north',
    width: 2.5,
    waypoints: [], // Straight vertical: both at x=20
  },

  // Central - Horizontal corridors (x-axis connections at z=0)
  {
    id: 'corridor_dada_hall',
    roomA: 'dada',
    roomB: 'great_hall',
    connectionA: 'east',
    connectionB: 'west',
    width: 2.5,
    waypoints: [], // Straight horizontal: both at z=0
  },
  {
    id: 'corridor_hall_library',
    roomA: 'great_hall',
    roomB: 'library',
    connectionA: 'east',
    connectionB: 'west',
    width: 2.5,
    waypoints: [], // Straight horizontal: both at z=0
  },

  // South Central - Vertical corridors
  {
    id: 'corridor_dada_trophy',
    roomA: 'dada',
    roomB: 'trophy_room',
    connectionA: 'south',
    connectionB: 'north',
    width: 2.5,
    waypoints: [], // Straight vertical: both at x=-20
  },
  {
    id: 'corridor_hall_courtyard',
    roomA: 'great_hall',
    roomB: 'courtyard',
    connectionA: 'south',
    connectionB: 'north',
    width: 3.0,
    waypoints: [], // Straight vertical: both at x=0
  },
  {
    id: 'corridor_library_hospital',
    roomA: 'library',
    roomB: 'hospital_wing',
    connectionA: 'south',
    connectionB: 'north',
    width: 2.5,
    waypoints: [], // Straight vertical: both at x=20
  },

  // South Wing - Vertical corridors
  {
    id: 'corridor_trophy_potions',
    roomA: 'trophy_room',
    roomB: 'potions',
    connectionA: 'south',
    connectionB: 'north',
    width: 2.5,
    waypoints: [], // Straight vertical: both at x=-20
  },
  {
    id: 'corridor_courtyard_dumbledore',
    roomA: 'courtyard',
    roomB: 'dumbledore_office',
    connectionA: 'south',
    connectionB: 'north',
    width: 2.5,
    waypoints: [], // Straight vertical: both at x=0
  },
  {
    id: 'corridor_hospital_herbology',
    roomA: 'hospital_wing',
    roomB: 'herbology',
    connectionA: 'south',
    connectionB: 'north',
    width: 2.5,
    waypoints: [], // Straight vertical: both at x=20
  },

  // Far South - Perfectly straight vertical corridors
  {
    id: 'corridor_potions_slytherin',
    roomA: 'potions',
    roomB: 'slytherin',
    connectionA: 'south',
    connectionB: 'north',
    width: 2.5,
    waypoints: [], // Straight vertical: both at x=-20
  },
  {
    id: 'corridor_herbology_hufflepuff',
    roomA: 'herbology',
    roomB: 'hufflepuff',
    connectionA: 'south',
    connectionB: 'north',
    width: 2.5,
    waypoints: [], // Straight vertical: both at x=20
  },
];

export const CHARACTERS: CharacterConfig[] = [
  // Main Trio
  {
    id: 'harry',
    name: 'Harry Potter',
    color: '#ff0000',
    speed: 1.0,
  },
  {
    id: 'hermione',
    name: 'Hermione Granger',
    color: '#0000ff',
    speed: 0.8,
  },
  {
    id: 'ron',
    name: 'Ron Weasley',
    color: '#ffa500',
    speed: 0.9,
  },

  // Professors
  {
    id: 'dumbledore',
    name: 'Albus Dumbledore',
    color: '#9370db',
    speed: 0.6,
  },
  {
    id: 'mcgonagall',
    name: 'Minerva McGonagall',
    color: '#2e8b57',
    speed: 0.7,
  },
  {
    id: 'snape',
    name: 'Severus Snape',
    color: '#1a1a1a',
    speed: 0.8,
  },
  {
    id: 'hagrid',
    name: 'Rubeus Hagrid',
    color: '#8b4513',
    speed: 0.5,
  },

  // Other Students
  {
    id: 'draco',
    name: 'Draco Malfoy',
    color: '#228b22',
    speed: 0.9,
  },
  {
    id: 'neville',
    name: 'Neville Longbottom',
    color: '#ffd700',
    speed: 0.7,
  },
  {
    id: 'luna',
    name: 'Luna Lovegood',
    color: '#87ceeb',
    speed: 0.6,
  },
  {
    id: 'ginny',
    name: 'Ginny Weasley',
    color: '#dc143c',
    speed: 0.9,
  },
  {
    id: 'fred',
    name: 'Fred Weasley',
    color: '#ff6347',
    speed: 1.1,
  },
  {
    id: 'george',
    name: 'George Weasley',
    color: '#ff4500',
    speed: 1.1,
  },
];
