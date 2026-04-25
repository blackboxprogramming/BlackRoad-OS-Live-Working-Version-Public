# BlackRoad Preview Deploy

## Preview Server

`npm run preview:server` starts a local preview at http://localhost:4173

## Preview Checks

`npm run release:preview` validates generated output without a live server.

## What it checks

- Homepage renders with SiteShell
- Product launcher grid renders
- Command dock renders and routes
- Base CSS exists
- Official tagline present
- Health.json files exist for all products
- Site.json files exist for all products
- Product docs exist for all products

## Pipeline

1. `npm run doctor -- --write-report`
2. `npm run launch:queue`
3. `npm run patch:safe`
4. `npm run release:preview`
5. `npm run release:gates`
6. `npm run release:plan`

Remember the Road. Pave Tomorrow!
