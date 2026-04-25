import fs from "fs/promises";
import path from "path";
import fetch from "node-fetch";
import { ServiceConfig } from "./types";

type HealthResult = {
  id: string;
  status: "OK" | "FAIL";
  url: string;
  httpStatus: number | string;
  latencyMs: number | null;
};

async function loadServices(): Promise<ServiceConfig[]> {
  const servicesPath = path.join(__dirname, "..", "infra", "services.json");
  const raw = await fs.readFile(servicesPath, "utf-8");
  return JSON.parse(raw) as ServiceConfig[];
}

async function checkService(service: ServiceConfig): Promise<HealthResult> {
  const url = `https://${service.domain}${service.healthPath}`;
  const start = Date.now();

  try {
    const response = await fetch(url, { method: "GET" });
    const latencyMs = Date.now() - start;
    const status: "OK" | "FAIL" = response.ok ? "OK" : "FAIL";

    return {
      id: service.id,
      status,
      url,
      httpStatus: response.status,
      latencyMs,
    };
  } catch (error) {
    return {
      id: service.id,
      status: "FAIL",
      url,
      httpStatus: (error as Error).message,
      latencyMs: null,
    };
  }
}

function printMatrix(results: HealthResult[]): void {
  console.log(
    `${"service".padEnd(10)} ${"status".padEnd(8)} ${"url".padEnd(30)} latency`
  );
  console.log(
    `${"-".repeat(10)} ${"-".repeat(8)} ${"-".repeat(30)} ${"-".repeat(7)}`
  );

  for (const result of results) {
    const latency = result.latencyMs !== null ? `${result.latencyMs}ms` : "--";
    const statusLabel = `${result.status} ${result.httpStatus}`.trim();

    console.log(
      `${result.id.padEnd(10)} ${statusLabel.padEnd(8)} ${result.url.padEnd(30)} ${latency}`
    );
  }
}

async function main(): Promise<void> {
  const services = await loadServices();
  const results = await Promise.all(services.map((service) => checkService(service)));
  printMatrix(results);
}

main().catch((error) => {
  console.error("Failed to build health matrix:", (error as Error).message);
});
