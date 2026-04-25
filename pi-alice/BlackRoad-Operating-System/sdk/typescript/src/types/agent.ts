/**
 * Agent-related type definitions
 */

/**
 * AI Agent type
 */
export type AgentType = 'autonomous' | 'interactive' | 'scheduled' | 'reactive';

/**
 * Agent status
 */
export type AgentStatus = 'active' | 'paused' | 'stopped' | 'error';

/**
 * Agent capabilities
 */
export type AgentCapability =
  | 'reasoning'
  | 'execution'
  | 'data_analysis'
  | 'visualization'
  | 'natural_language'
  | 'blockchain_interaction'
  | 'external_api'
  | 'file_processing'
  | 'image_generation'
  | 'code_generation';

/**
 * Represents an AI agent in the system
 */
export interface Agent {
  /** Unique agent identifier */
  id: string;

  /** Agent name */
  name: string;

  /** Agent description */
  description?: string;

  /** Agent type */
  type: AgentType;

  /** Current status */
  status: AgentStatus;

  /** Agent capabilities */
  capabilities: AgentCapability[];

  /** Agent configuration */
  config: AgentConfig;

  /** Owner user ID */
  owner_id: string;

  /** Creation timestamp */
  created_at: string;

  /** Last update timestamp */
  updated_at: string;

  /** Last execution timestamp */
  last_executed_at?: string;

  /** Execution count */
  execution_count: number;

  /** Agent metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Agent configuration
 */
export interface AgentConfig {
  /** Model to use (e.g., "gpt-4", "claude-3") */
  model?: string;

  /** Temperature for generation (0-1) */
  temperature?: number;

  /** Maximum tokens to generate */
  max_tokens?: number;

  /** System prompt */
  system_prompt?: string;

  /** Execution timeout in seconds */
  timeout?: number;

  /** Maximum retries on failure */
  max_retries?: number;

  /** Additional configuration */
  [key: string]: unknown;
}

/**
 * Parameters for creating an agent
 */
export interface AgentCreateParams {
  /** Agent name */
  name: string;

  /** Agent description */
  description?: string;

  /** Agent type */
  type: AgentType;

  /** Agent capabilities */
  capabilities: AgentCapability[];

  /** Agent configuration */
  config?: Partial<AgentConfig>;

  /** Agent metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for updating an agent
 */
export interface AgentUpdateParams {
  /** New name */
  name?: string;

  /** New description */
  description?: string;

  /** New status */
  status?: AgentStatus;

  /** New capabilities */
  capabilities?: AgentCapability[];

  /** Updated configuration */
  config?: Partial<AgentConfig>;

  /** Updated metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for listing agents
 */
export interface AgentListParams {
  /** Filter by agent type */
  type?: AgentType;

  /** Filter by status */
  status?: AgentStatus;

  /** Number of results to return */
  limit?: number;

  /** Offset for pagination */
  offset?: number;

  /** Sort field */
  sort_by?: 'created_at' | 'updated_at' | 'name' | 'execution_count';

  /** Sort order */
  sort_order?: 'asc' | 'desc';
}

/**
 * Agent execution parameters
 */
export interface AgentExecuteParams {
  /** Task to execute */
  task: string;

  /** Task parameters */
  parameters?: Record<string, unknown>;

  /** Context for execution */
  context?: Record<string, unknown>;

  /** Execution mode */
  mode?: 'sync' | 'async';
}

/**
 * Agent execution result
 */
export interface AgentExecutionResult {
  /** Execution ID */
  id: string;

  /** Agent ID */
  agent_id: string;

  /** Execution status */
  status: 'pending' | 'running' | 'completed' | 'failed';

  /** Result data */
  result?: unknown;

  /** Error message if failed */
  error?: string;

  /** Execution start time */
  started_at: string;

  /** Execution completion time */
  completed_at?: string;

  /** Execution duration in milliseconds */
  duration_ms?: number;

  /** Tokens used */
  tokens_used?: number;

  /** Execution logs */
  logs?: string[];
}

/**
 * Agent list response
 */
export interface AgentListResponse {
  /** List of agents */
  agents: Agent[];

  /** Total count of agents */
  total: number;

  /** Number of results returned */
  count: number;

  /** Offset used */
  offset: number;

  /** Whether there are more results */
  has_more: boolean;
}

/**
 * Agent execution history entry
 */
export interface AgentExecutionHistory {
  /** Execution ID */
  id: string;

  /** Task name */
  task: string;

  /** Execution status */
  status: 'completed' | 'failed';

  /** Start timestamp */
  started_at: string;

  /** Completion timestamp */
  completed_at: string;

  /** Duration in milliseconds */
  duration_ms: number;

  /** Tokens used */
  tokens_used?: number;

  /** Error message if failed */
  error?: string;
}
