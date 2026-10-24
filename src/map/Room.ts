import { RoomConfig, Vector3, Vector2 } from './types';

export type WallSide = 'north' | 'south' | 'east' | 'west';

export interface Doorway {
  name: string;
  side: WallSide;
  offset: Vector2; // Relative to room center
}
import { ObstacleImpl } from './Obstacle';
import { NavMeshImpl } from './NavMesh';

/**
 * Room class representing a location in Hogwarts
 * Handles 3D rendering, NavMesh, obstacles, and connection points for corridors
 */
export class Room {
  public id: string;
  public name: string;
  public position: Vector3;
  public size: Vector3;
  public color: string;
  public connectionPoints: Map<string, Vector2>;
  public obstacles: ObstacleImpl[] = [];
  public navMesh: NavMeshImpl;
  public shape: 'rect' | 'round';
  public floor: 'stone' | 'grass' | 'wood';
  public labelOffset: Vector2;

  constructor(config: RoomConfig) {
    this.id = config.id;
    this.name = config.name;
    this.position = config.position;
    this.size = config.size;
    this.color = config.color;
    this.connectionPoints = new Map(Object.entries(config.connectionPoints));
    this.shape = config.shape || 'rect';
    this.floor = config.floor || 'stone';
    this.labelOffset = config.labelOffset || { x: 0, z: 0 };

    // Create obstacles
    if (config.obstacles) {
      this.obstacles = config.obstacles.map(
        (obstacleConfig) => new ObstacleImpl(obstacleConfig, { x: this.position.x, z: this.position.z })
      );
    }

    // Create NavMesh for this room (finer grid for better navigation)
    const bounds = this.getRoomBounds();
    this.navMesh = new NavMeshImpl(bounds, this.obstacles, 0.2, (point) => this.isOffFloor(point));
  }

  /**
   * Radius of a round room (towers); size.x is the diameter
   */
  getRadius(): number {
    return this.size.x / 2;
  }

  /**
   * Keep navigation on the room's floor: the interior (85% of the room, which
   * leaves space for the walls) plus a passage through each doorway. Without this
   * the padded NavMesh bounds leak into a strip outside the walls, where paths
   * get planned but movement is refused, leaving characters stuck.
   */
  private isOffFloor(point: Vector2): boolean {
    const dx = point.x - this.position.x;
    const dz = point.z - this.position.z;
    const halfWidth = this.size.x / 2;
    const halfDepth = this.size.z / 2;

    // Never outside the room's own footprint
    if (Math.abs(dx) > halfWidth + 0.01 || Math.abs(dz) > halfDepth + 0.01) return true;

    const inInterior =
      this.shape === 'round'
        ? Math.sqrt(dx * dx + dz * dz) <= this.getRadius() * 0.82
        : Math.abs(dx) <= halfWidth * 0.85 && Math.abs(dz) <= halfDepth * 0.85;
    if (inInterior) return false;

    // Doorways reach far enough to join up with the interior
    return !this.getDoorways().some((door) => {
      const depth = door.side === 'east' || door.side === 'west' ? halfWidth : halfDepth;
      const reach = depth * (this.shape === 'round' ? 0.18 : 0.15) + 0.8;
      return Math.sqrt((dx - door.offset.x) ** 2 + (dz - door.offset.z) ** 2) < reach;
    });
  }

  /**
   * Describe each connection point as a doorway on one of the four walls
   */
  getDoorways(): Doorway[] {
    const halfWidth = this.size.x / 2;
    const halfDepth = this.size.z / 2;
    const doorways: Doorway[] = [];

    this.connectionPoints.forEach((offset, name) => {
      // Pick the wall the point sits closest to
      const distances: Array<[WallSide, number]> = [
        ['north', Math.abs(offset.z + halfDepth)],
        ['south', Math.abs(offset.z - halfDepth)],
        ['east', Math.abs(offset.x - halfWidth)],
        ['west', Math.abs(offset.x + halfWidth)],
      ];
      distances.sort((a, b) => a[1] - b[1]);
      doorways.push({ name, side: distances[0][0], offset });
    });

    return doorways;
  }

  /**
   * Get room bounds for NavMesh generation
   * Ensures connection points are included in walkable area
   */
  private getRoomBounds(): { min: Vector2; max: Vector2 } {
    const halfWidth = this.size.x / 2;
    const halfDepth = this.size.z / 2;

    // Start with smaller bounds for interior space
    let minX = this.position.x - halfWidth * 0.85;
    let maxX = this.position.x + halfWidth * 0.85;
    let minZ = this.position.z - halfDepth * 0.85;
    let maxZ = this.position.z + halfDepth * 0.85;

    // Extend bounds to include all connection points (doorways)
    this.connectionPoints.forEach((point) => {
      const absX = this.position.x + point.x;
      const absZ = this.position.z + point.z;

      // Add small padding around connection points
      const padding = 0.3;
      minX = Math.min(minX, absX - padding);
      maxX = Math.max(maxX, absX + padding);
      minZ = Math.min(minZ, absZ - padding);
      maxZ = Math.max(maxZ, absZ + padding);
    });

    return {
      min: { x: minX, z: minZ },
      max: { x: maxX, z: maxZ },
    };
  }

  /**
   * Get absolute position of a connection point
   */
  getConnectionPoint(name: string): Vector2 | undefined {
    const point = this.connectionPoints.get(name);
    if (!point) return undefined;

    return {
      x: this.position.x + point.x,
      z: this.position.z + point.z,
    };
  }

  /**
   * Get all waypoints within this room (for pathfinding)
   */
  getWaypoints(): Vector2[] {
    const points: Vector2[] = [];

    // Add center point if walkable
    const center = { x: this.position.x, z: this.position.z };
    if (this.navMesh.isWalkable(center)) {
      points.push(center);
    }

    // Add connection points
    this.connectionPoints.forEach((point) => {
      const absPoint = {
        x: this.position.x + point.x,
        z: this.position.z + point.z,
      };
      if (this.navMesh.isWalkable(absPoint)) {
        points.push(absPoint);
      }
    });

    return points;
  }

  /**
   * Check if a point is inside this room (bounds check)
   */
  containsPoint(point: Vector2): boolean {
    const halfWidth = this.size.x / 2;
    const halfDepth = this.size.z / 2;

    return (
      point.x >= this.position.x - halfWidth &&
      point.x <= this.position.x + halfWidth &&
      point.z >= this.position.z - halfDepth &&
      point.z <= this.position.z + halfDepth
    );
  }

  /**
   * Check if a point is walkable (NavMesh check)
   */
  isWalkable(point: Vector2): boolean {
    return this.containsPoint(point) && this.navMesh.isWalkable(point);
  }

  /**
   * Get a random walkable position within the room
   */
  getRandomWalkablePosition(): Vector2 {
    return this.navMesh.getRandomWalkablePoint();
  }

  /**
   * Find path between two points within the room
   */
  findPathInRoom(start: Vector2, end: Vector2): Vector2[] {
    return this.navMesh.findPath(start, end);
  }

  /**
   * Get nearest walkable point to a given position
   */
  getNearestWalkablePoint(point: Vector2): Vector2 {
    return this.navMesh.getNearestWalkablePoint(point);
  }
}
