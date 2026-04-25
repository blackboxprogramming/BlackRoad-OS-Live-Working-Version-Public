export type ServiceKind = "backend" | "frontend";

export interface OsService {
  id: string;
  name: string;
  kind: ServiceKind;
  repo: string;
  healthUrl: string;
}

export type OsServiceCatalog = OsService[];
