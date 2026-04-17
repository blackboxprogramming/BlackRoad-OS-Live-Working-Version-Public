# AGENT ENTRY POINT

You are working on BlackRoad OS. Read this first. Do not ask questions — just build.

## What This Is

One AI operating system. One browser tab. 18 products. 27 agents. 20 domains. Runs on 5 Raspberry Pis + 2 droplets. $150/month.

## The 4 Repos

| Repo | Role | Deploy Target |
|------|------|---------------|
| `BlackRoad-OS-Live-Monorepo-Private` (THIS) | Canonical brain. Everything lives here. | Workers, HF Space, R2 |
| `BlackRoad-OS-Live-Working-Version-Private` | The `os-blackroad` CF Worker. Desktop OS at os.blackroad.io | `npx wrangler deploy` |
| `BlackRoad-OS-Live-Monorepo-Public` | Public mirror. Curated. No secrets. | GitHub Pages |
| `BlackRoad-OS-Live-Working-Version-Public` | Public demo surface. | GitHub Pages |

## Live URLs

| URL | What | Source |
|-----|------|--------|
| `os.blackroad.io` | Desktop OS | Working-Version-Private → CF Worker |
| `os.blackroad.io/live` | Broadcast + podcasts + videos | HF Space `blackroadio/blackroad-os-live` |
| `images.blackroad.io/*` | Media (audio, video, images) | `workers/images-blackroad/` → R2 bucket `blackroad-images` |
| `blackroad.io` | Redirects to os.blackroad.io | `workers/blackroad-grayscale/` |
| All 20 domains | Grayscale injected | `workers/blackroad-grayscale/` |

## Key Directories (this repo)

```
registry/
  route-table.json      # 500 routes, 500^n scaling
  agent-voices.json     # 27 agent → TTS voice mappings
  network-schedule.json # 5 channels, 4 dayparts
  products.json         # 18 products
  agents.json           # 27 agents
  domains.json          # 20 domains

workers/
  blackroad-router/     # THE router. 1 Worker, all routes.
  blackroad-grayscale/  # Grayscale CSS injection on all 20 domains
  network-scheduler/    # Broadcast scheduler, visitor tracking, podcast interstitials
  images-blackroad/     # R2 media serving
  provider-youtube-ingest/ # YouTube video ingestion (193 videos in KV)

scripts/
  generate-podcast.sh   # edge-tts podcast from script file
  generate-video.sh     # ffmpeg infographic video from script
  whiteboard-video.py   # Whiteboard-style video with timed text
  agent-podcast.py      # Chatterbox cloned-voice podcast
  daily-broadcast.sh    # Auto daily briefing (cron 8am)
  auto-podcast.sh       # Auto agent podcast (cron noon)

gateway/tiers/free-compute/blackroad-os-live/
  index.html            # THE live broadcast page (deployed to HF Space)
```

## Deploy Commands

```bash
# Deploy a Worker
cd workers/network-scheduler && npx wrangler deploy

# Deploy live page to HF
cd gateway/tiers/free-compute/blackroad-os-live && git push origin main

# Upload media to R2
npx wrangler r2 object put "blackroad-images/audio/file.mp3" --file file.mp3 --content-type "audio/mpeg" --remote

# Generate a podcast
./scripts/generate-podcast.sh ~/doc.md episode-name

# Generate a whiteboard video
python3 scripts/whiteboard-video.py script.txt output.mp4
```

## Fleet (SSH)

```
ssh alice           # Pi 400, edge router, .49
ssh lucidia         # Pi 5, memory spine, .38
ssh aria            # Pi 5, voice, .98
ssh blackroad@192.168.4.113  # Cecilia, Pi 5, heavy compute
ssh gaia            # Pi 4, fleet monitor, .112
ssh anastasia       # DO droplet, NATS mesh, 110d uptime
ssh gematria        # DO droplet, analytics
ssh localhost       # This Mac (Alexandria)
```

## Media on R2 (`images.blackroad.io/`)

- `audio/*.mp3` — 30+ podcasts, daily briefings, founder notes
- `video/*.mp4` — 22 videos (infographics, whiteboard, demos, Hailo)
- `pixel-art/*.png` — 54 pixel art images (HQ, campus, mascots)
- `audio/intros/*.mp3` — 27 agent intro clips
- `audio/cloned/*.mp3` — cloned voice samples
- `podcast/feed.xml` — RSS feed, 21 episodes

## Agent Voices

Each agent has a unique TTS voice. See `registry/agent-voices.json`. To generate audio for an agent:

```bash
edge-tts --voice "en-US-JennyNeural" --text "Hello from Roadie" --write-media roadie.mp3
```

## Rules

- ALL UI is grayscale. Media (video/img) stays color.
- Never ask Alexa to do things manually. Automate everything.
- Check codex/memory BEFORE building. Don't reinvent.
- Every repo must be a working app. No empty repos.
- Custom proprietary license. NEVER MIT/open source.
- Gitea is primary git. GitHub is mirror.
- Don't talk about APIs/infrastructure. Just build and show the URL.
