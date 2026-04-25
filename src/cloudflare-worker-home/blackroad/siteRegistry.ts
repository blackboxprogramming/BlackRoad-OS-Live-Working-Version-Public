import type { Site } from "./types";
import { SITES } from "./sites";

export function listSites(): Site[] {
  return SITES.slice();
}

export function getSiteByDomain(domain: string): Site | undefined {
  const needle = domain.toLowerCase();
  return SITES.find((s) => s.domain.toLowerCase() === needle);
}

export function getSiteById(id: string): Site | undefined {
  const needle = id.toLowerCase();
  return SITES.find((s) => s.id.toLowerCase() === needle);
}

export type SitesApiView = Pick<
  Site,
  "id" | "domain" | "purpose" | "primaryCTA" | "url" | "title" | "type" | "status" | "priority"
>;

export function listSitesApiView(): SitesApiView[] {
  return SITES.map((s) => ({
    id: s.id,
    domain: s.domain,
    purpose: s.purpose,
    primaryCTA: s.primaryCTA,
    url: s.url,
    title: s.title,
    type: s.type,
    status: s.status,
    priority: s.priority,
  }));
}
