/**
 * Blockchain Example
 *
 * This example demonstrates how to interact with the BlackRoad blockchain
 */

import { BlackRoadClient } from '../src';

async function main() {
  // Initialize the client
  const client = new BlackRoadClient({
    apiKey: process.env.BLACKROAD_API_KEY || 'your-api-key',
    network: 'testnet', // Use testnet for testing
    debug: true,
  });

  console.log('BlackRoad SDK - Blockchain Example\n');

  // Example wallet address
  const walletAddress = process.env.WALLET_ADDRESS || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

  // Get network statistics
  console.log('Fetching network statistics...');
  const stats = await client.blockchain.getNetworkStats();
  console.log('Network Stats:', {
    network: stats.network,
    block_height: stats.block_height,
    avg_block_time: stats.avg_block_time,
    tps: stats.tps,
    total_transactions: stats.total_transactions,
    total_accounts: stats.total_accounts,
  });
  console.log();

  // Get latest block
  console.log('Fetching latest block...');
  const latestBlock = await client.blockchain.getLatestBlock();
  console.log('Latest Block:', {
    number: latestBlock.number,
    hash: latestBlock.hash,
    timestamp: latestBlock.timestamp,
    transaction_count: latestBlock.transaction_count,
    miner: latestBlock.miner,
  });
  console.log();

  // Get wallet balance
  console.log(`Fetching balance for ${walletAddress}...`);
  const balance = await client.blockchain.getBalance(walletAddress);
  console.log('Balance:', {
    asset: balance.symbol,
    available: balance.available,
    locked: balance.locked,
    total: balance.total,
    usd_value: balance.usd_value,
  });
  console.log();

  // Get all balances
  console.log('Fetching all balances...');
  const balances = await client.blockchain.getBalances(walletAddress);
  console.log(`Found ${balances.length} assets:`);
  balances.forEach((b, index) => {
    console.log(`  ${index + 1}. ${b.symbol}: ${b.available} (${b.usd_value || 'N/A'} USD)`);
  });
  console.log();

  // Get gas price
  console.log('Fetching current gas price...');
  const gasPrice = await client.blockchain.getGasPrice();
  console.log(`Current gas price: ${gasPrice} Wei\n`);

  // Estimate gas for a transaction
  console.log('Estimating gas for a transaction...');
  const gasEstimate = await client.blockchain.estimateGas({
    to: '0x0000000000000000000000000000000000000001',
    amount: 10,
    asset: 'BRD',
  });
  console.log('Gas Estimate:', {
    gas_limit: gasEstimate.gas_limit,
    gas_price: gasEstimate.gas_price,
    total_cost: gasEstimate.total_cost,
    total_cost_usd: gasEstimate.total_cost_usd,
  });
  console.log();

  // Send a transaction (commented out to prevent accidental execution)
  /*
  console.log('Sending transaction...');
  const tx = await client.blockchain.sendTransaction({
    to: '0x0000000000000000000000000000000000000001',
    amount: 10,
    asset: 'BRD',
    memo: 'Test transaction from SDK example',
  });

  console.log('Transaction sent:', {
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    amount: tx.amount,
    status: tx.status,
  });
  console.log();

  // Wait for confirmation
  console.log('Waiting for transaction confirmation...');
  const confirmedTx = await client.blockchain.waitForTransaction(tx.hash, 3);
  console.log('Transaction confirmed:', {
    hash: confirmedTx.hash,
    status: confirmedTx.status,
    confirmations: confirmedTx.confirmations,
    block_number: confirmedTx.block_number,
  });
  console.log();
  */

  // List recent transactions
  console.log('Fetching recent transactions...');
  const txList = await client.blockchain.listTransactions({
    address: walletAddress,
    limit: 10,
  });

  console.log(`Found ${txList.total} transactions (showing ${txList.count}):`);
  txList.transactions.forEach((tx, index) => {
    console.log(`  ${index + 1}. ${tx.hash.slice(0, 10)}... - ${tx.amount} ${tx.asset} - ${tx.status}`);
  });
  console.log();

  // Get a specific transaction (if any exist)
  if (txList.transactions.length > 0) {
    const firstTx = txList.transactions[0];
    console.log(`Fetching transaction details for ${firstTx.hash}...`);
    const txDetails = await client.blockchain.getTransaction(firstTx.hash);
    console.log('Transaction Details:', {
      hash: txDetails.hash,
      from: txDetails.from,
      to: txDetails.to,
      amount: txDetails.amount,
      asset: txDetails.asset,
      status: txDetails.status,
      confirmations: txDetails.confirmations,
      timestamp: txDetails.timestamp,
      fee: txDetails.fee,
    });
    console.log();
  }

  // Get a specific block
  console.log('Fetching block details...');
  const blockNumber = Math.max(1, latestBlock.number - 10);
  const block = await client.blockchain.getBlock(blockNumber);
  console.log(`Block #${block.number}:`, {
    hash: block.hash,
    timestamp: block.timestamp,
    transaction_count: block.transaction_count,
    miner: block.miner,
    size: block.size,
  });
  console.log();

  // Smart Contract Operations (examples - commented out)
  /*
  // Deploy a contract
  console.log('Deploying smart contract...');
  const contract = await client.blockchain.deployContract({
    name: 'MyToken',
    code: contractBytecode,
    constructor_args: ['My Token', 'MTK', 1000000],
  });

  console.log('Contract deployed:', {
    address: contract.address,
    name: contract.name,
    deployment_tx: contract.deployment_tx,
  });
  console.log();

  // Call a contract method (read-only)
  console.log('Calling contract method...');
  const totalSupply = await client.blockchain.callContract({
    contract: contract.address,
    method: 'totalSupply',
    args: [],
  });

  console.log('Total supply:', totalSupply);
  console.log();

  // Execute a contract method (write operation)
  console.log('Executing contract method...');
  const transferTx = await client.blockchain.executeContract({
    contract: contract.address,
    method: 'transfer',
    args: ['0x0000000000000000000000000000000000000001', 100],
  });

  console.log('Transfer transaction:', {
    hash: transferTx.hash,
    status: transferTx.status,
  });
  console.log();
  */

  console.log('Blockchain example completed!');
}

// Run the example
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
