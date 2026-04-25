/**
 * QuickStart Example
 *
 * This example demonstrates basic usage of the BlackRoad SDK
 */

import { BlackRoadClient } from '../src';

async function main() {
  // Initialize the client with your API key
  const client = new BlackRoadClient({
    apiKey: process.env.BLACKROAD_API_KEY || 'your-api-key',
    debug: true,
  });

  console.log('BlackRoad SDK QuickStart Example\n');

  // Test the connection
  console.log('Testing connection...');
  const isOnline = await client.ping();
  console.log(`Connection: ${isOnline ? 'OK' : 'FAILED'}\n`);

  if (!isOnline) {
    console.error('Cannot connect to BlackRoad API');
    process.exit(1);
  }

  // Get API version
  try {
    const version = await client.getVersion();
    console.log(`API Version: ${version}\n`);
  } catch (error) {
    console.log('Could not fetch API version\n');
  }

  // Get current user (if authenticated)
  if (client.isAuthenticated()) {
    try {
      console.log('Fetching user profile...');
      const user = await client.auth.getCurrentUser();
      console.log('User:', {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        role: user.role,
      });
      console.log();
    } catch (error) {
      console.log('Not authenticated or invalid credentials\n');
    }
  }

  // List agents
  try {
    console.log('Fetching agents...');
    const agentsResponse = await client.agents.list({ limit: 5 });
    console.log(`Found ${agentsResponse.total} agents`);

    if (agentsResponse.agents.length > 0) {
      console.log('\nFirst 5 agents:');
      agentsResponse.agents.forEach((agent, index) => {
        console.log(`  ${index + 1}. ${agent.name} (${agent.type}) - Status: ${agent.status}`);
      });
    }
    console.log();
  } catch (error) {
    console.error('Error fetching agents:', error);
  }

  // Get blockchain stats
  try {
    console.log('Fetching blockchain stats...');
    const stats = await client.blockchain.getNetworkStats();
    console.log('Network Stats:', {
      network: stats.network,
      block_height: stats.block_height,
      tps: stats.tps,
      total_transactions: stats.total_transactions,
      total_accounts: stats.total_accounts,
    });
    console.log();
  } catch (error) {
    console.error('Error fetching blockchain stats:', error);
  }

  // Get latest block
  try {
    console.log('Fetching latest block...');
    const block = await client.blockchain.getLatestBlock();
    console.log('Latest Block:', {
      number: block.number,
      hash: block.hash,
      timestamp: block.timestamp,
      transaction_count: block.transaction_count,
    });
    console.log();
  } catch (error) {
    console.error('Error fetching latest block:', error);
  }

  console.log('QuickStart example completed!');
}

// Run the example
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
