type Env = {
  ASSETS: Fetcher;
};

type ArchiveProduct = { key: string; label: string; count: number };
type ArchiveItem = {
  path: string;
  name: string;
  ext: string;
  bytes: number;
  mtimeMs: number;
  products?: string[];
};

type ArchiveManifest = {
  generatedAt: string | null;
  count: number;
  products?: ArchiveProduct[];
  items: ArchiveItem[];
};

let cache:
  | {
      atMs: number;
      etag: string | null;
      manifest: ArchiveManifest;
    }
  | null = null;

async function fetchAssetJson<T>(env: Env, pathname: string): Promise<{ json: T; etag: string | null }> {
  const u = new URL("https://assets.invalid" + pathname);
  const res = await env.ASSETS.fetch(new Request(u.toString()));
  if (!res.ok) throw new Error(`asset fetch failed: ${pathname} ${res.status}`);
  const etag = res.headers.get("ETag");
  const json = (await res.json()) as T;
  return { json, etag };
}

export async function getArchiveManifest(env: Env): Promise<ArchiveManifest> {
  const now = Date.now();
  if (cache && now - cache.atMs < 30_000) return cache.manifest;

  const { json, etag } = await fetchAssetJson<ArchiveManifest>(env, "/archive/manifest.json");
  cache = { atMs: now, etag, manifest: json };
  return json;
}

export function jsonResponse(body: unknown, init?: ResponseInit): Response {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  return new Response(JSON.stringify(body, null, 2) + "\n", { ...init, headers });
}

function clampInt(v: string | null, def: number, min: number, max: number): number {
  const n = Number.parseInt(v || "", 10);
  if (!Number.isFinite(n)) return def;
  return Math.max(min, Math.min(max, n));
}

export async function handleArchiveApi(request: Request, env: Env): Promise<Response | null> {
  const url = new URL(request.url);
  const normalizedPath = url.pathname.startsWith("/home/api/")
    ? "/api/" + url.pathname.slice("/home/api/".length)
    : url.pathname;
  if (!normalizedPath.startsWith("/api/archive/")) return null;

  const manifest = await getArchiveManifest(env);

  if (normalizedPath === "/api/archive/manifest") {
    return jsonResponse(manifest, { status: 200, headers: { "X-BlackRoad-Worker": "api-archive" } });
  }

  if (normalizedPath === "/api/archive/products") {
    return jsonResponse(
      { generatedAt: manifest.generatedAt, products: manifest.products || [] },
      { status: 200, headers: { "X-BlackRoad-Worker": "api-archive" } }
    );
  }

  if (normalizedPath === "/api/archive/search") {
    const q = (url.searchParams.get("q") || "").trim().toLowerCase();
    const p = (url.searchParams.get("p") || "").trim().toLowerCase();
    const limit = clampInt(url.searchParams.get("limit"), 50, 1, 200);
    const offset = clampInt(url.searchParams.get("offset"), 0, 0, 10_000);

    let items = manifest.items;
    if (p) items = items.filter((it) => Array.isArray(it.products) && it.products.map((x) => String(x).toLowerCase()).includes(p));
    if (q) items = items.filter((it) => (it.path || "").toLowerCase().includes(q) || (it.name || "").toLowerCase().includes(q));

    const total = items.length;
    const page = items.slice(offset, offset + limit);
    return jsonResponse(
      { q, p: p || null, offset, limit, total, items: page },
      { status: 200, headers: { "X-BlackRoad-Worker": "api-archive" } }
    );
  }

  return jsonResponse({ error: "Not found" }, { status: 404, headers: { "X-BlackRoad-Worker": "api-archive" } });
}
