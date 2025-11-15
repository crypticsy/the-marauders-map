// Type definitions for the Marauder's Map system

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Vector2 {
  x: number;
  z: number;
}

export interface RoomConfig {
  id: string;
  name: string;
  position: Vector3;
  size: Vector3;
  color: string;
  connectionPoints: { [key: string]: Vector2 }; // e.g., { north: {x, z}, south: {x, z} }
}

export interface CorridorConfig {
  id: string;
  roomA: string; // Room ID
  roomB: string; // Room ID
  connectionA: string; // Connection point name on roomA
  connectionB: string; // Connection point name on roomB
  waypoints?: Vector2[]; // Optional waypoints for curved corridors
  width: number;
}

export interface CharacterConfig {
  id: string;
  name: string;
  color: string;
  path: string[]; // Array of room/corridor IDs
  speed: number; // Units per second
}

export type PathSegment = {
  type: 'room' | 'corridor';
  id: string;
  waypoints: Vector2[];
};
