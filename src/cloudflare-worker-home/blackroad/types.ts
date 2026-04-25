export type ProductStatus = "working" | "partial" | "broken" | "blocked" | "needs-review";

export type ProductSurfaceKind =
  | "portable-computer"
  | "runtime-app"
  | "gateway"
  | "identity"
  | "ledger"
  | "search"
  | "publishing"
  | "world"
  | "social"
  | "work"
  | "learning"
  | "creator"
  | "subscription";

export type ProductCategory =
  | "os"
  | "dev"
  | "agents"
  | "learning"
  | "work"
  | "social"
  | "identity"
  | "publishing"
  | "world"
  | "search"
  | "ledger"
  | "gateway"
  | "credits"
  | "creator"
  | "subscription";

export type Product = {
  id: string;
  name: string;
  route: string;
  domain: string;
  category: ProductCategory;
  oneLine: string;
  longDescription: string;
  primaryUser: string;
  replaces: string[];
  connectedProducts: string[];
  agentLayer: string;
  surfaceKind: ProductSurfaceKind;
  status: ProductStatus;
  tags: string[];
};

export type SiteType =
  | "root"
  | "product"
  | "runtime"
  | "infrastructure"
  | "agent"
  | "archive"
  | "legal"
  | "support"
  | "developer"
  | "brand"
  | "billing"
  | "search"
  | "live";

export type SiteStatus = ProductStatus;

export type Site = {
  id: string;
  domain: string;
  url: string;
  title: string;
  type: SiteType;
  purpose: string;
  primaryCTA: string;
  audience: string;
  connectedProduct: string | null;
  connectedAgents: string[];
  status: SiteStatus;
  priority: number;
  routes: { path: string; label: string }[];
  notes: string;
};

