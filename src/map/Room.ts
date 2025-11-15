import * as THREE from 'three';
import { RoomConfig, Vector3, Vector2 } from './types';

/**
 * Room class representing a location in Hogwarts
 * Handles 3D rendering and connection points for corridors
 */
export class Room {
  public id: string;
  public name: string;
  public position: Vector3;
  public size: Vector3;
  public color: string;
  public connectionPoints: Map<string, Vector2>;
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

    // Add center point
    points.push({ x: this.position.x, z: this.position.z });

    // Add connection points
    this.connectionPoints.forEach((point) => {
      points.push({
        x: this.position.x + point.x,
        z: this.position.z + point.z,
      });
    });

    return points;
  }

  /**
   * Check if a point is inside this room
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
