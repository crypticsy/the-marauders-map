import { RoomConfig, CorridorConfig, CharacterConfig } from './types';

/**
 * Hogwarts Map Configuration
 * Defines all rooms, corridors, and characters for the Marauder's Map
 */

export const ROOMS: RoomConfig[] = [
  {
    id: 'gryffindor',
    name: 'Gryffindor Tower',
    position: { x: -15, y: 0, z: -15 },
    size: { x: 5.5, y: 2.5, z: 4.2 },
    color: '#8b0000',
    connectionPoints: {
      south: { x: 0, z: 2.1 },
      east: { x: 2.75, z: 0 },
    },
    obstacles: [
      {
        id: 'gryff_table',
        name: 'Common Room Table',
        position: { x: -1.8, z: -1.2 }, // corner placement
        size: { x: 0.8, z: 0.4 },
        height: 0.8,
        type: 'furniture',
      },
    ],
  },
  {
    id: 'ravenclaw',
    name: 'Ravenclaw Tower',
    position: { x: 15, y: 0, z: -15 },
    size: { x: 5.5, y: 2.5, z: 4.2 },
    color: '#00008b',
    connectionPoints: {
      south: { x: 0, z: 2.1 },
      west: { x: -2.75, z: 0 },
    },
    obstacles: [
      {
        id: 'raven_desk',
        name: 'Study Desk',
        position: { x: 1.8, z: -1.2 }, // corner placement
        size: { x: 0.6, z: 0.4 },
        height: 0.9,
        type: 'furniture',
      },
    ],
  },
  {
    id: 'great_hall',
    name: 'Great Hall',
    position: { x: 0, y: 0, z: 0 },
    size: { x: 8.5, y: 2, z: 5.6 },
    color: '#b8860b',
    connectionPoints: {
      north: { x: 0, z: -2.8 },
      south: { x: 0, z: 2.8 },
      east: { x: 4.25, z: 0 },
      west: { x: -4.25, z: 0 },
    },
    obstacles: [
      {
        id: 'hall_table1',
        name: 'Long Table',
        position: { x: -2.4, z: -1.5 }, // corner placement
        size: { x: 1.2, z: 0.5 },
        height: 0.8,
        type: 'furniture',
      },
      {
        id: 'hall_table2',
        name: 'Long Table',
        position: { x: 2.4, z: -1.5 }, // corner placement
        size: { x: 2.2, z: 0.5 },
        height: 0.8,
        type: 'furniture',
      },
    ],
  },
  {
    id: 'library',
    name: 'Library',
    position: { x: 15, y: 0, z: 4.5 },
    size: { x: 5.5, y: 2.5, z: 4.2 },
    color: '#8b4513',
    connectionPoints: {
      west: { x: -2.75, z: 0 },
      south: { x: 0, z: 2.1 },
    },
    obstacles: [
      {
        id: 'lib_shelf1',
        name: 'Bookshelf',
        position: { x: -1.8, z: -1.2 },
        size: { x: 0.3, z: 0.8 },
        height: 1.8,
        type: 'furniture',
      },
      {
        id: 'lib_shelf2',
        name: 'Bookshelf',
        position: { x: 1.8, z: -1.2 },
        size: { x: 0.3, z: 0.8 },
        height: 1.8,
        type: 'furniture',
      },
      {
        id: 'lib_table',
        name: 'Reading Table',
        position: { x: -1.5, z: 1.0 }, // corner placement away from connection points
        size: { x: 0.9, z: 0.5 },
        height: 0.8,
        type: 'furniture',
      },
    ],
  },
  {
    id: 'slytherin',
    name: 'Slytherin Dungeon',
    position: { x: -15, y: 0, z: 15 },
    size: { x: 5.5, y: 2, z: 4.2 },
    color: '#006400',
    connectionPoints: {
      north: { x: 0, z: -2.1 },
      east: { x: 2.75, z: 0 },
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
    id: 'potions',
    name: 'Potions Classroom',
    position: { x: -4.5, y: 0, z: 15 },
    size: { x: 5.5, y: 2, z: 4.2 },
    color: '#654321',
    connectionPoints: {
      west: { x: -2.75, z: 0 },
      north: { x: 0, z: -2.1 },
    },
    obstacles: [
      {
        id: 'pot_cauldron',
        name: 'Cauldron Stand',
        position: { x: 1.5, z: 1.0 },
        size: { x: 0.4, z: 0.4 },
        height: 1.0,
        type: 'furniture',
      },
      {
        id: 'pot_shelf',
        name: 'Ingredient Shelf',
        position: { x: -1.8, z: -1.0 },
        size: { x: 0.25, z: 0.8 },
        height: 1.5,
        type: 'furniture',
      },
    ],
  },
  {
    id: 'hufflepuff',
    name: 'Hufflepuff Common Room',
    position: { x: 7.5, y: 0, z: 15 },
    size: { x: 5.5, y: 2, z: 3.5 },
    color: '#ffd700',
    connectionPoints: {
      north: { x: 0, z: -1.75 },
      west: { x: -2.75, z: 0 },
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
  {
    id: 'dada',
    name: 'Defense Against Dark Arts',
    position: { x: -15, y: 0, z: 4.5 },
    size: { x: 5.5, y: 2.5, z: 3.5 },
    color: '#4b0082',
    connectionPoints: {
      east: { x: 2.75, z: 0 },
      south: { x: 0, z: 1.75 },
    },
    obstacles: [
      {
        id: 'dada_desk',
        name: 'Teacher Desk',
        position: { x: 1.8, z: -1.0 },
        size: { x: 0.7, z: 0.4 },
        height: 0.8,
        type: 'furniture',
      },
    ],
  },
];

export const CORRIDORS: CorridorConfig[] = [
  {
    id: 'corridor_gryffindor_hall',
    roomA: 'gryffindor',
    roomB: 'great_hall',
    connectionA: 'south',
    connectionB: 'north',
    width: 3.0,
    waypoints: [
      { x: -15, z: -7.5 },
      { x: -7.5, z: -4.5 },
    ],
  },
  {
    id: 'corridor_ravenclaw_hall',
    roomA: 'ravenclaw',
    roomB: 'great_hall',
    connectionA: 'south',
    connectionB: 'north',
    width: 3.0,
    waypoints: [
      { x: 15, z: -7.5 },
      { x: 7.5, z: -4.5 },
    ],
  },
  {
    id: 'corridor_hall_library',
    roomA: 'great_hall',
    roomB: 'library',
    connectionA: 'east',
    connectionB: 'west',
    width: 3.0,
    waypoints: [
      { x: 7.5, z: 0 },
    ],
  },
  {
    id: 'corridor_hall_dada',
    roomA: 'great_hall',
    roomB: 'dada',
    connectionA: 'west',
    connectionB: 'east',
    width: 3.0,
    waypoints: [
      { x: -7.5, z: 0 },
    ],
  },
  {
    id: 'corridor_dada_slytherin',
    roomA: 'dada',
    roomB: 'slytherin',
    connectionA: 'south',
    connectionB: 'north',
    width: 3.0,
    waypoints: [
      { x: -15, z: 9 },
    ],
  },
  {
    id: 'corridor_slytherin_potions',
    roomA: 'slytherin',
    roomB: 'potions',
    connectionA: 'east',
    connectionB: 'west',
    width: 3.0,
    waypoints: [],
  },
  {
    id: 'corridor_hall_hufflepuff',
    roomA: 'great_hall',
    roomB: 'hufflepuff',
    connectionA: 'south',
    connectionB: 'north',
    width: 3.0,
    waypoints: [
      { x: 3, z: 7.5 },
    ],
  },
  {
    id: 'corridor_library_hufflepuff',
    roomA: 'library',
    roomB: 'hufflepuff',
    connectionA: 'south',
    connectionB: 'west',
    width: 3.0,
    waypoints: [
      { x: 15, z: 10.5 },
      { x: 10.5, z: 15 },
    ],
  },
];

export const CHARACTERS: CharacterConfig[] = [
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
];
