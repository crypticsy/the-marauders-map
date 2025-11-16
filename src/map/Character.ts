import { CharacterConfig, Vector2, PathSegment } from './types';
import { Room } from './Room';
import { Corridor } from './Corridor';

/**
 * Character class representing a person moving through the map
 * Handles animated footstep movement with AI-based pathfinding
 */
export class Character {
  public id: string;
  public name: string;
  public color: string;
  public speed: number;
  private currentSegmentIndex: number = 0;
  private progress: number = 0; // 0-1 progress through current segment
  private currentPosition: Vector2;
  private pathSegments: PathSegment[] = [];
  private rooms: Map<string, Room>;
  private corridors: Map<string, Corridor>;
  private navigationGraph: Map<string, string[]> = new Map(); // Room connections
  private currentRoomId: string = '';
  private targetRoomId: string = '';
  private isAIMode: boolean = true;
  private isWandering: boolean = false; // Is character wandering in current room?
  private wanderTimer: number = 0;

  constructor(config: CharacterConfig) {
    this.id = config.id;
    this.name = config.name;
    this.color = config.color;
    this.speed = config.speed;
    this.currentPosition = { x: 0, z: 0 };
    this.rooms = new Map();
    this.corridors = new Map();
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
      this.currentPosition = { x: startRoom.position.x, z: startRoom.position.z };
    }

    // Choose first destination
    this.chooseNewDestination();
  }

  /**
   * Choose a new action: wander in current room or travel to another room
   */
  private chooseNewDestination(): void {
    if (!this.currentRoomId) {
      console.warn(`${this.name}: No current room set!`);
      return;
    }

    // 60% chance to wander in current room, 40% chance to travel
    if (Math.random() < 0.6) {
      this.startWandering();
    } else {
      this.travelToAnotherRoom();
    }
  }

  /**
   * Start wandering within the current room
   */
  private startWandering(): void {
    const currentRoom = this.rooms.get(this.currentRoomId);
    if (!currentRoom) return;

    this.isWandering = true;
    this.wanderTimer = 3000 + Math.random() * 5000; // Wander for 3-8 seconds

    // Create random waypoints within the room
    const numWaypoints = 3 + Math.floor(Math.random() * 3); // 3-5 waypoints
    const waypoints: Vector2[] = [];

    const roomSize = currentRoom.size;
    const roomPos = currentRoom.position;

    for (let i = 0; i < numWaypoints; i++) {
      waypoints.push({
        x: roomPos.x + (Math.random() - 0.5) * roomSize.x * 0.6,
        z: roomPos.z + (Math.random() - 0.5) * roomSize.z * 0.6,
      });
    }

    // Add current position as first waypoint for smooth transition
    waypoints.unshift({ ...this.currentPosition });

    this.pathSegments = [{
      type: 'room',
      id: this.currentRoomId,
      waypoints,
    }];

    this.currentSegmentIndex = 0;
    this.progress = 0;

    console.log(`${this.name}: Wandering in ${this.currentRoomId}`);
  }

  /**
   * Travel to another room
   */
  private travelToAnotherRoom(): void {
    const roomIds = Array.from(this.rooms.keys());

    // Choose a random room that's not the current room
    const availableRooms = roomIds.filter(id => id !== this.currentRoomId);
    if (availableRooms.length === 0) return;

    this.isWandering = false;
    this.targetRoomId = availableRooms[Math.floor(Math.random() * availableRooms.length)];

    // Find path using BFS from current location
    const path = this.findPath(this.currentRoomId, this.targetRoomId);

    if (path.length > 0) {
      this.buildPathSegments(path);
      this.currentSegmentIndex = 0;
      this.progress = 0;

      console.log(`${this.name}: Traveling from ${this.currentRoomId} to ${this.targetRoomId}`);
    }
  }

  /**
   * Find path between two rooms using BFS
   */
  private findPath(startId: string, endId: string): string[] {
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
   * Build path segments from room sequence (explicitly tracks room transitions)
   */
  private buildPathSegments(roomPath: string[]): void {
    this.pathSegments = [];

    for (let i = 0; i < roomPath.length; i++) {
      const roomId = roomPath[i];
      const room = this.rooms.get(roomId);
      if (!room) continue;

      // If not the first room, add corridor to this room
      if (i > 0) {
        const prevRoomId = roomPath[i - 1];
        const corridor = this.findCorridorBetween(prevRoomId, roomId);

        if (corridor) {
          const roomA = this.rooms.get(corridor.roomAId);
          const roomB = this.rooms.get(corridor.roomBId);
          if (roomA && roomB) {
            this.pathSegments.push({
              type: 'corridor',
              id: corridor.id,
              waypoints: corridor.getWaypoints(roomA, roomB),
            });
          }
        }
      }

      // Add room waypoint - just the center for passing through
      this.pathSegments.push({
        type: 'room',
        id: roomId,
        waypoints: [
          { x: room.position.x, z: room.position.z },
          { x: room.position.x, z: room.position.z }
        ],
      });
    }

    // Track that we'll be entering the last room in the path
    if (roomPath.length > 0) {
      this.targetRoomId = roomPath[roomPath.length - 1];
    }
  }

  /**
   * Find corridor connecting two rooms
   */
  private findCorridorBetween(roomA: string, roomB: string): Corridor | null {
    for (const corridor of this.corridors.values()) {
      if ((corridor.roomAId === roomA && corridor.roomBId === roomB) ||
          (corridor.roomAId === roomB && corridor.roomBId === roomA)) {
        return corridor;
      }
    }
    return null;
  }

  /**
   * Update character position based on time delta (AI navigation with wandering)
   */
  update(deltaTime: number): void {
    // Handle wandering timer
    if (this.isWandering) {
      this.wanderTimer -= deltaTime * 1000; // Convert to milliseconds
      if (this.wanderTimer <= 0) {
        // Finished wandering, choose new action
        this.chooseNewDestination();
        return;
      }
    }

    if (this.pathSegments.length === 0) {
      this.chooseNewDestination();
      return;
    }

    const currentSegment = this.pathSegments[this.currentSegmentIndex];
    if (!currentSegment || currentSegment.waypoints.length < 2) {
      this.chooseNewDestination();
      return;
    }

    // Update current room if we're in a room segment
    if (currentSegment.type === 'room' && currentSegment.id !== this.currentRoomId) {
      console.log(`${this.name}: Entering ${currentSegment.id}`);
      this.currentRoomId = currentSegment.id;
    }

    // Update progress
    this.progress += deltaTime * this.speed * (this.isWandering ? 0.5 : 1.0); // Slower when wandering

    // Move to next segment if needed
    if (this.progress >= currentSegment.waypoints.length - 1) {
      this.currentSegmentIndex++;

      // If reached the end of path
      if (this.currentSegmentIndex >= this.pathSegments.length) {
        if (this.isWandering) {
          // Continue wandering or choose new action
          if (this.wanderTimer > 0) {
            this.progress = 0;
            this.currentSegmentIndex = this.pathSegments.length - 1;
            return;
          }
        } else {
          // Arrived at destination room
          this.currentRoomId = this.targetRoomId;
          console.log(`${this.name}: Arrived at ${this.currentRoomId}`);
        }

        // Brief pause before choosing new action
        setTimeout(() => {
          this.chooseNewDestination();
        }, 500 + Math.random() * 1500); // 0.5-2 second pause

        // Stay at current position
        this.progress = 0;
        this.currentSegmentIndex = Math.max(0, this.pathSegments.length - 1);
        return;
      }

      this.progress = 0;
      return;
    }

    // Calculate current position using interpolation
    const waypointIndex = Math.floor(this.progress);
    const t = this.progress - waypointIndex;

    const currentWaypoint = currentSegment.waypoints[waypointIndex];
    const nextWaypoint = currentSegment.waypoints[waypointIndex + 1];

    this.currentPosition = {
      x: currentWaypoint.x + (nextWaypoint.x - currentWaypoint.x) * t,
      z: currentWaypoint.z + (nextWaypoint.z - currentWaypoint.z) * t,
    };
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
    this.currentSegmentIndex = 0;
    this.progress = 0;
    if (this.pathSegments.length > 0 && this.pathSegments[0].waypoints.length > 0) {
      this.currentPosition = { ...this.pathSegments[0].waypoints[0] };
    }
  }
}
