import fs from "fs/promises";
import path from "path";

type EnvSpec = Record<string, Record<string, string>>;

async function loadEnvSpec(): Promise<EnvSpec> {
  const specPath = path.join(__dirname, "..", "infra", "env-spec.json");
  const raw = await fs.readFile(specPath, "utf-8");
  return JSON.parse(raw) as EnvSpec;
}

function printServiceRequirements(service: string, variables: string[], missing: string[]): void {
  console.log(`\nService: ${service}`);
  console.log(`  Required variables: ${variables.join(", ") || "(none)"}`);

  if (missing.length > 0) {
    console.warn(`  ⚠️  Missing in environment (Railway likely missing): ${missing.join(", ")}`);
  } else {
    console.log("  ✅ All variables present in current environment");
  }
}

async function main(): Promise<void> {
  try {
    const spec = await loadEnvSpec();
    console.log("🔍 Checking environment requirements by service...");

    for (const [service, vars] of Object.entries(spec)) {
      const requiredVars = Object.keys(vars);
      const missing = requiredVars.filter((name) => process.env[name] === undefined);
      printServiceRequirements(service, requiredVars, missing);
    }

    console.log("\nDone.");
  } catch (error) {
    console.error("Failed to check environment variables:", (error as Error).message);
  }
}

main();
