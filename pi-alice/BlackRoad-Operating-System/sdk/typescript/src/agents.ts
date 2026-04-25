/**
 * Agent client for BlackRoad SDK
 */

import type { AxiosInstance } from 'axios';
import type {
  Agent,
  AgentCreateParams,
  AgentUpdateParams,
  AgentListParams,
  AgentListResponse,
  AgentExecuteParams,
  AgentExecutionResult,
  AgentExecutionHistory,
} from './types';
import { get, post, patch, del } from './utils/http';

/**
 * Handles AI agent operations
 */
export class AgentsClient {
  private httpClient: AxiosInstance;

  constructor(httpClient: AxiosInstance) {
    this.httpClient = httpClient;
  }

  /**
   * Creates a new AI agent
   *
   * @param params - Agent creation parameters
   * @returns Created agent
   *
   * @example
   * ```typescript
   * const agent = await client.agents.create({
   *   name: 'Data Analyzer',
   *   type: 'autonomous',
   *   capabilities: ['data_analysis', 'visualization'],
   *   config: {
   *     model: 'gpt-4',
   *     temperature: 0.7,
   *   },
   * });
   * ```
   */
  async create(params: AgentCreateParams): Promise<Agent> {
    return post<Agent>(this.httpClient, '/agents', params);
  }

  /**
   * Gets an agent by ID
   *
   * @param agentId - Agent identifier
   * @returns Agent details
   *
   * @example
   * ```typescript
   * const agent = await client.agents.get('agent-id');
   * console.log(agent.name, agent.status);
   * ```
   */
  async get(agentId: string): Promise<Agent> {
    return get<Agent>(this.httpClient, `/agents/${agentId}`);
  }

  /**
   * Lists all agents with optional filtering
   *
   * @param params - List parameters
   * @returns List of agents with pagination info
   *
   * @example
   * ```typescript
   * const response = await client.agents.list({
   *   type: 'autonomous',
   *   status: 'active',
   *   limit: 20,
   *   offset: 0,
   * });
   *
   * console.log(`Found ${response.total} agents`);
   * response.agents.forEach(agent => {
   *   console.log(agent.name);
   * });
   * ```
   */
  async list(params?: AgentListParams): Promise<AgentListResponse> {
    return get<AgentListResponse>(this.httpClient, '/agents', {
      params,
    });
  }

  /**
   * Updates an existing agent
   *
   * @param agentId - Agent identifier
   * @param params - Update parameters
   * @returns Updated agent
   *
   * @example
   * ```typescript
   * const agent = await client.agents.update('agent-id', {
   *   name: 'Advanced Data Analyzer',
   *   status: 'paused',
   *   config: {
   *     temperature: 0.5,
   *   },
   * });
   * ```
   */
  async update(agentId: string, params: AgentUpdateParams): Promise<Agent> {
    return patch<Agent>(this.httpClient, `/agents/${agentId}`, params);
  }

  /**
   * Deletes an agent
   *
   * @param agentId - Agent identifier
   *
   * @example
   * ```typescript
   * await client.agents.delete('agent-id');
   * ```
   */
  async delete(agentId: string): Promise<void> {
    return del<void>(this.httpClient, `/agents/${agentId}`);
  }

  /**
   * Executes a task with an agent
   *
   * @param agentId - Agent identifier
   * @param params - Execution parameters
   * @returns Execution result
   *
   * @example
   * ```typescript
   * // Synchronous execution
   * const result = await client.agents.execute('agent-id', {
   *   task: 'analyze_data',
   *   parameters: {
   *     dataset: 'sales_2024',
   *     metrics: ['revenue', 'growth'],
   *   },
   *   mode: 'sync',
   * });
   *
   * console.log('Analysis:', result.result);
   *
   * // Asynchronous execution
   * const execution = await client.agents.execute('agent-id', {
   *   task: 'long_running_task',
   *   mode: 'async',
   * });
   *
   * // Poll for completion
   * const status = await client.agents.getExecutionStatus(execution.id);
   * ```
   */
  async execute(agentId: string, params: AgentExecuteParams): Promise<AgentExecutionResult> {
    return post<AgentExecutionResult>(
      this.httpClient,
      `/agents/${agentId}/execute`,
      params
    );
  }

  /**
   * Gets the status of an agent execution
   *
   * @param executionId - Execution identifier
   * @returns Execution result with current status
   *
   * @example
   * ```typescript
   * const status = await client.agents.getExecutionStatus('execution-id');
   *
   * if (status.status === 'completed') {
   *   console.log('Result:', status.result);
   * } else if (status.status === 'failed') {
   *   console.error('Error:', status.error);
   * }
   * ```
   */
  async getExecutionStatus(executionId: string): Promise<AgentExecutionResult> {
    return get<AgentExecutionResult>(this.httpClient, `/executions/${executionId}`);
  }

  /**
   * Cancels a running execution
   *
   * @param executionId - Execution identifier
   *
   * @example
   * ```typescript
   * await client.agents.cancelExecution('execution-id');
   * ```
   */
  async cancelExecution(executionId: string): Promise<void> {
    return post<void>(this.httpClient, `/executions/${executionId}/cancel`);
  }

  /**
   * Gets the execution history for an agent
   *
   * @param agentId - Agent identifier
   * @param limit - Number of executions to return
   * @returns Array of execution history entries
   *
   * @example
   * ```typescript
   * const history = await client.agents.getExecutionHistory('agent-id', 10);
   *
   * history.forEach(entry => {
   *   console.log(`${entry.task}: ${entry.status} (${entry.duration_ms}ms)`);
   * });
   * ```
   */
  async getExecutionHistory(
    agentId: string,
    limit: number = 50
  ): Promise<AgentExecutionHistory[]> {
    return get<AgentExecutionHistory[]>(
      this.httpClient,
      `/agents/${agentId}/executions`,
      {
        params: { limit },
      }
    );
  }

  /**
   * Starts an agent (changes status to active)
   *
   * @param agentId - Agent identifier
   * @returns Updated agent
   *
   * @example
   * ```typescript
   * const agent = await client.agents.start('agent-id');
   * console.log(agent.status); // 'active'
   * ```
   */
  async start(agentId: string): Promise<Agent> {
    return post<Agent>(this.httpClient, `/agents/${agentId}/start`);
  }

  /**
   * Pauses an agent
   *
   * @param agentId - Agent identifier
   * @returns Updated agent
   *
   * @example
   * ```typescript
   * const agent = await client.agents.pause('agent-id');
   * console.log(agent.status); // 'paused'
   * ```
   */
  async pause(agentId: string): Promise<Agent> {
    return post<Agent>(this.httpClient, `/agents/${agentId}/pause`);
  }

  /**
   * Stops an agent
   *
   * @param agentId - Agent identifier
   * @returns Updated agent
   *
   * @example
   * ```typescript
   * const agent = await client.agents.stop('agent-id');
   * console.log(agent.status); // 'stopped'
   * ```
   */
  async stop(agentId: string): Promise<Agent> {
    return post<Agent>(this.httpClient, `/agents/${agentId}/stop`);
  }

  /**
   * Waits for an execution to complete
   *
   * @param executionId - Execution identifier
   * @param pollInterval - How often to check status (in ms)
   * @param timeout - Maximum time to wait (in ms)
   * @returns Completed execution result
   *
   * @example
   * ```typescript
   * const execution = await client.agents.execute('agent-id', {
   *   task: 'process_data',
   *   mode: 'async',
   * });
   *
   * const result = await client.agents.waitForExecution(execution.id);
   * console.log('Final result:', result.result);
   * ```
   */
  async waitForExecution(
    executionId: string,
    pollInterval: number = 2000,
    timeout: number = 300000 // 5 minutes
  ): Promise<AgentExecutionResult> {
    const startTime = Date.now();

    while (true) {
      const status = await this.getExecutionStatus(executionId);

      if (status.status === 'completed' || status.status === 'failed') {
        return status;
      }

      if (Date.now() - startTime > timeout) {
        throw new Error(`Execution timeout after ${timeout}ms`);
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }
  }
}
