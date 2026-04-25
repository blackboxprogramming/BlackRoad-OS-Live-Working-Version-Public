/**
 * Blockchain-related type definitions
 */

/**
 * Supported blockchain networks
 */
export type Network = 'mainnet' | 'testnet' | 'devnet';

/**
 * Transaction status
 */
export type TransactionStatus =
  | 'pending'
  | 'confirming'
  | 'confirmed'
  | 'failed'
  | 'cancelled';

/**
 * Asset type
 */
export type AssetType = 'native' | 'token' | 'nft';

/**
 * Represents a blockchain transaction
 */
export interface Transaction {
  /** Transaction hash */
  hash: string;

  /** Sender address */
  from: string;

  /** Recipient address */
  to: string;

  /** Amount transferred */
  amount: string;

  /** Asset identifier */
  asset: string;

  /** Asset type */
  asset_type: AssetType;

  /** Transaction fee */
  fee: string;

  /** Transaction status */
  status: TransactionStatus;

  /** Block number */
  block_number?: number;

  /** Block hash */
  block_hash?: string;

  /** Number of confirmations */
  confirmations: number;

  /** Transaction timestamp */
  timestamp: string;

  /** Transaction memo/note */
  memo?: string;

  /** Transaction metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for sending a transaction
 */
export interface SendTransactionParams {
  /** Recipient address */
  to: string;

  /** Amount to send */
  amount: number | string;

  /** Asset to send (default: native token) */
  asset?: string;

  /** Transaction memo */
  memo?: string;

  /** Gas limit */
  gas_limit?: number;

  /** Gas price */
  gas_price?: string;

  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Wallet balance information
 */
export interface Balance {
  /** Wallet address */
  address: string;

  /** Asset identifier */
  asset: string;

  /** Asset symbol */
  symbol: string;

  /** Available balance */
  available: string;

  /** Locked/staked balance */
  locked: string;

  /** Total balance */
  total: string;

  /** USD value (if available) */
  usd_value?: string;

  /** Last updated timestamp */
  updated_at: string;
}

/**
 * Parameters for listing transactions
 */
export interface TransactionListParams {
  /** Filter by address */
  address?: string;

  /** Filter by status */
  status?: TransactionStatus;

  /** Filter by asset */
  asset?: string;

  /** Start date */
  from_date?: string;

  /** End date */
  to_date?: string;

  /** Number of results */
  limit?: number;

  /** Offset for pagination */
  offset?: number;
}

/**
 * Transaction list response
 */
export interface TransactionListResponse {
  /** List of transactions */
  transactions: Transaction[];

  /** Total count */
  total: number;

  /** Number returned */
  count: number;

  /** Offset */
  offset: number;

  /** Whether there are more results */
  has_more: boolean;
}

/**
 * Smart contract
 */
export interface SmartContract {
  /** Contract address */
  address: string;

  /** Contract name */
  name: string;

  /** Contract description */
  description?: string;

  /** Deployment transaction hash */
  deployment_tx: string;

  /** Deployer address */
  deployer: string;

  /** Contract ABI */
  abi?: unknown[];

  /** Contract bytecode */
  bytecode?: string;

  /** Deployment timestamp */
  deployed_at: string;

  /** Verified status */
  verified: boolean;

  /** Contract metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for deploying a smart contract
 */
export interface DeployContractParams {
  /** Contract name */
  name: string;

  /** Contract code/bytecode */
  code: string;

  /** Constructor arguments */
  constructor_args?: unknown[];

  /** Gas limit */
  gas_limit?: number;

  /** Initial value to send */
  value?: string;

  /** Contract metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Parameters for calling a smart contract method
 */
export interface ContractCallParams {
  /** Contract address */
  contract: string;

  /** Method name */
  method: string;

  /** Method arguments */
  args?: unknown[];

  /** Value to send with the call */
  value?: string;

  /** Gas limit */
  gas_limit?: number;
}

/**
 * Block information
 */
export interface Block {
  /** Block number */
  number: number;

  /** Block hash */
  hash: string;

  /** Parent block hash */
  parent_hash: string;

  /** Block timestamp */
  timestamp: string;

  /** Miner/validator address */
  miner: string;

  /** Number of transactions */
  transaction_count: number;

  /** Block size in bytes */
  size: number;

  /** Gas used */
  gas_used: string;

  /** Gas limit */
  gas_limit: string;

  /** Block difficulty */
  difficulty?: string;

  /** Block metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Network statistics
 */
export interface NetworkStats {
  /** Network name */
  network: Network;

  /** Current block height */
  block_height: number;

  /** Average block time in seconds */
  avg_block_time: number;

  /** Total transactions */
  total_transactions: number;

  /** Transactions per second */
  tps: number;

  /** Total accounts */
  total_accounts: number;

  /** Total contracts */
  total_contracts: number;

  /** Network hash rate */
  hash_rate?: string;

  /** Last updated */
  updated_at: string;
}

/**
 * Gas estimation result
 */
export interface GasEstimate {
  /** Estimated gas limit */
  gas_limit: number;

  /** Suggested gas price */
  gas_price: string;

  /** Total estimated cost */
  total_cost: string;

  /** Total cost in USD (if available) */
  total_cost_usd?: string;
}
