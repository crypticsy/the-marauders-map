import { CharacterConfig, Vector2, PathSegment } from './types';
import { Room } from './Room';
import { Corridor } from './Corridor';

/**
 * Character class representing a person moving through the map
 * Handles animated footstep movement along valid paths
 */
export class Character {
  public id: string;
  public name: string;
  public color: string;
  public speed: number;
  private pathIds: string[]; // IDs of rooms/corridors to visit
  private currentSegmentIndex: number = 0;
  private progress: number = 0; // 0-1 progress through current segment
  private currentPosition: Vector2;
  private pathSegments: PathSegment[] = [];

  constructor(config: CharacterConfig) {
    this.id = config.id;
    this.name = config.name;
    this.color = config.color;
    this.speed = config.speed;
    this.pathIds = config.path;
    this.currentPosition = { x: 0, z: 0 };
  }

  /**
   * Initialize path segments from rooms and corridors
   */
  initializePath(rooms: Map<string, Room>, corridors: Map<string, Corridor>): void {
    this.pathSegments = [];

    for (let i = 0; i < this.pathIds.length; i++) {
      const pathId = this.pathIds[i];
      const room = rooms.get(pathId);

      if (room) {
        // For rooms, create a simple path through the center
        const waypoints: Vector2[] = [];

        // If coming from a corridor, start at the entry point
        if (i > 0) {
          const prevId = this.pathIds[i - 1];
          const prevCorridor = corridors.get(prevId);
          if (prevCorridor && prevCorridor.roomBId === pathId) {
            const entryPoint = room.getConnectionPoint(prevCorridor.connectionB);
            if (entryPoint) waypoints.push(entryPoint);
          }
        }

        // Add room center
        waypoints.push({ x: room.position.x, z: room.position.z });

        // If going to a corridor, end at the exit point
        if (i < this.pathIds.length - 1) {
          const nextId = this.pathIds[i + 1];
          const nextCorridor = corridors.get(nextId);
          if (nextCorridor && nextCorridor.roomAId === pathId) {
            const exitPoint = room.getConnectionPoint(nextCorridor.connectionA);
            if (exitPoint) waypoints.push(exitPoint);
          }
        }

        // If we only have one waypoint, duplicate it so we have a path
        if (waypoints.length === 1) {
          waypoints.push({ ...waypoints[0] });
        }

        this.pathSegments.push({
          type: 'room',
          id: pathId,
          waypoints,
        });
        continue;
      }

      const corridor = corridors.get(pathId);
      if (corridor) {
        const roomA = rooms.get(corridor.roomAId);
        const roomB = rooms.get(corridor.roomBId);
        if (roomA && roomB) {
          this.pathSegments.push({
            type: 'corridor',
            id: pathId,
            waypoints: corridor.getWaypoints(roomA, roomB),
          });
        }
      }
    }

    // Initialize starting position
    if (this.pathSegments.length > 0 && this.pathSegments[0].waypoints.length > 0) {
      this.currentPosition = { ...this.pathSegments[0].waypoints[0] };
    }
  }

  /**
   * Update character position based on time delta
   */
  update(deltaTime: number): void {
    if (this.pathSegments.length === 0) {
      console.log(`${this.name}: No path segments`);
      return;
    }

    const currentSegment = this.pathSegments[this.currentSegmentIndex];
    if (!currentSegment || currentSegment.waypoints.length < 2) {
      console.log(`${this.name}: Invalid segment or waypoints`, currentSegment);
      return;
    }

    // Update progress
    this.progress += deltaTime * this.speed;

    // Move to next segment if needed
    if (this.progress >= currentSegment.waypoints.length - 1) {
      this.currentSegmentIndex = (this.currentSegmentIndex + 1) % this.pathSegments.length;
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
