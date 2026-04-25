# BlackRoad OS TypeScript SDK

Official TypeScript/JavaScript SDK for the BlackRoad Operating System - a decentralized platform for AI agents and blockchain integration.

## Features

- 🔒 **Type-Safe**: Full TypeScript support with comprehensive type definitions
- 🌐 **Universal**: Works in Node.js and browser environments
- ⚡ **Modern**: Built with async/await and ES6+
- 🔄 **Resilient**: Automatic retry logic and error handling
- 📦 **Flexible**: Supports both ESM and CommonJS
- 🔐 **Secure**: Built-in authentication (API keys, JWT)
- 📖 **Well-Documented**: Comprehensive JSDoc comments and examples

## Installation

```bash
npm install @blackroad/sdk
```

Or with yarn:

```bash
yarn add @blackroad/sdk
```

Or with pnpm:

```bash
pnpm add @blackroad/sdk
```

## Quick Start

```typescript
import { BlackRoadClient } from '@blackroad/sdk';

// Initialize the client
const client = new BlackRoadClient({
  apiKey: 'your-api-key',
  baseURL: 'https://api.blackroad.io',
});

// Create an AI agent
const agent = await client.agents.create({
  name: 'My AI Agent',
  type: 'autonomous',
  capabilities: ['reasoning', 'execution'],
});

// Interact with the blockchain
const transaction = await client.blockchain.sendTransaction({
  to: '0x...',
  amount: 100,
  asset: 'BRD',
});
```

## Authentication

The SDK supports multiple authentication methods:

### API Key

```typescript
const client = new BlackRoadClient({
  apiKey: 'your-api-key',
});
```

### JWT Token

```typescript
const client = new BlackRoadClient({
  token: 'your-jwt-token',
});
```

### Custom Headers

```typescript
const client = new BlackRoadClient({
  headers: {
    'X-Custom-Auth': 'your-custom-auth',
  },
});
```

## Usage Examples

### Working with AI Agents

```typescript
// Create an agent
const agent = await client.agents.create({
  name: 'Data Analyzer',
  type: 'autonomous',
  capabilities: ['data_analysis', 'visualization'],
});

// Get agent details
const agentDetails = await client.agents.get(agent.id);

// List all agents
const agents = await client.agents.list({
  limit: 10,
  offset: 0,
});

// Execute agent task
const result = await client.agents.execute(agent.id, {
  task: 'analyze_dataset',
  parameters: {
    dataset: 'sales_data_2024',
  },
});

// Update agent
await client.agents.update(agent.id, {
  name: 'Advanced Data Analyzer',
});

// Delete agent
await client.agents.delete(agent.id);
```

### Blockchain Operations

```typescript
// Get wallet balance
const balance = await client.blockchain.getBalance('0x...');

// Send transaction
const tx = await client.blockchain.sendTransaction({
  to: '0x...',
  amount: 100,
  asset: 'BRD',
  memo: 'Payment for services',
});

// Get transaction status
const status = await client.blockchain.getTransactionStatus(tx.hash);

// List transactions
const transactions = await client.blockchain.listTransactions({
  address: '0x...',
  limit: 50,
});

// Create smart contract
const contract = await client.blockchain.deployContract({
  code: contractCode,
  constructor_args: [],
});
```

### User Management

```typescript
// Get current user
const user = await client.auth.getCurrentUser();

// Update profile
await client.auth.updateProfile({
  display_name: 'John Doe',
  avatar_url: 'https://example.com/avatar.jpg',
});

// Refresh token
const newToken = await client.auth.refreshToken();
```

## Configuration Options

```typescript
interface BlackRoadClientConfig {
  /** API key for authentication */
  apiKey?: string;

  /** JWT token for authentication */
  token?: string;

  /** Base URL for the API (default: https://api.blackroad.io) */
  baseURL?: string;

  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;

  /** Number of retry attempts for failed requests (default: 3) */
  maxRetries?: number;

  /** Custom headers to include in all requests */
  headers?: Record<string, string>;

  /** Enable debug logging (default: false) */
  debug?: boolean;
}
```

## Error Handling

The SDK provides custom error classes for better error handling:

```typescript
import {
  BlackRoadError,
  AuthenticationError,
  ValidationError,
  NetworkError
} from '@blackroad/sdk';

try {
  await client.agents.create({ name: 'My Agent' });
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Authentication failed:', error.message);
  } else if (error instanceof ValidationError) {
    console.error('Validation error:', error.errors);
  } else if (error instanceof NetworkError) {
    console.error('Network error:', error.message);
  } else if (error instanceof BlackRoadError) {
    console.error('BlackRoad error:', error.message);
  }
}
```

## TypeScript Support

The SDK is written in TypeScript and provides full type definitions:

```typescript
import type {
  Agent,
  AgentCreateParams,
  Transaction,
  User
} from '@blackroad/sdk';

// All types are fully typed
const createAgent = async (params: AgentCreateParams): Promise<Agent> => {
  return await client.agents.create(params);
};
```

## Browser Support

The SDK works in modern browsers with support for:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

```html
<script type="module">
  import { BlackRoadClient } from '@blackroad/sdk';

  const client = new BlackRoadClient({
    apiKey: 'your-api-key',
  });

  // Use the client
</script>
```

## Development

### Building

```bash
npm run build
```

This will create:
- `dist/cjs/` - CommonJS build
- `dist/esm/` - ESM build
- `dist/types/` - TypeScript declarations

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

## Examples

Check out the `examples/` directory for more comprehensive examples:

- `quickstart.ts` - Basic usage
- `agents-example.ts` - Working with AI agents
- `blockchain-example.ts` - Blockchain operations

## API Reference

For detailed API documentation, visit [https://docs.blackroad.io](https://docs.blackroad.io)

## Support

- Documentation: [https://docs.blackroad.io](https://docs.blackroad.io)
- Issues: [GitHub Issues](https://github.com/blackroad/blackroad-os/issues)
- Discord: [BlackRoad Community](https://discord.gg/blackroad)

## License

MIT

## Contributing

Contributions are welcome! Please read our [Contributing Guide](../../CONTRIBUTING.md) for details.
