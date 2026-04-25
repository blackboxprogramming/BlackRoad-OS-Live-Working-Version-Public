import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { deployServiceById } from "./deployService.js";
import { ServiceConfig } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..", "");
const servicesPath = path.join(rootDir, "infra", "services.json");

async function loadServices(): Promise<ServiceConfig[]> {
  const data = await fs.readFile(servicesPath, "utf-8");
  return JSON.parse(data) as ServiceConfig[];
}

async function main(): Promise<void> {
  const desiredOrder = ["core", "api", "operator", "agents", "console", "web", "docs"];
  const services = await loadServices();
  const servicesById = new Map(services.map((service) => [service.id, service] as const));

  for (const id of desiredOrder) {
    const service = servicesById.get(id);
    if (!service) {
      console.warn(`Skipping ${id} because it is not defined in infra/services.json`);
      continue;
    }
    await deployServiceById(service.id);
  }
}

main();
