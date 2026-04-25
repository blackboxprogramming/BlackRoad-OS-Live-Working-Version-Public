/**
 * BlackRoad OS - Event Bus
 *
 * In-memory event bus for local event publishing and subscription.
 * Can be extended to distributed events via /v1/sys/event endpoint.
 *
 * @version 2.0
 * @author Atlas (Infrastructure Architect)
 */

import { Event } from './types';
import { logger } from './logger';
import { kernelConfig } from './config';

type EventHandler = (event: Event) => void | Promise<void>;

/**
 * Event Bus for pub/sub messaging
 */
export class EventBus {
  private handlers: Map<string, Set<EventHandler>>;

  constructor() {
    this.handlers = new Map();
  }

  /**
   * Subscribe to an event
   */
  on(eventName: string, handler: EventHandler): () => void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, new Set());
    }

    this.handlers.get(eventName)!.add(handler);

    // Return unsubscribe function
    return () => this.off(eventName, handler);
  }

  /**
   * Subscribe to an event (one-time)
   */
  once(eventName: string, handler: EventHandler): () => void {
    const wrappedHandler = async (event: Event) => {
      await handler(event);
      this.off(eventName, wrappedHandler);
    };

    return this.on(eventName, wrappedHandler);
  }

  /**
   * Unsubscribe from an event
   */
  off(eventName: string, handler: EventHandler): void {
    const handlers = this.handlers.get(eventName);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlers.delete(eventName);
      }
    }
  }

  /**
   * Emit an event
   */
  async emit(eventName: string, data?: Record<string, any>): Promise<void> {
    const event: Event = {
      id: this.generateEventId(),
      event: eventName,
      timestamp: new Date().toISOString(),
      source: kernelConfig.service.name,
      data,
    };

    const handlers = this.handlers.get(eventName);
    if (!handlers || handlers.size === 0) {
      logger.debug(`[Events] No handlers for event: ${eventName}`);
      return;
    }

    logger.debug(`[Events] Emitting event: ${eventName}`, { data });

    // Call all handlers (in parallel)
    await Promise.all(
      Array.from(handlers).map(async (handler) => {
        try {
          await handler(event);
        } catch (error) {
          logger.error(`[Events] Handler error for ${eventName}`, {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      })
    );
  }

  /**
   * Get all event names with active subscriptions
   */
  getEventNames(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Get subscriber count for an event
   */
  getSubscriberCount(eventName: string): number {
    return this.handlers.get(eventName)?.size || 0;
  }

  /**
   * Clear all handlers for an event
   */
  clearEvent(eventName: string): void {
    this.handlers.delete(eventName);
  }

  /**
   * Clear all handlers
   */
  clearAll(): void {
    this.handlers.clear();
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Global event bus instance
 */
export const events = new EventBus();

export default events;
