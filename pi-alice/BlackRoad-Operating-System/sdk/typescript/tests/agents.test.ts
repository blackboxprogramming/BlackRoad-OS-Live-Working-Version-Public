/**
 * Tests for AgentsClient
 */

import { AgentsClient } from '../src/agents';
import type { AxiosInstance } from 'axios';
import type { Agent, AgentExecutionResult } from '../src/types';

// Mock axios
const mockAxios = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  defaults: {
    headers: {
      common: {},
    },
  },
} as unknown as AxiosInstance;

describe('AgentsClient', () => {
  let client: AgentsClient;

  beforeEach(() => {
    client = new AgentsClient(mockAxios);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new agent', async () => {
      const mockAgent: Agent = {
        id: 'agent-123',
        name: 'Test Agent',
        type: 'autonomous',
        status: 'active',
        capabilities: ['reasoning'],
        config: {},
        owner_id: 'user-123',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        execution_count: 0,
      };

      mockAxios.post = jest.fn().mockResolvedValue({
        data: { data: mockAgent },
      });

      const result = await client.create({
        name: 'Test Agent',
        type: 'autonomous',
        capabilities: ['reasoning'],
      });

      expect(result).toEqual(mockAgent);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/agents',
        expect.objectContaining({
          name: 'Test Agent',
          type: 'autonomous',
        }),
        undefined
      );
    });
  });

  describe('get', () => {
    it('should get an agent by ID', async () => {
      const mockAgent: Agent = {
        id: 'agent-123',
        name: 'Test Agent',
        type: 'autonomous',
        status: 'active',
        capabilities: ['reasoning'],
        config: {},
        owner_id: 'user-123',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        execution_count: 0,
      };

      mockAxios.get = jest.fn().mockResolvedValue({
        data: { data: mockAgent },
      });

      const result = await client.get('agent-123');

      expect(result).toEqual(mockAgent);
      expect(mockAxios.get).toHaveBeenCalledWith('/agents/agent-123', undefined);
    });
  });

  describe('list', () => {
    it('should list agents with parameters', async () => {
      const mockResponse = {
        agents: [],
        total: 0,
        count: 0,
        offset: 0,
        has_more: false,
      };

      mockAxios.get = jest.fn().mockResolvedValue({
        data: { data: mockResponse },
      });

      const result = await client.list({
        type: 'autonomous',
        limit: 10,
        offset: 0,
      });

      expect(result).toEqual(mockResponse);
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/agents',
        expect.objectContaining({
          params: {
            type: 'autonomous',
            limit: 10,
            offset: 0,
          },
        })
      );
    });
  });

  describe('update', () => {
    it('should update an agent', async () => {
      const mockAgent: Agent = {
        id: 'agent-123',
        name: 'Updated Agent',
        type: 'autonomous',
        status: 'active',
        capabilities: ['reasoning'],
        config: {},
        owner_id: 'user-123',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T01:00:00Z',
        execution_count: 0,
      };

      mockAxios.patch = jest.fn().mockResolvedValue({
        data: { data: mockAgent },
      });

      const result = await client.update('agent-123', {
        name: 'Updated Agent',
      });

      expect(result).toEqual(mockAgent);
      expect(mockAxios.patch).toHaveBeenCalledWith(
        '/agents/agent-123',
        expect.objectContaining({
          name: 'Updated Agent',
        }),
        undefined
      );
    });
  });

  describe('delete', () => {
    it('should delete an agent', async () => {
      mockAxios.delete = jest.fn().mockResolvedValue({
        data: { data: undefined },
      });

      await client.delete('agent-123');

      expect(mockAxios.delete).toHaveBeenCalledWith('/agents/agent-123', undefined);
    });
  });

  describe('execute', () => {
    it('should execute an agent task', async () => {
      const mockExecution: AgentExecutionResult = {
        id: 'exec-123',
        agent_id: 'agent-123',
        status: 'completed',
        result: { success: true },
        started_at: '2024-01-01T00:00:00Z',
        completed_at: '2024-01-01T00:01:00Z',
        duration_ms: 60000,
      };

      mockAxios.post = jest.fn().mockResolvedValue({
        data: { data: mockExecution },
      });

      const result = await client.execute('agent-123', {
        task: 'test_task',
        parameters: { param1: 'value1' },
        mode: 'sync',
      });

      expect(result).toEqual(mockExecution);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/agents/agent-123/execute',
        expect.objectContaining({
          task: 'test_task',
          mode: 'sync',
        }),
        undefined
      );
    });
  });

  describe('getExecutionStatus', () => {
    it('should get execution status', async () => {
      const mockExecution: AgentExecutionResult = {
        id: 'exec-123',
        agent_id: 'agent-123',
        status: 'running',
        started_at: '2024-01-01T00:00:00Z',
      };

      mockAxios.get = jest.fn().mockResolvedValue({
        data: { data: mockExecution },
      });

      const result = await client.getExecutionStatus('exec-123');

      expect(result).toEqual(mockExecution);
      expect(mockAxios.get).toHaveBeenCalledWith('/executions/exec-123', undefined);
    });
  });

  describe('start', () => {
    it('should start an agent', async () => {
      const mockAgent: Agent = {
        id: 'agent-123',
        name: 'Test Agent',
        type: 'autonomous',
        status: 'active',
        capabilities: ['reasoning'],
        config: {},
        owner_id: 'user-123',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        execution_count: 0,
      };

      mockAxios.post = jest.fn().mockResolvedValue({
        data: { data: mockAgent },
      });

      const result = await client.start('agent-123');

      expect(result.status).toBe('active');
      expect(mockAxios.post).toHaveBeenCalledWith('/agents/agent-123/start', undefined, undefined);
    });
  });

  describe('pause', () => {
    it('should pause an agent', async () => {
      const mockAgent: Agent = {
        id: 'agent-123',
        name: 'Test Agent',
        type: 'autonomous',
        status: 'paused',
        capabilities: ['reasoning'],
        config: {},
        owner_id: 'user-123',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        execution_count: 0,
      };

      mockAxios.post = jest.fn().mockResolvedValue({
        data: { data: mockAgent },
      });

      const result = await client.pause('agent-123');

      expect(result.status).toBe('paused');
      expect(mockAxios.post).toHaveBeenCalledWith('/agents/agent-123/pause', undefined, undefined);
    });
  });

  describe('stop', () => {
    it('should stop an agent', async () => {
      const mockAgent: Agent = {
        id: 'agent-123',
        name: 'Test Agent',
        type: 'autonomous',
        status: 'stopped',
        capabilities: ['reasoning'],
        config: {},
        owner_id: 'user-123',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        execution_count: 0,
      };

      mockAxios.post = jest.fn().mockResolvedValue({
        data: { data: mockAgent },
      });

      const result = await client.stop('agent-123');

      expect(result.status).toBe('stopped');
      expect(mockAxios.post).toHaveBeenCalledWith('/agents/agent-123/stop', undefined, undefined);
    });
  });

  describe('waitForExecution', () => {
    it('should wait for execution to complete', async () => {
      const mockExecution: AgentExecutionResult = {
        id: 'exec-123',
        agent_id: 'agent-123',
        status: 'completed',
        result: { success: true },
        started_at: '2024-01-01T00:00:00Z',
        completed_at: '2024-01-01T00:01:00Z',
        duration_ms: 60000,
      };

      mockAxios.get = jest.fn().mockResolvedValue({
        data: { data: mockExecution },
      });

      const result = await client.waitForExecution('exec-123', 100, 5000);

      expect(result).toEqual(mockExecution);
      expect(result.status).toBe('completed');
    });

    it('should throw error on timeout', async () => {
      const mockExecution: AgentExecutionResult = {
        id: 'exec-123',
        agent_id: 'agent-123',
        status: 'running',
        started_at: '2024-01-01T00:00:00Z',
      };

      mockAxios.get = jest.fn().mockResolvedValue({
        data: { data: mockExecution },
      });

      await expect(
        client.waitForExecution('exec-123', 100, 500)
      ).rejects.toThrow('Execution timeout');
    });
  });
});
