import * as THREE from 'three';
import { RoomConfig, Vector3, Vector2 } from './types';
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
  private mesh: THREE.Group | null = null;
  private isHovered: boolean = false;
  private scale: number = 0.01; // For animation

  constructor(config: RoomConfig) {
    this.id = config.id;
    this.name = config.name;
    this.position = config.position;
    this.size = config.size;
    this.color = config.color;
    this.connectionPoints = new Map(Object.entries(config.connectionPoints));

    // Create obstacles
    if (config.obstacles) {
      this.obstacles = config.obstacles.map(
        (obstacleConfig) => new ObstacleImpl(obstacleConfig, { x: this.position.x, z: this.position.z })
      );
    }

    // Create NavMesh for this room (finer grid for better navigation)
    const bounds = this.getRoomBounds();
    this.navMesh = new NavMeshImpl(bounds, this.obstacles, 0.2);
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

  /**
   * Update animation state
   */
  update(isActive: boolean, isHovered: boolean): void {
    this.isHovered = isHovered;
    const targetScale = isActive ? (isHovered ? 1.2 : 1.0) : 0.01;
    this.scale += (targetScale - this.scale) * 0.1;
  }

  /**
   * Get current scale for rendering
   */
  getScale(): number {
    return this.scale;
  }

  /**
   * Get render opacity based on hover state
   */
  getOpacity(): number {
    return this.isHovered ? 0.5 : 0.3;
  }

  /**
   * Get emissive intensity based on hover state
   */
  getEmissiveIntensity(): number {
    return this.isHovered ? 0.3 : 0.1;
  }
}
