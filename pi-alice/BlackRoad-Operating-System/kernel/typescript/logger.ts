/**
 * BlackRoad OS - Kernel Logger
 *
 * Structured logging with log levels and metadata.
 * Integrates with /v1/sys/log endpoint.
 *
 * @version 2.0
 * @author Atlas (Infrastructure Architect)
 */

import { LogLevel, LogEntry } from './types';
import { kernelConfig } from './config';

const logBuffer: LogEntry[] = [];
const MAX_LOG_BUFFER = 1000;

/**
 * Generate unique log ID
 */
function generateLogId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a log entry
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  meta?: Record<string, any>
): LogEntry {
  const entry: LogEntry = {
    id: generateLogId(),
    timestamp: new Date().toISOString(),
    level,
    message,
    service: kernelConfig.service.name,
    meta,
  };

  // Add to buffer
  logBuffer.push(entry);
  if (logBuffer.length > MAX_LOG_BUFFER) {
    logBuffer.shift(); // Remove oldest
  }

  return entry;
}

/**
 * Format log entry for console output
 */
function formatLogEntry(entry: LogEntry): string {
  const levelColors: Record<LogLevel, string> = {
    debug: '\x1b[36m', // Cyan
    info: '\x1b[32m',  // Green
    warn: '\x1b[33m',  // Yellow
    error: '\x1b[31m', // Red
    fatal: '\x1b[35m', // Magenta
  };

  const reset = '\x1b[0m';
  const color = levelColors[entry.level] || '';

  const parts = [
    `${color}[${entry.level.toUpperCase()}]${reset}`,
    `[${entry.timestamp}]`,
    `[${entry.service}]`,
    entry.message,
  ];

  if (entry.meta && Object.keys(entry.meta).length > 0) {
    parts.push(JSON.stringify(entry.meta));
  }

  return parts.join(' ');
}

/**
 * Logger class
 */
export class Logger {
  private context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  debug(message: string, meta?: Record<string, any>): void {
    const entry = createLogEntry('debug', this.formatMessage(message), meta);
    console.debug(formatLogEntry(entry));
  }

  info(message: string, meta?: Record<string, any>): void {
    const entry = createLogEntry('info', this.formatMessage(message), meta);
    console.info(formatLogEntry(entry));
  }

  warn(message: string, meta?: Record<string, any>): void {
    const entry = createLogEntry('warn', this.formatMessage(message), meta);
    console.warn(formatLogEntry(entry));
  }

  error(message: string, meta?: Record<string, any>): void {
    const entry = createLogEntry('error', this.formatMessage(message), meta);
    console.error(formatLogEntry(entry));
  }

  fatal(message: string, meta?: Record<string, any>): void {
    const entry = createLogEntry('fatal', this.formatMessage(message), meta);
    console.error(formatLogEntry(entry));
  }

  private formatMessage(message: string): string {
    return this.context ? `[${this.context}] ${message}` : message;
  }
}

/**
 * Get all buffered logs
 */
export function getLogs(
  level?: LogLevel,
  limit: number = 100,
  offset: number = 0
): LogEntry[] {
  let filtered = logBuffer;

  if (level) {
    filtered = filtered.filter((entry) => entry.level === level);
  }

  return filtered.slice(offset, offset + limit);
}

/**
 * Clear log buffer
 */
export function clearLogs(): void {
  logBuffer.length = 0;
}

/**
 * Create a logger instance with optional context
 */
export function createLogger(context?: string): Logger {
  return new Logger(context);
}

/**
 * Default logger instance
 */
export const logger = new Logger('Kernel');

export default logger;
