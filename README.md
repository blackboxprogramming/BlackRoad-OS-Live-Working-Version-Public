# BlackRoad OS -- Broadcast Operating System

A browser-based operating system shell that runs as a Cloudflare Worker, serving the BlackRoad OS desktop experience at os.blackroad.io.

## What It Is

BlackRoad OS is a broadcast operating system -- a live, always-on desktop environment in the browser. It includes a channel viewer, chat system, product launcher, network map, and real-time ticker. The entire UI is served from a single Cloudflare Worker with no external dependencies.

## Running Locally

```
npm install
npm run dev
```

This starts a local Wrangler dev server. The app will be available at http://localhost:8787.

## Deploying

```
npm run deploy
```

Deploys to Cloudflare Workers on the os.blackroad.io route.

## Structure

```
src/
  worker.js       -- Main Worker entry point, serves all routes
  index.html      -- Full desktop OS interface
  css/            -- Stylesheets
  js/             -- JavaScript modules (as .txt for Worker bundling)
  html/           -- HTML partials (body, products, mockups)
  data/           -- Channel data and assets
  mockups/        -- Product mockup pages
```

---

Copyright 2026 BlackRoad OS, Inc. All rights reserved. Proprietary and confidential.
