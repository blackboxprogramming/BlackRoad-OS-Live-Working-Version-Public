export interface ServiceConfig {
  id: string;
  name: string;
  repo: string;
  kind: "backend" | "frontend" | "worker";
  railwayProject: string;
  railwayService: string;
  domain: string;
  healthPath: string;
}
