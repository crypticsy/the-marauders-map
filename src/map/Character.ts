import { CharacterConfig, Vector2, BehaviorType, Behavior } from './types';
import { Room } from './Room';
import { Corridor } from './Corridor';
import { BehaviorSystem, DEFAULT_BEHAVIOR_CONFIG } from './BehaviorSystem';

/**
 * Character class representing a person moving through the map
 * Handles NavMesh-based pathfinding, collision detection, and behavior system
 */
export class Character {
  public id: string;
  public name: string;
  public color: string;
  public speed: number;
  private currentPosition: Vector2;
  private rooms: Map<string, Room>;
  private corridors: Map<string, Corridor>;
  private navigationGraph: Map<string, string[]> = new Map(); // Room connections
  private currentRoomId: string = '';
  private currentBehavior: Behavior | null = null;
  private behaviorSystem: BehaviorSystem;
  private currentPath: Vector2[] = []; // Current NavMesh path being followed
  private pathIndex: number = 0; // Index in current path

  constructor(config: CharacterConfig) {
    this.id = config.id;
    this.name = config.name;
    this.color = config.color;
    this.speed = config.speed;
    this.currentPosition = { x: 0, z: 0 };
    this.rooms = new Map();
    this.corridors = new Map();
    this.behaviorSystem = new BehaviorSystem(DEFAULT_BEHAVIOR_CONFIG);
  }

  /**
   * Initialize AI navigation system
   */
  initializePath(rooms: Map<string, Room>, corridors: Map<string, Corridor>): void {
    this.rooms = rooms;
    this.corridors = corridors;

    // Build navigation graph: room -> list of connected rooms
    this.navigationGraph.clear();

    corridors.forEach((corridor) => {
      const { roomAId, roomBId } = corridor;

      // Initialize corridor NavMesh
      const roomA = rooms.get(roomAId);
      const roomB = rooms.get(roomBId);
      if (roomA && roomB) {
        corridor.initializeNavMesh(roomA, roomB);
      }

      // Add bidirectional connections
      if (!this.navigationGraph.has(roomAId)) {
        this.navigationGraph.set(roomAId, []);
      }
      if (!this.navigationGraph.has(roomBId)) {
        this.navigationGraph.set(roomBId, []);
      }

      this.navigationGraph.get(roomAId)!.push(roomBId);
      this.navigationGraph.get(roomBId)!.push(roomAId);
    });

    // Start in a random room
    const roomIds = Array.from(rooms.keys());
    this.currentRoomId = roomIds[Math.floor(Math.random() * roomIds.length)];

    const startRoom = rooms.get(this.currentRoomId);
    if (startRoom) {
      this.currentPosition = startRoom.getRandomWalkablePosition();
    }

    // Choose first behavior
    this.chooseNewBehavior();
  }

  /**
   * Choose a new behavior for the character
   */
  private chooseNewBehavior(): void {
    if (!this.currentRoomId) {
      console.warn(`${this.name}: No current room set!`);
      return;
    }

    const availableRooms = Array.from(this.rooms.keys());
    this.currentBehavior = this.behaviorSystem.chooseNextBehavior(
      this.currentRoomId,
      availableRooms
    );

    console.log(
      `${this.name}: New behavior - ${this.currentBehavior.type} in ${this.currentRoomId}`
    );

    this.executeBehavior();
  }

  /**
   * Execute the current behavior
   */
  private executeBehavior(): void {
    if (!this.currentBehavior) return;

    switch (this.currentBehavior.type) {
      case BehaviorType.WAIT:
        this.executeWaitBehavior();
        break;
      case BehaviorType.ROAM:
        this.executeRoamBehavior();
        break;
      case BehaviorType.MOVE_TO_TARGET:
        this.executeMoveToTargetBehavior();
        break;
    }
  }

  /**
   * Execute WAIT behavior - stay in place
   */
  private executeWaitBehavior(): void {
    this.currentPath = [];
    this.pathIndex = 0;
  }

  /**
   * Execute ROAM behavior - wander within current room
   */
  private executeRoamBehavior(): void {
    const currentRoom = this.rooms.get(this.currentRoomId);
    if (!currentRoom) return;

    // Get random walkable position in room
    const targetPosition = currentRoom.getRandomWalkablePosition();

    // Find path using NavMesh
    this.currentPath = currentRoom.findPathInRoom(this.currentPosition, targetPosition);
    this.pathIndex = 0;

    console.log(`${this.name}: Roaming to position (${targetPosition.x.toFixed(2)}, ${targetPosition.z.toFixed(2)})`);
  }

  /**
   * Execute MOVE_TO_TARGET behavior - travel to another room
   */
  private executeMoveToTargetBehavior(): void {
    if (!this.currentBehavior?.targetRoomId) return;

    const targetRoomId = this.currentBehavior.targetRoomId;

    if (targetRoomId === this.currentRoomId) {
      // Already in target room, just roam instead
      this.currentBehavior = this.behaviorSystem.createRoamBehavior(this.currentRoomId);
      this.executeRoamBehavior();
      return;
    }

    // Find room path using BFS
    const roomPath = this.findRoomPath(this.currentRoomId, targetRoomId);

    if (roomPath.length === 0) {
      console.warn(`${this.name}: No path found to ${targetRoomId}`);
      this.chooseNewBehavior();
      return;
    }

    // Build NavMesh path through rooms and corridors
    this.buildNavMeshPath(roomPath);

    console.log(`${this.name}: Moving from ${this.currentRoomId} to ${targetRoomId}`);
  }

  /**
   * Find path between two rooms using BFS
   */
  private findRoomPath(startId: string, endId: string): string[] {
    const queue: Array<{ roomId: string; path: string[] }> = [{ roomId: startId, path: [startId] }];
    const visited = new Set<string>([startId]);

    while (queue.length > 0) {
      const { roomId, path } = queue.shift()!;

      if (roomId === endId) {
        return path;
      }

      const neighbors = this.navigationGraph.get(roomId) || [];
      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push({ roomId: neighborId, path: [...path, neighborId] });
        }
      }
    }

    return []; // No path found
  }

  /**
   * Build NavMesh path through multiple rooms and corridors
   */
  private buildNavMeshPath(roomPath: string[]): void {
    this.currentPath = [];

    for (let i = 0; i < roomPath.length; i++) {
      const roomId = roomPath[i];
      const room = this.rooms.get(roomId);
      if (!room) continue;

      if (i === 0) {
        // First room - start from current position
        const roomCenter = { x: room.position.x, z: room.position.z };
        const exitPoint =
          i < roomPath.length - 1
            ? this.getExitPointToNextRoom(room, roomPath[i + 1])
            : room.getNearestWalkablePoint(roomCenter);

        const pathInRoom = room.findPathInRoom(this.currentPosition, exitPoint);
        this.currentPath.push(...pathInRoom);
      } else if (i === roomPath.length - 1) {
        // Last room - navigate to center or random position
        const entryPoint = this.getEntryPointFromPreviousRoom(room, roomPath[i - 1]);
        const targetPosition = room.getRandomWalkablePosition();
        const pathInRoom = room.findPathInRoom(entryPoint, targetPosition);
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
            // Use corridor NavMesh to find path between first and last waypoint
            if (corridorWaypoints.length >= 2) {
              const corridorStart = corridorWaypoints[0];
              const corridorEnd = corridorWaypoints[corridorWaypoints.length - 1];
              const corridorNavPath = corridor.navMesh.findPath(corridorStart, corridorEnd);
              this.currentPath.push(...corridorNavPath);
            } else {
              // Fallback to direct waypoints if too few
              this.currentPath.push(...corridorWaypoints);
            }
          }
        }
      }
    }

    this.pathIndex = 0;

    // Update current room to target
    if (roomPath.length > 0) {
      // We'll update currentRoomId as we move through rooms
    }
  }

  /**
   * Get entry point to room from previous room
   */
  private getEntryPointFromPreviousRoom(room: Room, previousRoomId: string): Vector2 {
    const corridor = this.findCorridorBetween(previousRoomId, room.id);
    if (corridor) {
      const connectionName =
        corridor.roomAId === room.id ? corridor.connectionA : corridor.connectionB;
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
      const connectionName =
        corridor.roomAId === room.id ? corridor.connectionA : corridor.connectionB;
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
   * Update character position based on time delta
   */
  update(deltaTime: number): void {
    if (!this.currentBehavior) {
      this.chooseNewBehavior();
      return;
    }

    // Update behavior timer
    const behaviorComplete = this.behaviorSystem.updateBehavior(
      this.currentBehavior,
      deltaTime
    );

    if (behaviorComplete) {
      this.chooseNewBehavior();
      return;
    }

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
          if (this.currentBehavior.type === BehaviorType.ROAM) {
            // Choose new roam target
            this.executeRoamBehavior();
          } else if (this.currentBehavior.type === BehaviorType.MOVE_TO_TARGET) {
            // Update current room
            if (this.currentBehavior.targetRoomId) {
              this.currentRoomId = this.currentBehavior.targetRoomId;
            }
            // Choose new behavior after arrival
            setTimeout(() => {
              this.chooseNewBehavior();
            }, 500);
          }
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

        // Update current room based on position
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
   * Get nearest walkable point to a position
   */
  private getNearestWalkablePoint(position: Vector2): Vector2 {
    // Try current room first
    const currentRoom = this.rooms.get(this.currentRoomId);
    if (currentRoom && currentRoom.containsPoint(position)) {
      return currentRoom.getNearestWalkablePoint(position);
    }

    // Check all rooms
    for (const room of this.rooms.values()) {
      if (room.containsPoint(position)) {
        return room.getNearestWalkablePoint(position);
      }
    }

    // Return current position as fallback
    return this.currentPosition;
  }

  /**
   * Update current room based on position
   */
  private updateCurrentRoom(): void {
    for (const room of this.rooms.values()) {
      if (room.containsPoint(this.currentPosition)) {
        if (room.id !== this.currentRoomId) {
          console.log(`${this.name}: Entering ${room.id}`);
          this.currentRoomId = room.id;
        }
        return;
      }
    }
  }

  /**
   * Get current 3D position for rendering
   */
  getPosition3D(y: number = 0.5): { x: number; y: number; z: number } {
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
   * Reset to beginning of path
   */
  reset(): void {
    this.pathIndex = 0;
    if (this.currentPath.length > 0) {
      this.currentPosition = { ...this.currentPath[0] };
    }
  }
}
