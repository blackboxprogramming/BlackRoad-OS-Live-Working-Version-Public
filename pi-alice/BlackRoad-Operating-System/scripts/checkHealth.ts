import path from "path";
import fs from "fs";
import fetch from "node-fetch";
import { ServiceConfig } from "./types";

const servicesPath = path.join(__dirname, "..", "infra", "services.json");

function loadServices(): ServiceConfig[] {
  const raw = fs.readFileSync(servicesPath, "utf-8");
  return JSON.parse(raw) as ServiceConfig[];
}

async function checkService(service: ServiceConfig) {
  const url = `https://${service.domain}${service.healthPath}`;
  try {
    const res = await fetch(url, { method: "GET" });
    const statusText = res.statusText || "";
    console.log(
      `[OK]   ${service.id.padEnd(8)} ${res.status} ${statusText} - ${url}`
    );
  } catch (err) {
    console.log(
      `[FAIL] ${service.id.padEnd(8)} - ${(err as Error).message} - ${url}`
    );
  }
}

async function main() {
  const services = loadServices();
  console.log("\n🌡  Checking health of all services:\n");

  for (const svc of services) {
    await checkService(svc);
  }

  console.log("\nDone.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
