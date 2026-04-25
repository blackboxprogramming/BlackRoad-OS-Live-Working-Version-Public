import fs from 'fs';
import path from 'path';
import { setTimeout as delay } from 'timers/promises';

type ServiceEntry = {
  key: string;
  name: string;
  repoUrl: string;
  railwayUrl?: string | null;
  cloudflareSubdomain?: string | null;
  healthPath?: string;
};

type OsSpec = {
  version: string;
  services: ServiceEntry[];
};

const SPEC_PATH = path.resolve(__dirname, '..', 'os-spec', 'os-spec.json');
const DEFAULT_TIMEOUT_MS = 8000;

function loadSpec(): OsSpec {
  const raw = fs.readFileSync(SPEC_PATH, 'utf-8');
  return JSON.parse(raw) as OsSpec;
}

function buildHealthUrl(service: ServiceEntry): string | null {
  const base = service.cloudflareSubdomain ?? service.railwayUrl;
  if (!base) return null;
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const pathPart = service.healthPath ?? '/health';
  return `${normalizedBase}${pathPart.startsWith('/') ? '' : '/'}${pathPart}`;
}

async function checkHealth(url: string): Promise<{ status: string; detail: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    const bodyText = await response.text();
    const statusLabel = response.ok ? 'healthy' : 'unhealthy';
    return { status: statusLabel, detail: `${response.status} ${response.statusText}` };
  } catch (error) {
    const reason = (error as Error).message;
    return { status: 'unreachable', detail: reason };
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  const spec = loadSpec();
  const results: Array<{ service: string; target: string; status: string; detail: string }> = [];

  for (const service of spec.services) {
    const url = buildHealthUrl(service);
    if (!url) {
      results.push({ service: service.key, target: 'N/A', status: 'skipped', detail: 'No target URL defined' });
      continue;
    }

    const { status, detail } = await checkHealth(url);
    results.push({ service: service.key, target: url, status, detail });
    await delay(50); // small pause to avoid overwhelming endpoints
  }

  console.table(results);

  const failures = results.filter((row) => row.status !== 'healthy' && row.status !== 'skipped');
  if (failures.length > 0) {
    console.error(`\nHealth check completed with ${failures.length} issue(s).`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('Unexpected error while running health checks', error);
  process.exitCode = 1;
});
