/**
 * Agents Example
 *
 * This example demonstrates how to work with AI agents in BlackRoad
 */

import { BlackRoadClient } from '../src';

async function main() {
  // Initialize the client
  const client = new BlackRoadClient({
    apiKey: process.env.BLACKROAD_API_KEY || 'your-api-key',
    debug: true,
  });

  console.log('BlackRoad SDK - Agents Example\n');

  // Create a new agent
  console.log('Creating a new agent...');
  const agent = await client.agents.create({
    name: 'Data Analyzer Agent',
    description: 'An autonomous agent that analyzes data and generates insights',
    type: 'autonomous',
    capabilities: ['data_analysis', 'reasoning', 'visualization'],
    config: {
      model: 'gpt-4',
      temperature: 0.7,
      max_tokens: 2000,
      system_prompt: 'You are a helpful data analysis assistant.',
    },
    metadata: {
      created_by_example: true,
    },
  });

  console.log('Agent created:', {
    id: agent.id,
    name: agent.name,
    status: agent.status,
    capabilities: agent.capabilities,
  });
  console.log();

  // Get agent details
  console.log('Fetching agent details...');
  const agentDetails = await client.agents.get(agent.id);
  console.log('Agent details:', {
    id: agentDetails.id,
    name: agentDetails.name,
    type: agentDetails.type,
    status: agentDetails.status,
    execution_count: agentDetails.execution_count,
    created_at: agentDetails.created_at,
  });
  console.log();

  // Start the agent
  console.log('Starting agent...');
  await client.agents.start(agent.id);
  console.log('Agent started\n');

  // Execute a task synchronously
  console.log('Executing synchronous task...');
  const syncResult = await client.agents.execute(agent.id, {
    task: 'analyze_sample_data',
    parameters: {
      dataset: 'sales_2024_q1',
      metrics: ['total_revenue', 'growth_rate', 'top_products'],
    },
    mode: 'sync',
  });

  console.log('Execution result:', {
    id: syncResult.id,
    status: syncResult.status,
    duration_ms: syncResult.duration_ms,
    tokens_used: syncResult.tokens_used,
  });

  if (syncResult.status === 'completed') {
    console.log('Result:', syncResult.result);
  }
  console.log();

  // Execute a task asynchronously
  console.log('Executing asynchronous task...');
  const asyncExecution = await client.agents.execute(agent.id, {
    task: 'generate_comprehensive_report',
    parameters: {
      dataset: 'sales_2024_full_year',
      include_charts: true,
      format: 'pdf',
    },
    mode: 'async',
  });

  console.log('Async execution started:', {
    id: asyncExecution.id,
    status: asyncExecution.status,
  });

  // Poll for completion
  console.log('Waiting for async execution to complete...');
  const asyncResult = await client.agents.waitForExecution(
    asyncExecution.id,
    2000, // poll every 2 seconds
    60000  // 1 minute timeout
  );

  console.log('Async execution completed:', {
    status: asyncResult.status,
    duration_ms: asyncResult.duration_ms,
  });

  if (asyncResult.status === 'completed') {
    console.log('Result:', asyncResult.result);
  }
  console.log();

  // Get execution history
  console.log('Fetching execution history...');
  const history = await client.agents.getExecutionHistory(agent.id, 10);
  console.log(`Found ${history.length} executions:`);

  history.forEach((entry, index) => {
    console.log(`  ${index + 1}. ${entry.task} - ${entry.status} (${entry.duration_ms}ms)`);
  });
  console.log();

  // Update agent configuration
  console.log('Updating agent configuration...');
  const updatedAgent = await client.agents.update(agent.id, {
    name: 'Advanced Data Analyzer Agent',
    config: {
      temperature: 0.5,
      max_tokens: 3000,
    },
  });

  console.log('Agent updated:', {
    name: updatedAgent.name,
    config: updatedAgent.config,
  });
  console.log();

  // List all agents
  console.log('Listing all agents...');
  const agentsList = await client.agents.list({
    type: 'autonomous',
    status: 'active',
    limit: 10,
    sort_by: 'execution_count',
    sort_order: 'desc',
  });

  console.log(`Found ${agentsList.total} autonomous agents:`);
  agentsList.agents.forEach((a, index) => {
    console.log(`  ${index + 1}. ${a.name} - Executions: ${a.execution_count}`);
  });
  console.log();

  // Pause the agent
  console.log('Pausing agent...');
  await client.agents.pause(agent.id);
  console.log('Agent paused\n');

  // Clean up - delete the agent
  console.log('Deleting agent...');
  await client.agents.delete(agent.id);
  console.log('Agent deleted\n');

  console.log('Agents example completed!');
}

// Run the example
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
