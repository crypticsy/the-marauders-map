import { ObstacleConfig, Vector2 } from './types';

/**
 * Obstacle class representing furniture, walls, or decorations
 * Provides collision detection and boundary checking
 */
export class ObstacleImpl {
  public id: string;
  public name: string;
  public position: Vector2;
  public size: Vector2;
  public height: number;
  public type: 'furniture' | 'wall' | 'decoration';

  constructor(config: ObstacleConfig, roomPosition: Vector2) {
    this.id = config.id;
    this.name = config.name;
    // Convert relative position to absolute position
    this.position = {
      x: roomPosition.x + config.position.x,
      z: roomPosition.z + config.position.z,
    };
    this.size = config.size;
    this.height = config.height || 1.0;
    this.type = config.type;
  }

  /**
   * Check if a point is inside this obstacle
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
   * Get expanded bounds for pathfinding (adds padding around obstacle)
   */
  getExpandedBounds(padding: number): { min: Vector2; max: Vector2 } {
    const halfWidth = this.size.x / 2 + padding;
    const halfDepth = this.size.z / 2 + padding;

    return {
      min: {
        x: this.position.x - halfWidth,
        z: this.position.z - halfDepth,
      },
      max: {
        x: this.position.x + halfWidth,
        z: this.position.z + halfDepth,
      },
    };
  }

  /**
   * Check if a line segment intersects with this obstacle
   */
  intersectsLineSegment(start: Vector2, end: Vector2): boolean {
    const bounds = this.getExpandedBounds(0);

    // Check if either endpoint is inside the obstacle
    if (this.containsPoint(start) || this.containsPoint(end)) {
      return true;
    }

    // Check if line segment intersects with any edge of the bounding box
    const edges = [
      { start: bounds.min, end: { x: bounds.max.x, z: bounds.min.z } }, // Top edge
      { start: { x: bounds.max.x, z: bounds.min.z }, end: bounds.max }, // Right edge
      { start: bounds.max, end: { x: bounds.min.x, z: bounds.max.z } }, // Bottom edge
      { start: { x: bounds.min.x, z: bounds.max.z }, end: bounds.min }, // Left edge
    ];

    for (const edge of edges) {
      if (this.lineSegmentsIntersect(start, end, edge.start, edge.end)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if two line segments intersect
   */
  private lineSegmentsIntersect(
    a1: Vector2,
    a2: Vector2,
    b1: Vector2,
    b2: Vector2
  ): boolean {
    const det = (a2.x - a1.x) * (b2.z - b1.z) - (a2.z - a1.z) * (b2.x - b1.x);

    if (Math.abs(det) < 0.0001) {
      return false; // Parallel lines
    }

    const lambda =
      ((b2.z - b1.z) * (b2.x - a1.x) + (b1.x - b2.x) * (b2.z - a1.z)) / det;
    const gamma =
      ((a1.z - a2.z) * (b2.x - a1.x) + (a2.x - a1.x) * (b2.z - a1.z)) / det;

    return lambda >= 0 && lambda <= 1 && gamma >= 0 && gamma <= 1;
  }

  /**
   * Get the closest point on the obstacle boundary to a given point
   */
  getClosestPointOnBoundary(point: Vector2): Vector2 {
    const halfWidth = this.size.x / 2;
    const halfDepth = this.size.z / 2;

    const clampedX = Math.max(
      this.position.x - halfWidth,
      Math.min(point.x, this.position.x + halfWidth)
    );
    const clampedZ = Math.max(
      this.position.z - halfDepth,
      Math.min(point.z, this.position.z + halfDepth)
    );

    return { x: clampedX, z: clampedZ };
  }
}
