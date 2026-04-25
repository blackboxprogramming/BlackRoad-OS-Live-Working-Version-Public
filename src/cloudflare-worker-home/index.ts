import { handleArchiveApi, jsonResponse } from "./archiveApi";
import { getProductByDomain, listProducts } from "./blackroad/productRegistry";
import { listSitesApiView } from "./blackroad/siteRegistry";

type Env = {
  ASSETS: Fetcher;
};

function redirect(to: string, status = 302): Response {
  return new Response(null, { status, headers: { Location: to } });
}

function withGrayscale(res: Response): Response {
  const ct = (res.headers.get("Content-Type") || "").toLowerCase();
  if (!ct.includes("text/html")) return res;

  const out = new HTMLRewriter()
    .on("head", {
      element(el) {
        el.append('<style id="br-grayscale">html{filter:grayscale(1)}</style>', { html: true });
      },
    })
    .transform(res);

  out.headers.set("X-BlackRoad-Grayscale", "1");
  return out;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const product = getProductByDomain(url.hostname);

    // RoadCode integration (Git hosting)
    if (url.pathname === "/roadc") return redirect("/roadc/");
    if (url.pathname.startsWith("/roadc/")) {
      const suffix = url.pathname.slice("/roadc".length) || "/";
      const dest = `https://roadcode.blackroad.io${suffix}${url.search}`;
      return new Response(null, { status: 302, headers: { Location: dest } });
    }

    if (url.pathname === "/api/health" || url.pathname === "/home/api/health") {
      return jsonResponse(
        { ok: true, service: "blackroad-home-worker" },
        { status: 200, headers: { "X-BlackRoad-Worker": "api", "X-BlackRoad-Rev": "2026-04-24a" } }
      );
    }
    if (url.pathname === "/api/products" || url.pathname === "/home/api/products") {
      return jsonResponse(
        { products: listProducts() },
        { status: 200, headers: { "X-BlackRoad-Worker": "api" } }
      );
    }
    if (url.pathname === "/api/sites" || url.pathname === "/home/api/sites") {
      return jsonResponse(
        { sites: listSitesApiView() },
        { status: 200, headers: { "X-BlackRoad-Worker": "api" } }
      );
    }
    const archiveApi = await handleArchiveApi(request, env);
    if (archiveApi) return archiveApi;

    // Proxy /agents/* to agents.blackroad.io so it lives under blackroad.io/agents/
    if (url.pathname === "/agents") return redirect("/agents/");
    if (url.pathname.startsWith("/agents/")) {
      const upstream = new URL(request.url);
      upstream.protocol = "https:";
      upstream.hostname = "agents.blackroad.io";
      upstream.pathname = url.pathname.slice("/agents".length) || "/";

      const upstreamReq = new Request(upstream.toString(), request);
      const res = await fetch(upstreamReq);
      const out = new Response(res.body, res);
      out.headers.set("X-BlackRoad-Worker", "agents");
      return out;
    }

    // mockups.blackroad.io → serve mockups gallery
    const isMockups = url.hostname === "mockups.blackroad.io";
    if (isMockups) {
      const mockupPath = url.pathname === "/" ? "/home/mockups/" : `/home/mockups${url.pathname}`;
      const rewritten = new Request(new URL(mockupPath, url.origin).toString(), request);
      const res = await env.ASSETS.fetch(rewritten);
      const out = new Response(res.body, res);
      out.headers.set("X-BlackRoad-Worker", "mockups");
      return withGrayscale(out);
    }

    // Product hosts: treat root as the product surface
    if (product) {
      if (url.pathname === "/" || url.pathname === "/home/" || url.pathname === "/home") {
        return redirect(product.route);
      }
    }

    // Convenience: send root to /home/
    if (url.pathname === "/") return redirect("/home/");

    // Enforce trailing slash for /home so relative asset paths behave.
    if (url.pathname === "/home") return redirect("/home/");

    // Serve /home/* from static assets.
    if (url.pathname.startsWith("/home/")) {
      if (url.pathname === "/home/mockups") {
        return redirect("/home/mockups/");
      } else if (url.pathname === "/home/mockups/") {
        // Directory index (public/home/mockups/index.html) is served by the assets layer.
      } else if (url.pathname.startsWith("/home/apps/")) {
        // Directory-style app routes:
        // - /home/apps/<App>   -> /home/apps/<App>/
        // - /home/apps/<App>/  -> served by assets layer (index.html)
        //
        // Keep /home/apps/_shared/* untouched.
        const rest = url.pathname.slice("/home/apps/".length);
        const seg = rest.split("/")[0] || "";
        const isShared = seg === "_shared";
        const hasExt = seg.includes(".");
        if (!isShared && !hasExt) {
          if (!url.pathname.endsWith("/")) {
            return redirect(`${url.pathname}/`);
          }
        }
      }
      const res = await env.ASSETS.fetch(request);
      const out = new Response(res.body, res);
      // Safe defaults; Cloudflare may still cache per content-type rules.
      out.headers.set("X-BlackRoad-Worker", "home");
      return withGrayscale(out);
    }

    // Public routes for mapping blackroad.io/atlas* and blackroad.io/archive* to this Worker.
    if (url.pathname === "/atlas") return redirect("/atlas/");
    if (url.pathname.startsWith("/atlas/")) {
      const res = await env.ASSETS.fetch(request);
      const out = new Response(res.body, res);
      out.headers.set("X-BlackRoad-Worker", "atlas");
      return withGrayscale(out);
    }

    if (url.pathname === "/archive") return redirect("/archive/");
    if (url.pathname.startsWith("/archive/")) {
      const res = await env.ASSETS.fetch(request);
      const out = new Response(res.body, res);
      out.headers.set("X-BlackRoad-Worker", "archive");
      return withGrayscale(out);
    }

    return new Response("Not found", { status: 404 });
  },
};
