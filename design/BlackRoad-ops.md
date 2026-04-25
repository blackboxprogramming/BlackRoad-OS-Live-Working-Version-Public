# BlackRoad Operating Context
# Remember the Road. Pave Tomorrow.

## Active Root
```
/Applications/BlackRoad-OS-FileSystem
```

## Operating Rules
- This is the ONLY active BlackRoad filesystem root
- Do not write outside this workspace unless explicitly asked
- Prefer safe, reversible, idempotent setup steps
- No destructive moves, deletions, or renames without confirmation
- Always show exact full paths for anything created or modified

## Structure (16 layers)
```
00-canonical     Source of truth (taxonomy, policies, schemas, naming, governance)
01-code          14 Git repos (blackroad-os, web, docs, infrastructure, agents, fleet, products, memory, integrations, assets, templates, mockups, research-index, canonical)
02-registries    Metadata indexes (files, objects, shards, lineage, dedup, lifecycle, permissions)
03-ingest        Pipeline (inbox, uploads, crawlers, classify, quarantine)
04-index         Search (fulltext, embeddings, graph, summaries, relationships)
05-storage       Temperature-based (hot/warm/cold)
06-domains       Views (agents, products, fleet, research, data, memory, assets, templates, mockups, docs)
07-products      19 products
08-agents        27 agents + shared
09-fleet         Devices (pi, mac, jetson, cloud, edge, tunnels)
10-workspaces    Active/scratch/build/review/publish
11-runtime       Services/workers/queues/pipelines/cache
12-observability Logs/metrics/traces/health/audits
13-security      Auth/identity/secrets/keys/compliance
14-archive       Deprecated/frozen/sealed/legal-hold
15-external      GitHub/Slack/Cloudflare/Figma/Canva
```

## Canonical Source of Truth
```
/Applications/BlackRoad-OS-FileSystem/01-code/blackroad-canonical/
├── README.md
├── taxonomy/README.md
├── repo-map/repo-map.yaml
├── classification/classification-rules.yaml
├── storage/storage-policy.md
├── shards/shard-policy.md
├── naming/
├── policies/
├── schemas/
└── governance/
```

## Object ID Standard
```
br:{domain}:{class}:{year}:{shard}:{object_id}
```

## Storage Path Standard
```
/storage/{temperature}/{domain}/{class}/{year}/{month}/{hash-prefix}/{object_id}
```

## 30 File Classes
CODE, DOC, REGISTRY, ASSET, TEMPLATE, MOCKUP, RESEARCH_RAW, RESEARCH_INDEX, DATA_RAW, DATA_INDEX, MEMORY_EVENT, MEMORY_INDEX, PRODUCT_ARTIFACT, AGENT_ARTIFACT, FLEET_SNAPSHOT, LOG, METRIC, TRACE, BUILD_OUTPUT, RELEASE, MODEL_WEIGHT, MODEL_CONFIG, EMBEDDING, GRAPH_NODE, GRAPH_EDGE, ARCHIVE, COMPLIANCE_RECORD, SECRET, EXTERNAL_REFERENCE, QUARANTINED

## Storage Law
- Git = code, docs, schemas, manifests, policies (<50MB/file, <50K files/repo)
- Object storage = raw blobs, media, research, data, logs, weights, archives
- DB = registries, lineage, lifecycle, permissions, dedup
- Vector = embeddings, semantic retrieval
- Vault = secrets (NEVER in git)

## Non-Negotiable Rules
1. Folders are human views, not storage truth
2. Every object must have a manifestable identity
3. Every high-volume domain must shard deterministically
4. No giant flat directories
5. Git is for truth, not mass blob storage
6. blackroad-canonical governs naming, taxonomy, repo-map, shard rules, and classification
7. All downstream repos reference canonical, not reinvent it
8. Archive is lifecycle state, not a dumping ground
9. Object storage paths must be derivable from object ID + shard rule
10. Registries must stay compact and authoritative

## BlackRoad Context References
- Agent subdomains on blackroad.me
- Core domains: blackroad.io, blackroadai.com, roadchain.io, roadcoin.io, lucidia.earth
- SSH targets: lucidia, aria, alice, octavia, anastasia, cecilia, gematria, calliope, gaia, olympia, blackroad, cadence
- BlackRoad-OS-Live repos (Private + Public, Monorepo + Working)
- /Applications/BlackRoad/Index.md.rtf
- Connected tools: npm, Clerk, Hugging Face, Linear, Slack, Ollama, Enclave, Termius, iSH, Pyto, Shellfish, Working Copy, Supanator, Koder, Figma, Claude, Canva, GitHub, Stripe, nginx, pm2, uvicorn, NATS, Tailscale, Headscale, tunnels, Gitea

## Workflow Tracking
On every meaningful step, consider and report:
- [MEMORY] — ~/blackroad-operator/scripts/memory/memory-system.sh
- [CODEX] — ~/blackroad-operator/scripts/memory/memory-codex.sh
- [PRODUCTS] — ~/blackroad-operator/scripts/memory/memory-products.sh
- [BRTODO] — ~/blackroad-operator/scripts/memory/memory-infinite-todos.sh
- [COLLAB] — ~/blackroad-operator/scripts/memory/memory-collaboration.sh
- [ROADTRIP] — https://roadtrip.blackroad.io/api/chat

## Conflict Resolution
When references conflict, treat BlackRoad-Products as the most complete current reference unless explicitly told otherwise.

## Tagline
Remember the Road. Pave Tomorrow.
BlackRoad OS, Inc. — 2025-2026
