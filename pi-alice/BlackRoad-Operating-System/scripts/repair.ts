import fs from "fs/promises";
import path from "path";
import { spawn } from "child_process";
import fetch from "node-fetch";
import { ServiceConfig } from "./types";

type HealthStatus = {
  id: string;
  ok: boolean;
  status: number | string;
  latencyMs: number | null;
};

async function loadServices(): Promise<ServiceConfig[]> {
  const servicesPath = path.join(__dirname, "..", "infra", "services.json");
  const raw = await fs.readFile(servicesPath, "utf-8");
  return JSON.parse(raw) as ServiceConfig[];
}

async function runCommand(command: string, args: string[], label: string): Promise<void> {
  return new Promise((resolve) => {
    const proc = spawn(command, args, { stdio: "pipe" });
    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      if (stdout.trim()) {
        console.log(stdout.trim());
      }
      if (stderr.trim()) {
        console.error(stderr.trim());
      }

      if (code && code !== 0) {
        console.warn(`${label} exited with code ${code}`);
      }
      resolve();
    });
  });
}

async function checkHealth(service: ServiceConfig): Promise<HealthStatus> {
  const url = `https://${service.domain}${service.healthPath}`;
  const start = Date.now();

  try {
    const response = await fetch(url, { method: "GET" });
    return {
      id: service.id,
      ok: response.ok,
      status: response.status,
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      id: service.id,
      ok: false,
      status: (error as Error).message,
      latencyMs: null,
    };
  }
}

async function checkAllServices(services: ServiceConfig[]): Promise<HealthStatus[]> {
  const results: HealthStatus[] = [];
  for (const service of services) {
    const status = await checkHealth(service);
    results.push(status);
  }
  return results;
}

function printSummary(results: HealthStatus[], label: string): void {
  console.log(`\n${label}`);
  for (const result of results) {
    const latency = result.latencyMs !== null ? `${result.latencyMs}ms` : "--";
    const statusText = result.ok ? "OK" : "FAIL";
    console.log(`- ${result.id}: ${statusText} (${result.status}) latency=${latency}`);
  }
}

async function attemptRestarts(failing: HealthStatus[]): Promise<void> {
  if (failing.length === 0) {
    return;
  }

  console.log("\nAttempting restart…");
  for (const service of failing) {
    console.log(`Restarting ${service.id}...`);
    await runCommand("npm", ["run", "deploy:service", "--", service.id], `deploy:service ${service.id}`);
  }
}

async function main(): Promise<void> {
  try {
    const services = await loadServices();

    console.log("Running env:check...");
    await runCommand("npm", ["run", "env:check"], "env:check");

    console.log("\nRunning health:all...");
    await runCommand("npm", ["run", "health:all"], "health:all");

    const initialHealth = await checkAllServices(services);
    const failing = initialHealth.filter((result) => !result.ok);

    if (failing.length > 0) {
      await attemptRestarts(failing);
    }

    const finalHealth = await checkAllServices(services);
    printSummary(initialHealth, "Initial health");
    printSummary(finalHealth, "Final health");

    console.log("\nRepair routine complete.");
  } catch (error) {
    console.error("Repair routine encountered an error:", (error as Error).message);
  }
}

main();
