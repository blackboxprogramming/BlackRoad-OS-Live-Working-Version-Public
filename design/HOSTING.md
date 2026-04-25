# Hosting (BlackRoad Web)

## Workers in this workspace

- `agents.blackroad.io` → `agents-worker` → `cd agents-worker && wrangler deploy`
- `roadtrip.blackroad.io` → `.road/apps/roundtrip` → `cd .road/apps/roundtrip && wrangler deploy`
- `roadcode.blackroad.io` → `roadcode-worker` → `cd roadcode-worker && wrangler deploy`
- `roadcoin.blackroad.io` → `roadcoin-blackroad` → `cd roadcoin-blackroad && wrangler deploy`
- `roadband.blackroad.io` → `roadband-blackroad` → `cd roadband-blackroad && wrangler deploy`
- `roadwork.blackroad.io` → `roadwork-blackroad` → `cd roadwork-blackroad && wrangler deploy`
- `roadview.blackroad.io` → `Application/roadview` → `cd Application/roadview && wrangler deploy`
- `*.blackroad.me/*` → `blackroad-me-wildcard-redirect` → `cd blackroad-me-wildcard-redirect && wrangler deploy`
- `windows95 (mock)` → `windows95-mock-worker` → `cd windows95-mock-worker && wrangler deploy` (serves `mockups/windows95.html`)

## DNS / routing prerequisites

- These projects use `wrangler.toml` `routes` / `[[routes]]` against the zone (for example `zone_name = "blackroad.io"`).
- In Cloudflare, ensure the hostname exists in DNS and is **proxied** (orange cloud) so the Worker route can match.

## Local verification

- `wrangler dev` (in the worker folder), then open the printed local URL.

## Not yet mapped here

If you want to host these root domains too, we need the code (or decide “redirect-only” Workers):
`blackroad.io`, `blackroad.company`, `blackroad.network`, `blackroad.systems`, `blackroadai.com`, `blackroadinc.us`, `blackroadqi.com`, `blackroadquantum.com`, `blackroadquantum.info`, `blackroadquantum.net`, `blackroadquantum.shop`, `blackroadquantum.store`, `blackboxprogramming.io`, `aliceqi.com`, `lucidia.earth`, `lucidia.studio`, `lucidiaqi.com`, `roadchain.io`, `roadcoin.io`.
