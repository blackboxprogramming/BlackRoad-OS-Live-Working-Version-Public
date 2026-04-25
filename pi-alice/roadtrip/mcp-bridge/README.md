# roundtrip MCP Bridge

Minimal BlackRoad MCP bridge service for local repo automation.

## Endpoints

- `GET /` health/info
- `GET /system` host metadata
- `POST /exec` run a command
- `POST /file/read` read a file
- `POST /file/write` write a file
- `POST /memory/write` store JSON memory
- `POST /memory/read` load JSON memory
- `GET /memory/list` list keys

## Run

```bash
cd mcp-bridge
chmod +x start.sh
./start.sh
```

Set `MCP_BRIDGE_TOKEN` to override the default bearer token.
