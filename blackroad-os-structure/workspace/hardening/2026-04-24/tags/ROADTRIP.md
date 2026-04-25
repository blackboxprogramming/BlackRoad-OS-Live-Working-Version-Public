# [ROADTRIP] — 2026-04-24

- Fixed RoadTrip E2E routing by attaching `roadtrip.blackroad.io` to the shared registry-backed `blackroad-grayscale` Worker:
  - `/` → `/home/apps/RoadTrip/` (black/white base)
  - `/api/products` + `/api/sites` now return JSON (no D1 error)
- RoadTrip remains **partial** as a product (this is a launcher surface; the real convoy chat app still needs to be wired as a working service).

Next: decide whether to (a) build the real RoadTrip app behind this route, or (b) move the dedicated RoadTrip deployment to use the shared registries intentionally.
