# BlackRoad CLI (br)

Minimal, pipe-first command router for BlackRoad agents.

## Examples

### Echo
echo "hello" | br echo

### Route only
echo "Set up Cloudflare tunnels" | br route

### Run specific agent
echo "Set up Cloudflare tunnels" | br agent blackroad-operator

### Auto-dispatch via funnel
echo "Set up Cloudflare tunnels" | br dispatch

### List agents
br list

### Interactive REPL
br repl

## Design Rules
- stdin → stdout
- no UI state
- no side effects
- boring on purpose
