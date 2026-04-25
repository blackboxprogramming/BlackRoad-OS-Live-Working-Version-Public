/**
 * Blockchain client for BlackRoad SDK
 */

import type { AxiosInstance } from 'axios';
import type {
  Transaction,
  SendTransactionParams,
  Balance,
  TransactionListParams,
  TransactionListResponse,
  SmartContract,
  DeployContractParams,
  ContractCallParams,
  Block,
  NetworkStats,
  GasEstimate,
} from './types';
import { get, post } from './utils/http';

/**
 * Handles blockchain operations
 */
export class BlockchainClient {
  private httpClient: AxiosInstance;

  constructor(httpClient: AxiosInstance) {
    this.httpClient = httpClient;
  }

  /**
   * Gets the balance for an address
   *
   * @param address - Wallet address
   * @param asset - Optional asset identifier (defaults to native token)
   * @returns Balance information
   *
   * @example
   * ```typescript
   * const balance = await client.blockchain.getBalance('0x...');
   * console.log(`Available: ${balance.available} ${balance.symbol}`);
   * ```
   */
  async getBalance(address: string, asset?: string): Promise<Balance> {
    return get<Balance>(this.httpClient, `/blockchain/balances/${address}`, {
      params: { asset },
    });
  }

  /**
   * Gets all balances for an address
   *
   * @param address - Wallet address
   * @returns Array of balances for all assets
   *
   * @example
   * ```typescript
   * const balances = await client.blockchain.getBalances('0x...');
   * balances.forEach(balance => {
   *   console.log(`${balance.symbol}: ${balance.available}`);
   * });
   * ```
   */
  async getBalances(address: string): Promise<Balance[]> {
    return get<Balance[]>(this.httpClient, `/blockchain/balances/${address}/all`);
  }

  /**
   * Sends a transaction
   *
   * @param params - Transaction parameters
   * @returns Transaction details
   *
   * @example
   * ```typescript
   * const tx = await client.blockchain.sendTransaction({
   *   to: '0x...',
   *   amount: 100,
   *   asset: 'BRD',
   *   memo: 'Payment for services',
   * });
   *
   * console.log('Transaction hash:', tx.hash);
   * ```
   */
  async sendTransaction(params: SendTransactionParams): Promise<Transaction> {
    return post<Transaction>(this.httpClient, '/blockchain/transactions', params);
  }

  /**
   * Gets a transaction by hash
   *
   * @param hash - Transaction hash
   * @returns Transaction details
   *
   * @example
   * ```typescript
   * const tx = await client.blockchain.getTransaction('0x...');
   * console.log('Status:', tx.status);
   * console.log('Confirmations:', tx.confirmations);
   * ```
   */
  async getTransaction(hash: string): Promise<Transaction> {
    return get<Transaction>(this.httpClient, `/blockchain/transactions/${hash}`);
  }

  /**
   * Gets the status of a transaction
   *
   * @param hash - Transaction hash
   * @returns Transaction status
   *
   * @example
   * ```typescript
   * const status = await client.blockchain.getTransactionStatus('0x...');
   * console.log('Status:', status);
   * ```
   */
  async getTransactionStatus(hash: string): Promise<string> {
    const tx = await this.getTransaction(hash);
    return tx.status;
  }

  /**
   * Lists transactions with optional filtering
   *
   * @param params - List parameters
   * @returns Paginated list of transactions
   *
   * @example
   * ```typescript
   * const response = await client.blockchain.listTransactions({
   *   address: '0x...',
   *   status: 'confirmed',
   *   limit: 50,
   * });
   *
   * response.transactions.forEach(tx => {
   *   console.log(`${tx.hash}: ${tx.amount} ${tx.asset}`);
   * });
   * ```
   */
  async listTransactions(params?: TransactionListParams): Promise<TransactionListResponse> {
    return get<TransactionListResponse>(this.httpClient, '/blockchain/transactions', {
      params,
    });
  }

  /**
   * Waits for a transaction to be confirmed
   *
   * @param hash - Transaction hash
   * @param confirmations - Required confirmations (default: 1)
   * @param timeout - Timeout in milliseconds (default: 5 minutes)
   * @returns Confirmed transaction
   *
   * @example
   * ```typescript
   * const tx = await client.blockchain.sendTransaction({ ... });
   * const confirmed = await client.blockchain.waitForTransaction(tx.hash, 3);
   * console.log('Transaction confirmed with', confirmed.confirmations, 'confirmations');
   * ```
   */
  async waitForTransaction(
    hash: string,
    confirmations: number = 1,
    timeout: number = 300000
  ): Promise<Transaction> {
    const startTime = Date.now();
    const pollInterval = 2000; // 2 seconds

    while (true) {
      const tx = await this.getTransaction(hash);

      if (tx.status === 'failed' || tx.status === 'cancelled') {
        throw new Error(`Transaction ${tx.status}: ${hash}`);
      }

      if (tx.confirmations >= confirmations) {
        return tx;
      }

      if (Date.now() - startTime > timeout) {
        throw new Error(`Transaction timeout after ${timeout}ms`);
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }
  }

  /**
   * Deploys a smart contract
   *
   * @param params - Deployment parameters
   * @returns Deployed contract details
   *
   * @example
   * ```typescript
   * const contract = await client.blockchain.deployContract({
   *   name: 'MyContract',
   *   code: contractBytecode,
   *   constructor_args: ['arg1', 'arg2'],
   * });
   *
   * console.log('Contract deployed at:', contract.address);
   * ```
   */
  async deployContract(params: DeployContractParams): Promise<SmartContract> {
    return post<SmartContract>(this.httpClient, '/blockchain/contracts', params);
  }

  /**
   * Gets a smart contract by address
   *
   * @param address - Contract address
   * @returns Contract details
   *
   * @example
   * ```typescript
   * const contract = await client.blockchain.getContract('0x...');
   * console.log('Contract:', contract.name);
   * ```
   */
  async getContract(address: string): Promise<SmartContract> {
    return get<SmartContract>(this.httpClient, `/blockchain/contracts/${address}`);
  }

  /**
   * Calls a smart contract method (read-only)
   *
   * @param params - Call parameters
   * @returns Method result
   *
   * @example
   * ```typescript
   * const result = await client.blockchain.callContract({
   *   contract: '0x...',
   *   method: 'balanceOf',
   *   args: ['0x...'],
   * });
   * ```
   */
  async callContract(params: ContractCallParams): Promise<unknown> {
    return post<unknown>(this.httpClient, '/blockchain/contracts/call', params);
  }

  /**
   * Executes a smart contract method (write operation)
   *
   * @param params - Execution parameters
   * @returns Transaction details
   *
   * @example
   * ```typescript
   * const tx = await client.blockchain.executeContract({
   *   contract: '0x...',
   *   method: 'transfer',
   *   args: ['0x...', 100],
   * });
   * ```
   */
  async executeContract(params: ContractCallParams): Promise<Transaction> {
    return post<Transaction>(this.httpClient, '/blockchain/contracts/execute', params);
  }

  /**
   * Gets a block by number or hash
   *
   * @param blockId - Block number or hash
   * @returns Block details
   *
   * @example
   * ```typescript
   * const block = await client.blockchain.getBlock(12345);
   * console.log('Block hash:', block.hash);
   * console.log('Transactions:', block.transaction_count);
   * ```
   */
  async getBlock(blockId: number | string): Promise<Block> {
    return get<Block>(this.httpClient, `/blockchain/blocks/${blockId}`);
  }

  /**
   * Gets the latest block
   *
   * @returns Latest block details
   *
   * @example
   * ```typescript
   * const block = await client.blockchain.getLatestBlock();
   * console.log('Latest block number:', block.number);
   * ```
   */
  async getLatestBlock(): Promise<Block> {
    return get<Block>(this.httpClient, '/blockchain/blocks/latest');
  }

  /**
   * Gets network statistics
   *
   * @returns Network stats
   *
   * @example
   * ```typescript
   * const stats = await client.blockchain.getNetworkStats();
   * console.log('Block height:', stats.block_height);
   * console.log('TPS:', stats.tps);
   * ```
   */
  async getNetworkStats(): Promise<NetworkStats> {
    return get<NetworkStats>(this.httpClient, '/blockchain/stats');
  }

  /**
   * Estimates gas for a transaction
   *
   * @param params - Transaction parameters
   * @returns Gas estimate
   *
   * @example
   * ```typescript
   * const estimate = await client.blockchain.estimateGas({
   *   to: '0x...',
   *   amount: 100,
   * });
   *
   * console.log('Gas limit:', estimate.gas_limit);
   * console.log('Total cost:', estimate.total_cost);
   * ```
   */
  async estimateGas(params: SendTransactionParams): Promise<GasEstimate> {
    return post<GasEstimate>(this.httpClient, '/blockchain/gas/estimate', params);
  }

  /**
   * Gets the current gas price
   *
   * @returns Gas price in Wei
   *
   * @example
   * ```typescript
   * const gasPrice = await client.blockchain.getGasPrice();
   * console.log('Gas price:', gasPrice);
   * ```
   */
  async getGasPrice(): Promise<string> {
    const response = await get<{ gas_price: string }>(
      this.httpClient,
      '/blockchain/gas/price'
    );
    return response.gas_price;
  }
}
