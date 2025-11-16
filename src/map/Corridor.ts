import { CorridorConfig, Vector2 } from './types';
import { Room } from './Room';
import { NavMeshImpl } from './NavMesh';

/**
 * Corridor class representing a passageway between rooms
 * Handles path generation, NavMesh, and rendering of hand-drawn style corridors
 */
export class Corridor {
  public id: string;
  public roomAId: string;
  public roomBId: string;
  public connectionA: string;
  public connectionB: string;
  public width: number;
  private waypoints: Vector2[];
  public navMesh: NavMeshImpl | null = null;
  private fullPath: Vector2[] = [];

  constructor(config: CorridorConfig) {
    this.id = config.id;
    this.roomAId = config.roomA;
    this.roomBId = config.roomB;
    this.connectionA = config.connectionA;
    this.connectionB = config.connectionB;
    this.width = config.width;
    this.waypoints = config.waypoints || [];
  }

  /**
   * Initialize corridor NavMesh after rooms are loaded
   */
  initializeNavMesh(roomA: Room, roomB: Room): void {
    this.fullPath = this.generatePath(roomA, roomB);

    // Create NavMesh for corridor with fine grid for better pathfinding
    if (this.fullPath.length >= 2) {
      const bounds = this.getCorridorBounds();
      this.navMesh = new NavMeshImpl(bounds, [], 0.2); // Finer grid to handle curved corridors
    }
  }

  /**
   * Get corridor bounds for NavMesh generation
   * Creates generous bounds to ensure overlap with room connection points
   */
  private getCorridorBounds(): { min: Vector2; max: Vector2 } {
    if (this.fullPath.length === 0) {
      return { min: { x: 0, z: 0 }, max: { x: 0, z: 0 } };
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;

    this.fullPath.forEach((point) => {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minZ = Math.min(minZ, point.z);
      maxZ = Math.max(maxZ, point.z);
    });

    // Use very generous padding to ensure curved paths are fully covered
    // This ensures smooth transitions and full coverage of curved corridors
    const padding = this.width * 2.0;

    return {
      min: { x: minX - padding, z: minZ - padding },
      max: { x: maxX + padding, z: maxZ + padding },
    };
  }

  /**
   * Generate full path including room connection points
   */
  generatePath(roomA: Room, roomB: Room): Vector2[] {
    const path: Vector2[] = [];

    // Start point from room A
    const startPoint = roomA.getConnectionPoint(this.connectionA);
    if (startPoint) {
      path.push(startPoint);
    }

    // Add custom waypoints if any
    path.push(...this.waypoints);

    // End point to room B
    const endPoint = roomB.getConnectionPoint(this.connectionB);
    if (endPoint) {
      path.push(endPoint);
    }

    return path;
  }

  /**
   * Check if a point is within the corridor bounds
   */
  containsPoint(point: Vector2, roomA: Room, roomB: Room): boolean {
    const path = this.generatePath(roomA, roomB);
    const halfWidth = this.width / 2;

    // Check if point is near any segment of the corridor
    for (let i = 0; i < path.length - 1; i++) {
      const segmentStart = path[i];
      const segmentEnd = path[i + 1];

      const distance = this.distanceToLineSegment(point, segmentStart, segmentEnd);
      if (distance <= halfWidth) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if a point is walkable in the corridor
   */
  isWalkable(point: Vector2, roomA: Room, roomB: Room): boolean {
    if (!this.containsPoint(point, roomA, roomB)) {
      return false;
    }
    return this.navMesh ? this.navMesh.isWalkable(point) : false;
  }

  /**
   * Get nearest walkable point in corridor
   */
  getNearestWalkablePoint(point: Vector2): Vector2 {
    return this.navMesh ? this.navMesh.getNearestWalkablePoint(point) : point;
  }

  /**
   * Calculate distance from point to line segment
   */
  private distanceToLineSegment(point: Vector2, lineStart: Vector2, lineEnd: Vector2): number {
    const dx = lineEnd.x - lineStart.x;
    const dz = lineEnd.z - lineStart.z;
    const lengthSquared = dx * dx + dz * dz;

    if (lengthSquared === 0) {
      // Line segment is a point
      const pdx = point.x - lineStart.x;
      const pdz = point.z - lineStart.z;
      return Math.sqrt(pdx * pdx + pdz * pdz);
    }

    // Calculate projection
    const t = Math.max(
      0,
      Math.min(
        1,
        ((point.x - lineStart.x) * dx + (point.z - lineStart.z) * dz) / lengthSquared
      )
    );

    const projectionX = lineStart.x + t * dx;
    const projectionZ = lineStart.z + t * dz;

    const pdx = point.x - projectionX;
    const pdz = point.z - projectionZ;

    return Math.sqrt(pdx * pdx + pdz * pdz);
  }

  /**
   * Get waypoints for rendering
   */
  getWaypoints(roomA: Room, roomB: Room): Vector2[] {
    return this.generatePath(roomA, roomB);
  }
}
