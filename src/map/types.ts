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
  obstacles?: ObstacleConfig[]; // Furniture and obstacles in the room
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
  speed: number; // Units per second
}

export type PathSegment = {
  type: 'room' | 'corridor';
  id: string;
  waypoints: Vector2[];
};

// Obstacle types
export interface ObstacleConfig {
  id: string;
  name: string;
  position: Vector2; // Relative to room center
  size: Vector2; // Width and depth
  height?: number; // Height for rendering (default 1.0)
  type: 'furniture' | 'wall' | 'decoration';
}

export interface Obstacle {
  id: string;
  name: string;
  position: Vector2; // Absolute position
  size: Vector2;
  height: number;
  type: 'furniture' | 'wall' | 'decoration';
  containsPoint(point: Vector2): boolean;
  getExpandedBounds(padding: number): { min: Vector2; max: Vector2 };
}

// NavMesh types
export interface NavNode {
  id: number;
  position: Vector2;
  neighbors: number[]; // IDs of connected nodes
}

export interface NavMesh {
  nodes: NavNode[];
  walkablePolygons: Vector2[][]; // Polygons defining walkable area
  gridSize: number;
  bounds: { min: Vector2; max: Vector2 };
  isWalkable(point: Vector2): boolean;
  getNearestWalkablePoint(point: Vector2): Vector2;
  findPath(start: Vector2, end: Vector2): Vector2[];
  getRandomWalkablePoint(): Vector2;
}

// Behavior types
export enum BehaviorType {
  WAIT = 'wait',
  ROAM = 'roam',
  MOVE_TO_TARGET = 'move_to_target',
}

export interface Behavior {
  type: BehaviorType;
  targetPosition?: Vector2;
  targetRoomId?: string;
  duration?: number; // For WAIT behavior (milliseconds)
  remainingTime?: number;
}

export interface BehaviorConfig {
  waitChance: number; // 0-1 probability
  roamChance: number; // 0-1 probability
  moveChance: number; // 0-1 probability
  minWaitTime: number; // milliseconds
  maxWaitTime: number; // milliseconds
  minRoamTime: number; // milliseconds
  maxRoamTime: number; // milliseconds
}
