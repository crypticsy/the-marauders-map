import { Vector2, NavNode } from './types';
import { ObstacleImpl } from './Obstacle';

/**
 * Priority Queue for A* pathfinding
 */
class PriorityQueue<T> {
  private items: Array<{ item: T; priority: number }> = [];

  enqueue(item: T, priority: number): void {
    this.items.push({ item, priority });
    this.items.sort((a, b) => a.priority - b.priority);
  }

  dequeue(): T | undefined {
    return this.items.shift()?.item;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

/**
 * NavMesh implementation using grid-based navigation
 * Provides pathfinding with obstacle avoidance
 */
export class NavMeshImpl {
  public nodes: NavNode[] = [];
  public walkablePolygons: Vector2[][] = [];
  public gridSize: number;
  public bounds: { min: Vector2; max: Vector2 };

  private grid: Map<string, NavNode> = new Map();
  private obstacles: ObstacleImpl[];

  constructor(
    bounds: { min: Vector2; max: Vector2 },
    obstacles: ObstacleImpl[],
    gridSize: number = 0.3
  ) {
    this.bounds = bounds;
    this.obstacles = obstacles;
    this.gridSize = gridSize;

    this.buildNavMesh();
  }

  /**
   * Build navigation mesh grid
   */
  private buildNavMesh(): void {
    const { min, max } = this.bounds;
    let nodeId = 0;

    // Create grid nodes
    for (let x = min.x; x <= max.x; x += this.gridSize) {
      for (let z = min.z; z <= max.z; z += this.gridSize) {
        const position = { x, z };

        // Skip if position is inside an obstacle
        if (this.isPointInObstacle(position)) {
          continue;
        }

        const node: NavNode = {
          id: nodeId++,
          position,
          neighbors: [],
        };

        this.nodes.push(node);
        this.grid.set(this.getGridKey(position), node);
      }
    }

    // Connect neighboring nodes
    this.nodes.forEach((node) => {
      const neighbors = this.getNeighborPositions(node.position);
      neighbors.forEach((neighborPos) => {
        const neighborNode = this.grid.get(this.getGridKey(neighborPos));
        if (neighborNode) {
          // Check if path between nodes is clear
          if (!this.lineIntersectsObstacles(node.position, neighborNode.position)) {
            node.neighbors.push(neighborNode.id);
          }
        }
      });
    });

    // Build walkable polygons for visualization
    this.buildWalkablePolygons();
  }

  /**
   * Build walkable area polygons for visualization
   */
  private buildWalkablePolygons(): void {
    // Create a simple polygon representing the entire walkable area
    // minus obstacle areas
    this.walkablePolygons = [
      [
        { x: this.bounds.min.x, z: this.bounds.min.z },
        { x: this.bounds.max.x, z: this.bounds.min.z },
        { x: this.bounds.max.x, z: this.bounds.max.z },
        { x: this.bounds.min.x, z: this.bounds.max.z },
      ],
    ];
  }

  /**
   * Get grid key for a position
   */
  private getGridKey(position: Vector2): string {
    const x = Math.round(position.x / this.gridSize) * this.gridSize;
    const z = Math.round(position.z / this.gridSize) * this.gridSize;
    return `${x.toFixed(2)},${z.toFixed(2)}`;
  }

  /**
   * Get neighboring grid positions (8-directional)
   */
  private getNeighborPositions(position: Vector2): Vector2[] {
    const neighbors: Vector2[] = [];
    const offsets = [
      { x: -1, z: 0 },  // Left
      { x: 1, z: 0 },   // Right
      { x: 0, z: -1 },  // Up
      { x: 0, z: 1 },   // Down
      { x: -1, z: -1 }, // Top-left
      { x: 1, z: -1 },  // Top-right
      { x: -1, z: 1 },  // Bottom-left
      { x: 1, z: 1 },   // Bottom-right
    ];

    offsets.forEach((offset) => {
      neighbors.push({
        x: position.x + offset.x * this.gridSize,
        z: position.z + offset.z * this.gridSize,
      });
    });

    return neighbors;
  }

  /**
   * Check if a point is inside any obstacle
   */
  private isPointInObstacle(point: Vector2): boolean {
    return this.obstacles.some((obstacle) => obstacle.containsPoint(point));
  }

  /**
   * Check if a line intersects with any obstacle
   */
  private lineIntersectsObstacles(start: Vector2, end: Vector2): boolean {
    return this.obstacles.some((obstacle) =>
      obstacle.intersectsLineSegment(start, end)
    );
  }

  /**
   * Check if a point is walkable
   */
  isWalkable(point: Vector2): boolean {
    // Check if within bounds
    if (
      point.x < this.bounds.min.x ||
      point.x > this.bounds.max.x ||
      point.z < this.bounds.min.z ||
      point.z > this.bounds.max.z
    ) {
      return false;
    }

    // Check if inside obstacle
    return !this.isPointInObstacle(point);
  }

  /**
   * Get nearest walkable point to a given position
   */
  getNearestWalkablePoint(point: Vector2): Vector2 {
    if (this.isWalkable(point)) {
      return point;
    }

    // Find nearest node
    let nearestNode: NavNode | null = null;
    let minDistance = Infinity;

    this.nodes.forEach((node) => {
      const distance = this.distance(point, node.position);
      if (distance < minDistance) {
        minDistance = distance;
        nearestNode = node;
      }
    });

    return nearestNode ? nearestNode.position : point;
  }

  /**
   * Find path using A* algorithm
   */
  findPath(start: Vector2, end: Vector2): Vector2[] {
    // Get nearest nodes to start and end
    const startNode = this.getNearestNode(start);
    const endNode = this.getNearestNode(end);

    if (!startNode || !endNode) {
      return [start, end];
    }

    if (startNode.id === endNode.id) {
      return [start, end];
    }

    // A* algorithm
    const openSet = new PriorityQueue<number>();
    const cameFrom = new Map<number, number>();
    const gScore = new Map<number, number>();
    const fScore = new Map<number, number>();

    // Initialize scores
    this.nodes.forEach((node) => {
      gScore.set(node.id, Infinity);
      fScore.set(node.id, Infinity);
    });

    gScore.set(startNode.id, 0);
    fScore.set(startNode.id, this.distance(startNode.position, endNode.position));
    openSet.enqueue(startNode.id, fScore.get(startNode.id)!);

    const closedSet = new Set<number>();

    while (!openSet.isEmpty()) {
      const currentId = openSet.dequeue()!;

      if (currentId === endNode.id) {
        // Reconstruct path
        const path = this.reconstructPath(cameFrom, currentId);
        // Add actual start and end points
        return [start, ...path, end];
      }

      closedSet.add(currentId);
      const currentNode = this.nodes.find((n) => n.id === currentId)!;

      currentNode.neighbors.forEach((neighborId) => {
        if (closedSet.has(neighborId)) {
          return;
        }

        const neighbor = this.nodes.find((n) => n.id === neighborId)!;
        const tentativeGScore =
          gScore.get(currentId)! +
          this.distance(currentNode.position, neighbor.position);

        if (tentativeGScore < gScore.get(neighborId)!) {
          cameFrom.set(neighborId, currentId);
          gScore.set(neighborId, tentativeGScore);
          fScore.set(
            neighborId,
            tentativeGScore + this.distance(neighbor.position, endNode.position)
          );
          openSet.enqueue(neighborId, fScore.get(neighborId)!);
        }
      });
    }

    // No path found, return direct path
    return [start, end];
  }

  /**
   * Reconstruct path from A* algorithm
   */
  private reconstructPath(cameFrom: Map<number, number>, current: number): Vector2[] {
    const path: Vector2[] = [];
    const currentNode = this.nodes.find((n) => n.id === current)!;
    path.unshift(currentNode.position);

    let currentId = current;
    while (cameFrom.has(currentId)) {
      currentId = cameFrom.get(currentId)!;
      const node = this.nodes.find((n) => n.id === currentId)!;
      path.unshift(node.position);
    }

    // Simplify path by removing unnecessary waypoints
    return this.simplifyPath(path);
  }

  /**
   * Simplify path by removing unnecessary waypoints
   */
  private simplifyPath(path: Vector2[]): Vector2[] {
    if (path.length <= 2) {
      return path;
    }

    const simplified: Vector2[] = [path[0]];
    let current = 0;

    while (current < path.length - 1) {
      let farthest = current + 1;

      // Find the farthest point we can reach in a straight line
      for (let i = current + 2; i < path.length; i++) {
        if (!this.lineIntersectsObstacles(path[current], path[i])) {
          farthest = i;
        } else {
          break;
        }
      }

      simplified.push(path[farthest]);
      current = farthest;
    }

    return simplified;
  }

  /**
   * Get nearest node to a position
   */
  private getNearestNode(position: Vector2): NavNode | null {
    let nearestNode: NavNode | null = null;
    let minDistance = Infinity;

    this.nodes.forEach((node) => {
      const distance = this.distance(position, node.position);
      if (distance < minDistance) {
        minDistance = distance;
        nearestNode = node;
      }
    });

    return nearestNode;
  }

  /**
   * Get random walkable point
   */
  getRandomWalkablePoint(): Vector2 {
    if (this.nodes.length === 0) {
      return {
        x: (this.bounds.min.x + this.bounds.max.x) / 2,
        z: (this.bounds.min.z + this.bounds.max.z) / 2,
      };
    }

    const randomNode = this.nodes[Math.floor(Math.random() * this.nodes.length)];
    return randomNode.position;
  }

  /**
   * Calculate distance between two points
   */
  private distance(a: Vector2, b: Vector2): number {
    const dx = a.x - b.x;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dz * dz);
  }
}
