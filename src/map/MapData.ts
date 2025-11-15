import { RoomConfig, CorridorConfig, CharacterConfig } from './types';

/**
 * Hogwarts Map Configuration
 * Defines all rooms, corridors, and characters for the Marauder's Map
 */

export const ROOMS: RoomConfig[] = [
  {
    id: 'gryffindor',
    name: 'Gryffindor Tower',
    position: { x: -10, y: 0, z: -10 },
    size: { x: 4, y: 2, z: 3 },
    color: '#8b0000',
    connectionPoints: {
      south: { x: 0, z: 1.5 },
      east: { x: 2, z: 0 },
    },
  },
  {
    id: 'ravenclaw',
    name: 'Ravenclaw Tower',
    position: { x: 10, y: 0, z: -10 },
    size: { x: 4, y: 2, z: 3 },
    color: '#00008b',
    connectionPoints: {
      south: { x: 0, z: 1.5 },
      west: { x: -2, z: 0 },
    },
  },
  {
    id: 'great_hall',
    name: 'Great Hall',
    position: { x: 0, y: 0, z: 0 },
    size: { x: 6, y: 1.5, z: 4 },
    color: '#b8860b',
    connectionPoints: {
      north: { x: 0, z: -2 },
      south: { x: 0, z: 2 },
      east: { x: 3, z: 0 },
      west: { x: -3, z: 0 },
    },
  },
  {
    id: 'library',
    name: 'Library',
    position: { x: 10, y: 0, z: 3 },
    size: { x: 4, y: 2, z: 3 },
    color: '#8b4513',
    connectionPoints: {
      west: { x: -2, z: 0 },
      south: { x: 0, z: 1.5 },
    },
  },
  {
    id: 'slytherin',
    name: 'Slytherin Dungeon',
    position: { x: -10, y: 0, z: 10 },
    size: { x: 4, y: 1.5, z: 3 },
    color: '#006400',
    connectionPoints: {
      north: { x: 0, z: -1.5 },
      east: { x: 2, z: 0 },
    },
  },
  {
    id: 'potions',
    name: 'Potions Classroom',
    position: { x: -3, y: 0, z: 10 },
    size: { x: 4, y: 1.5, z: 3 },
    color: '#654321',
    connectionPoints: {
      west: { x: -2, z: 0 },
      north: { x: 0, z: -1.5 },
    },
  },
  {
    id: 'hufflepuff',
    name: 'Hufflepuff Common Room',
    position: { x: 5, y: 0, z: 10 },
    size: { x: 4, y: 1.5, z: 2.5 },
    color: '#ffd700',
    connectionPoints: {
      north: { x: 0, z: -1.25 },
      west: { x: -2, z: 0 },
    },
  },
  {
    id: 'dada',
    name: 'Defense Against Dark Arts',
    position: { x: -10, y: 0, z: 3 },
    size: { x: 4, y: 2, z: 2.5 },
    color: '#4b0082',
    connectionPoints: {
      east: { x: 2, z: 0 },
      south: { x: 0, z: 1.25 },
    },
  },
];

export const CORRIDORS: CorridorConfig[] = [
  {
    id: 'corridor_gryffindor_hall',
    roomA: 'gryffindor',
    roomB: 'great_hall',
    connectionA: 'south',
    connectionB: 'north',
    width: 1.5,
    waypoints: [
      { x: -10, z: -5 },
      { x: -5, z: -3 },
    ],
  },
  {
    id: 'corridor_ravenclaw_hall',
    roomA: 'ravenclaw',
    roomB: 'great_hall',
    connectionA: 'south',
    connectionB: 'north',
    width: 1.5,
    waypoints: [
      { x: 10, z: -5 },
      { x: 5, z: -3 },
    ],
  },
  {
    id: 'corridor_hall_library',
    roomA: 'great_hall',
    roomB: 'library',
    connectionA: 'east',
    connectionB: 'west',
    width: 1.5,
    waypoints: [
      { x: 5, z: 0 },
    ],
  },
  {
    id: 'corridor_hall_dada',
    roomA: 'great_hall',
    roomB: 'dada',
    connectionA: 'west',
    connectionB: 'east',
    width: 1.5,
    waypoints: [
      { x: -5, z: 0 },
    ],
  },
  {
    id: 'corridor_dada_slytherin',
    roomA: 'dada',
    roomB: 'slytherin',
    connectionA: 'south',
    connectionB: 'north',
    width: 1.5,
    waypoints: [
      { x: -10, z: 6 },
    ],
  },
  {
    id: 'corridor_slytherin_potions',
    roomA: 'slytherin',
    roomB: 'potions',
    connectionA: 'east',
    connectionB: 'west',
    width: 1.5,
    waypoints: [],
  },
  {
    id: 'corridor_hall_hufflepuff',
    roomA: 'great_hall',
    roomB: 'hufflepuff',
    connectionA: 'south',
    connectionB: 'north',
    width: 1.5,
    waypoints: [
      { x: 2, z: 5 },
    ],
  },
  {
    id: 'corridor_library_hufflepuff',
    roomA: 'library',
    roomB: 'hufflepuff',
    connectionA: 'south',
    connectionB: 'west',
    width: 1.5,
    waypoints: [
      { x: 10, z: 7 },
      { x: 7, z: 10 },
    ],
  },
];

export const CHARACTERS: CharacterConfig[] = [
  {
    id: 'harry',
    name: 'Harry Potter',
    color: '#ff0000',
    speed: 1.0,
    path: [
      'gryffindor',
      'corridor_gryffindor_hall',
      'great_hall',
      'corridor_hall_library',
      'library',
    ],
  },
  {
    id: 'hermione',
    name: 'Hermione Granger',
    color: '#0000ff',
    speed: 0.8,
    path: [
      'library',
      'corridor_library_hufflepuff',
      'hufflepuff',
      'corridor_hall_hufflepuff',
      'great_hall',
    ],
  },
  {
    id: 'ron',
    name: 'Ron Weasley',
    color: '#ffa500',
    speed: 0.9,
    path: [
      'great_hall',
      'corridor_hall_dada',
      'dada',
      'corridor_dada_slytherin',
      'slytherin',
    ],
  },
];
