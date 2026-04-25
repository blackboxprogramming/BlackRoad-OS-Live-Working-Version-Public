# BlackRoad Command Dock Routing

The dock is the steering wheel. If BlackRoad has a product, agent, site, document, surface, or route, the command dock must know how to find it. No route, no road.

## Commands

### Open Products
```
open roados          -> os.blackroad.io
open roadcode        -> roadcode.blackroad.io
open roadtrip        -> roadtrip.blackroad.io
open pitstop         -> pitstop.blackroad.io
open roadwork        -> roadwork.blackroad.io
open backroad        -> backroad.blackroad.io
open carkeys         -> carkeys.blackroad.io
open roadbook        -> roadbook.blackroad.io
open roadworld       -> roadworld.blackroad.io
open roadview        -> roadview.blackroad.io
open roadchain       -> roadchain.blackroad.io
open roadcoin        -> roadcoin.blackroad.io
open roadside        -> roadside.blackroad.io
open carpool         -> carpool.blackroad.io
open blackboard      -> blackboard.blackroad.io
open oneway          -> oneway.blackroad.io
open roadband        -> roadband.blackroad.io
open highway         -> highway.blackroad.io
```

### Open Agents
```
open lucidia         -> agent:lucidia surface
open cecilia         -> agent:cecilia surface
open roadie          -> agent:roadie surface
... (all 27 agents)
```

### Open System
```
open agents          -> agents.blackroad.io
open sites           -> atlas.blackroad.io
open docs            -> docs.blackroad.io
open status          -> status.blackroad.io
open archive         -> archive.blackroad.io
open live            -> live.blackroad.io
open settings        -> RoadOS settings
open roadnode        -> RoadNode opt-in (NEVER auto-enables)
open index           -> Institutional index
open codex           -> Codex surface
open todo            -> TODO surface
open memory          -> Memory surface
open collab          -> Collaboration surface
```

### Search and Query
```
search <query>       -> RoadView search
docs <query>         -> docs.blackroad.io/search
status <product>     -> status.blackroad.io/products/<id>
trust <product>      -> <domain>/trust
health <product>     -> <domain>/health.json
agent <name>         -> agent surface
site <domain>        -> site surface
product <name>       -> product surface
go <route>           -> direct route
surface <id>         -> surface by id
```

### Aliases
- `os` = `roados` = `blackroad os`
- `pit stop` = `pitstop`
- `car keys` = `carkeys`
- `road chain` = `roadchain`
- `office road` = `officeroad` -> roadwork
- ... (40 total aliases)

## Surfaces

Everything opens as a Surface inside RoadOS:
- **61 total surfaces**: 18 products + 27 agents + 16 system
- Products open as placeholder surfaces with action buttons
- Agents open as operator panels
- System surfaces open natively

## Security

- No arbitrary JS execution from command input
- No hidden capture or silent RoadNode activation
- RoadNode commands always open the opt-in surface
- External links require explicit click
- Command history never stores secrets (passwords, tokens, API keys)

## Compliance

Run the checker:
```
npm run check:command-dock
npm run report:command-dock
```

Last run: **139/139 pass, 0 failures**

## Rules

1. The dock routes everything
2. Every product, agent, and site is routable
3. Unknown commands fall through to search
4. RoadNode is always opt-in
5. No route, no road

Remember the Road. Pave Tomorrow!
