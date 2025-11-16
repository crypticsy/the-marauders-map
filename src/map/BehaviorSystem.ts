import { BehaviorType, Behavior, BehaviorConfig, Vector2 } from './types';

/**
 * Default behavior configuration
 */
export const DEFAULT_BEHAVIOR_CONFIG: BehaviorConfig = {
  waitChance: 0.2,
  roamChance: 0.5,
  moveChance: 0.3,
  minWaitTime: 2000,
  maxWaitTime: 6000,
  minRoamTime: 3000,
  maxRoamTime: 8000,
};

/**
 * Behavior System for managing character behaviors
 */
export class BehaviorSystem {
  private config: BehaviorConfig;

  constructor(config: BehaviorConfig = DEFAULT_BEHAVIOR_CONFIG) {
    this.config = config;
  }

  /**
   * Create a WAIT behavior
   */
  createWaitBehavior(): Behavior {
    const duration =
      this.config.minWaitTime +
      Math.random() * (this.config.maxWaitTime - this.config.minWaitTime);

    return {
      type: BehaviorType.WAIT,
      duration,
      remainingTime: duration,
    };
  }

  /**
   * Create a ROAM behavior
   */
  createRoamBehavior(currentRoomId: string): Behavior {
    const duration =
      this.config.minRoamTime +
      Math.random() * (this.config.maxRoamTime - this.config.minRoamTime);

    return {
      type: BehaviorType.ROAM,
      targetRoomId: currentRoomId,
      duration,
      remainingTime: duration,
    };
  }

  /**
   * Create a MOVE_TO_TARGET behavior
   */
  createMoveToTargetBehavior(targetRoomId: string, targetPosition?: Vector2): Behavior {
    return {
      type: BehaviorType.MOVE_TO_TARGET,
      targetRoomId,
      targetPosition,
    };
  }

  /**
   * Choose next behavior based on probabilities
   */
  chooseNextBehavior(currentRoomId: string, availableRooms: string[]): Behavior {
    const random = Math.random();
    const { waitChance, roamChance } = this.config;

    if (random < waitChance) {
      return this.createWaitBehavior();
    } else if (random < waitChance + roamChance) {
      return this.createRoamBehavior(currentRoomId);
    } else {
      // Move to another room
      const otherRooms = availableRooms.filter((id) => id !== currentRoomId);
      if (otherRooms.length === 0) {
        // No other rooms available, roam instead
        return this.createRoamBehavior(currentRoomId);
      }
      const targetRoomId = otherRooms[Math.floor(Math.random() * otherRooms.length)];
      return this.createMoveToTargetBehavior(targetRoomId);
    }
  }

  /**
   * Update behavior state (for time-based behaviors)
   */
  updateBehavior(behavior: Behavior, deltaTime: number): boolean {
    if (behavior.remainingTime !== undefined) {
      behavior.remainingTime -= deltaTime * 1000; // Convert to milliseconds
      return behavior.remainingTime <= 0;
    }
    return false;
  }

  /**
   * Check if behavior is complete
   */
  isBehaviorComplete(behavior: Behavior): boolean {
    if (behavior.type === BehaviorType.WAIT || behavior.type === BehaviorType.ROAM) {
      return behavior.remainingTime !== undefined && behavior.remainingTime <= 0;
    }
    return false;
  }
}
