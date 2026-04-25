/**
 * BlackRoad OS - State Management
 *
 * In-memory key-value state store with versioning.
 * Supports optimistic locking via version numbers.
 *
 * @version 2.0
 * @author Atlas (Infrastructure Architect)
 */

import { StateEntry } from './types';
import { logger } from './logger';

/**
 * State Manager
 */
export class StateManager {
  private state: Map<string, StateEntry>;

  constructor() {
    this.state = new Map();
  }

  /**
   * Get state value by key
   */
  get(key: string): StateEntry | undefined {
    return this.state.get(key);
  }

  /**
   * Get all state entries
   */
  getAll(): StateEntry[] {
    return Array.from(this.state.values());
  }

  /**
   * Set state value
   */
  set(key: string, value: any, expectedVersion?: number): StateEntry {
    const existing = this.state.get(key);

    // Optimistic locking check
    if (expectedVersion !== undefined && existing) {
      if (existing.version !== expectedVersion) {
        throw new Error(
          `Version conflict for key '${key}': expected ${expectedVersion}, got ${existing.version}`
        );
      }
    }

    const entry: StateEntry = {
      key,
      value,
      version: existing ? existing.version + 1 : 1,
      updatedAt: new Date().toISOString(),
    };

    this.state.set(key, entry);
    logger.debug(`[State] Set: ${key} = ${JSON.stringify(value)} (v${entry.version})`);

    return entry;
  }

  /**
   * Delete state entry
   */
  delete(key: string): boolean {
    const deleted = this.state.delete(key);
    if (deleted) {
      logger.debug(`[State] Deleted: ${key}`);
    }
    return deleted;
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return this.state.has(key);
  }

  /**
   * Clear all state
   */
  clear(): void {
    this.state.clear();
    logger.debug('[State] Cleared all state');
  }

  /**
   * Get state size
   */
  size(): number {
    return this.state.size;
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.state.keys());
  }

  /**
   * Update state value (convenience method)
   */
  update(key: string, updater: (current: any) => any): StateEntry {
    const existing = this.state.get(key);
    const currentValue = existing?.value;
    const newValue = updater(currentValue);
    return this.set(key, newValue, existing?.version);
  }

  /**
   * Increment numeric value
   */
  increment(key: string, delta: number = 1): StateEntry {
    return this.update(key, (current) => (current || 0) + delta);
  }

  /**
   * Decrement numeric value
   */
  decrement(key: string, delta: number = 1): StateEntry {
    return this.update(key, (current) => (current || 0) - delta);
  }
}

/**
 * Global state manager instance
 */
export const state = new StateManager();

export default state;
