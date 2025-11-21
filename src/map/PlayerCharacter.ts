import { Vector2 } from './types';
import { Room } from './Room';
import { Corridor } from './Corridor';

/**
 * PlayerCharacter class - manually controlled character
 * Uses the same NavMesh system as AI characters but with user control
 */
export class PlayerCharacter {
  public id: string = 'player';
  public name: string;
  public color: string;
  public speed: number;
  private currentPosition: Vector2;
  private rooms: Map<string, Room>;
  private corridors: Map<string, Corridor>;
  private currentRoomId: string = '';
  private currentPath: Vector2[] = [];
  private pathIndex: number = 0;
  private targetPosition: Vector2 | null = null;

  constructor(name: string = 'You', color: string = '#ff0000', speed: number = 4) {
    this.name = name;
    this.color = color;
    this.speed = speed;
    this.currentPosition = { x: 0, z: 0 };
    this.rooms = new Map();
    this.corridors = new Map();
  }

  /**
   * Initialize player in a random room
   */
  initialize(rooms: Map<string, Room>, corridors: Map<string, Corridor>): void {
    this.rooms = rooms;
    this.corridors = corridors;

    // Start in a random room
    const roomIds = Array.from(rooms.keys());
    this.currentRoomId = roomIds[Math.floor(Math.random() * roomIds.length)];

    const startRoom = rooms.get(this.currentRoomId);
    if (startRoom) {
      this.currentPosition = startRoom.getRandomWalkablePosition();
    }
  }

  /**
   * Set a target position for the player to move to
   */
  setTargetPosition(target: Vector2): void {
    this.targetPosition = target;
    this.findPathToTarget(target);
  }

  /**
   * Move player in a direction (for keyboard controls)
   */
  moveInDirection(direction: Vector2, deltaTime: number): void {
    // Calculate new position based on direction and speed
    const moveDistance = this.speed * deltaTime;
    const dirLength = Math.sqrt(direction.x * direction.x + direction.z * direction.z);

    if (dirLength === 0) return;

    // Normalize direction
    const normalizedDir = {
      x: direction.x / dirLength,
      z: direction.z / dirLength
    };

    const newPosition = {
      x: this.currentPosition.x + normalizedDir.x * moveDistance,
      z: this.currentPosition.z + normalizedDir.z * moveDistance
    };

    // Check if new position is walkable
    if (this.isPositionWalkable(newPosition)) {
      this.currentPosition = newPosition;
      // Clear any existing path when moving with keyboard
      this.currentPath = [];
      this.pathIndex = 0;
      this.targetPosition = null;
    } else {
      // Try to find nearest walkable point
      const walkablePoint = this.getNearestWalkablePoint(newPosition);
      // Only move if the walkable point is close enough
      const distToWalkable = Math.sqrt(
        Math.pow(walkablePoint.x - newPosition.x, 2) +
        Math.pow(walkablePoint.z - newPosition.z, 2)
      );
      if (distToWalkable < 0.5) {
        this.currentPosition = walkablePoint;
        this.currentPath = [];
        this.pathIndex = 0;
        this.targetPosition = null;
      }
    }

    // Update current room
    this.updateCurrentRoom();
  }

  /**
   * Find path to target position using NavMesh
   */
  private findPathToTarget(target: Vector2): void {
    // Find which room/corridor the target is in
    let targetRoom: Room | null = null;

    // Check rooms
    for (const room of this.rooms.values()) {
      if (room.containsPoint(target)) {
        targetRoom = room;
        break;
      }
    }

    if (!targetRoom) {
      console.warn('Target position not in any room');
      return;
    }

    // If target is in current room, simple pathfinding
    const currentRoom = this.rooms.get(this.currentRoomId);
    if (currentRoom && targetRoom.id === this.currentRoomId) {
      this.currentPath = currentRoom.findPathInRoom(this.currentPosition, target);
      this.pathIndex = 0;
      return;
    }

    // If target is in different room, find room path first
    if (currentRoom) {
      const roomPath = this.findRoomPath(this.currentRoomId, targetRoom.id);
      if (roomPath.length > 0) {
        this.buildNavMeshPath(roomPath, target);
      }
    }
  }

  /**
   * Find path between two rooms using BFS
   */
  private findRoomPath(startId: string, endId: string): string[] {
    // Build navigation graph from corridors
    const navigationGraph = new Map<string, string[]>();

    this.corridors.forEach((corridor) => {
      const { roomAId, roomBId } = corridor;

      if (!navigationGraph.has(roomAId)) {
        navigationGraph.set(roomAId, []);
      }
      if (!navigationGraph.has(roomBId)) {
        navigationGraph.set(roomBId, []);
      }

      navigationGraph.get(roomAId)!.push(roomBId);
      navigationGraph.get(roomBId)!.push(roomAId);
    });

    const queue: Array<{ roomId: string; path: string[] }> = [{ roomId: startId, path: [startId] }];
    const visited = new Set<string>([startId]);

    while (queue.length > 0) {
      const { roomId, path } = queue.shift()!;

      if (roomId === endId) {
        return path;
      }

      const neighbors = navigationGraph.get(roomId) || [];
      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push({ roomId: neighborId, path: [...path, neighborId] });
        }
      }
    }

    return [];
  }

  /**
   * Build NavMesh path through multiple rooms
   */
  private buildNavMeshPath(roomPath: string[], finalTarget: Vector2): void {
    this.currentPath = [];

    for (let i = 0; i < roomPath.length; i++) {
      const roomId = roomPath[i];
      const room = this.rooms.get(roomId);
      if (!room) continue;

      if (i === 0) {
        // First room - start from current position
        const exitPoint = i < roomPath.length - 1
          ? this.getExitPointToNextRoom(room, roomPath[i + 1])
          : room.getNearestWalkablePoint(finalTarget);

        const pathInRoom = room.findPathInRoom(this.currentPosition, exitPoint);
        this.currentPath.push(...pathInRoom);
      } else if (i === roomPath.length - 1) {
        // Last room - navigate to final target
        const entryPoint = this.getEntryPointFromPreviousRoom(room, roomPath[i - 1]);
        const pathInRoom = room.findPathInRoom(entryPoint, room.getNearestWalkablePoint(finalTarget));
        this.currentPath.push(...pathInRoom);
      } else {
        // Middle room - navigate through
        const entryPoint = this.getEntryPointFromPreviousRoom(room, roomPath[i - 1]);
        const exitPoint = this.getExitPointToNextRoom(room, roomPath[i + 1]);
        const pathInRoom = room.findPathInRoom(entryPoint, exitPoint);
        this.currentPath.push(...pathInRoom);
      }

      // Add corridor path if not the last room
      if (i < roomPath.length - 1) {
        const corridor = this.findCorridorBetween(roomId, roomPath[i + 1]);
        if (corridor && corridor.navMesh) {
          const roomA = this.rooms.get(corridor.roomAId);
          const roomB = this.rooms.get(corridor.roomBId);
          if (roomA && roomB) {
            const corridorWaypoints = corridor.getWaypoints(roomA, roomB);
            if (corridorWaypoints.length >= 2) {
              const corridorStart = corridorWaypoints[0];
              const corridorEnd = corridorWaypoints[corridorWaypoints.length - 1];
              const corridorNavPath = corridor.navMesh.findPath(corridorStart, corridorEnd);
              this.currentPath.push(...corridorNavPath);
            } else {
              this.currentPath.push(...corridorWaypoints);
            }
          }
        }
      }
    }

    this.pathIndex = 0;
  }

  /**
   * Get entry point to room from previous room
   */
  private getEntryPointFromPreviousRoom(room: Room, previousRoomId: string): Vector2 {
    const corridor = this.findCorridorBetween(previousRoomId, room.id);
    if (corridor) {
      const connectionName = corridor.roomAId === room.id ? corridor.connectionA : corridor.connectionB;
      const point = room.getConnectionPoint(connectionName);
      if (point) {
        return room.getNearestWalkablePoint(point);
      }
    }
    return room.getNearestWalkablePoint({ x: room.position.x, z: room.position.z });
  }

  /**
   * Get exit point from room to next room
   */
  private getExitPointToNextRoom(room: Room, nextRoomId: string): Vector2 {
    const corridor = this.findCorridorBetween(room.id, nextRoomId);
    if (corridor) {
      const connectionName = corridor.roomAId === room.id ? corridor.connectionA : corridor.connectionB;
      const point = room.getConnectionPoint(connectionName);
      if (point) {
        return room.getNearestWalkablePoint(point);
      }
    }
    return room.getNearestWalkablePoint({ x: room.position.x, z: room.position.z });
  }

  /**
   * Find corridor connecting two rooms
   */
  private findCorridorBetween(roomA: string, roomB: string): Corridor | null {
    for (const corridor of this.corridors.values()) {
      if (
        (corridor.roomAId === roomA && corridor.roomBId === roomB) ||
        (corridor.roomAId === roomB && corridor.roomBId === roomA)
      ) {
        return corridor;
      }
    }
    return null;
  }

  /**
   * Update player position
   */
  update(deltaTime: number): void {
    // Move along current path
    if (this.currentPath.length > 1 && this.pathIndex < this.currentPath.length - 1) {
      const nextWaypoint = this.currentPath[this.pathIndex + 1];

      // Calculate direction
      const dx = nextWaypoint.x - this.currentPosition.x;
      const dz = nextWaypoint.z - this.currentPosition.z;
      const distance = Math.sqrt(dx * dx + dz * dz);

      if (distance < 0.1) {
        // Reached waypoint, move to next
        this.pathIndex++;
        if (this.pathIndex >= this.currentPath.length - 1) {
          // Reached end of path
          this.currentPath = [];
          this.pathIndex = 0;
          this.targetPosition = null;
        }
      } else {
        // Move towards next waypoint
        const moveDistance = this.speed * deltaTime;
        const moveRatio = Math.min(moveDistance / distance, 1);

        const newX = this.currentPosition.x + dx * moveRatio;
        const newZ = this.currentPosition.z + dz * moveRatio;
        const newPosition = { x: newX, z: newZ };

        // Check if new position is walkable
        if (this.isPositionWalkable(newPosition)) {
          this.currentPosition = newPosition;
        } else {
          // Try to find nearest walkable point
          const walkablePoint = this.getNearestWalkablePoint(newPosition);
          this.currentPosition = walkablePoint;
        }

        // Update current room
        this.updateCurrentRoom();
      }
    }
  }

  /**
   * Check if a position is walkable
   */
  private isPositionWalkable(position: Vector2): boolean {
    // Check if in any room
    for (const room of this.rooms.values()) {
      if (room.containsPoint(position)) {
        return room.isWalkable(position);
      }
    }

    // Check if in any corridor
    for (const corridor of this.corridors.values()) {
      const roomA = this.rooms.get(corridor.roomAId);
      const roomB = this.rooms.get(corridor.roomBId);
      if (roomA && roomB && corridor.containsPoint(position, roomA, roomB)) {
        return corridor.navMesh ? corridor.navMesh.isWalkable(position) : true;
      }
    }

    return false;
  }

  /**
   * Get nearest walkable point
   */
  private getNearestWalkablePoint(position: Vector2): Vector2 {
    const currentRoom = this.rooms.get(this.currentRoomId);
    if (currentRoom && currentRoom.containsPoint(position)) {
      return currentRoom.getNearestWalkablePoint(position);
    }

    for (const room of this.rooms.values()) {
      if (room.containsPoint(position)) {
        return room.getNearestWalkablePoint(position);
      }
    }

    return this.currentPosition;
  }

  /**
   * Update current room based on position
   */
  private updateCurrentRoom(): void {
    for (const room of this.rooms.values()) {
      if (room.containsPoint(this.currentPosition)) {
        if (room.id !== this.currentRoomId) {
          console.log(`Player: Entering ${room.id}`);
          this.currentRoomId = room.id;
        }
        return;
      }
    }
  }

  /**
   * Get current 3D position for rendering
   */
  getPosition3D(y: number = 0.05): { x: number; y: number; z: number } {
    return {
      x: this.currentPosition.x,
      y,
      z: this.currentPosition.z,
    };
  }

  /**
   * Get current 2D position
   */
  getPosition2D(): Vector2 {
    return { ...this.currentPosition };
  }

  /**
   * Check if player is currently moving
   */
  isMoving(): boolean {
    return this.currentPath.length > 0 && this.pathIndex < this.currentPath.length - 1;
  }

  /**
   * Reset player
   */
  reset(): void {
    this.pathIndex = 0;
    this.currentPath = [];
    this.targetPosition = null;
  }
}
