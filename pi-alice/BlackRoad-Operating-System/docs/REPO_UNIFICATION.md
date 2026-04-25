# Repository Unification Standard

All BlackRoad OS services follow the same surface area so automation, monitoring, and deployment can treat them consistently. This document is the authoritative guide for new and existing satellite repositories.

## Required HTTP routes

- `GET /health` – Returns a JSON payload with service status, dependency checks, and timestamp.
- `GET /version` – Returns service name, semantic version, git commit, and build timestamp.

## Configuration loader pattern

Every service should expose a single configuration entry point that:

1. Reads environment variables once at boot.
2. Validates required keys with defaults for optional settings.
3. Exports a typed object consumed across the codebase.

Recommended pattern (TypeScript/Python pseudocode):

```ts
// config.ts
export interface ServiceConfig {
  env: 'production' | 'staging' | 'development';
  port: number;
  railwayStaticUrl?: string;
  cloudflareUrl?: string;
}

export function loadConfig(): ServiceConfig {
  const env = process.env.NODE_ENV ?? 'development';
  const port = Number(process.env.PORT ?? '8000');

  return {
    env: env as ServiceConfig['env'],
    port,
    railwayStaticUrl: process.env.RAILWAY_STATIC_URL,
    cloudflareUrl: process.env.CLOUDFLARE_URL,
  };
}
```

Services in other languages should mirror this approach: centralize parsing, validate eagerly, and share a typed structure.

## `railway.json` fields

Every deployable repo should ship a `railway.json` (or equivalent environment manifest) containing at minimum:

- `projectId`: Railway project identifier.
- `serviceId`: Specific service identifier within the project.
- `env`: Deployment environment (`production`, `staging`, or `development`).
- `healthcheckPath`: Path used by Railway health probes (must match `/health`).
- `staticUrl`: The generated `RAILWAY_STATIC_URL` for reference in automation.

## Minimal `package.json` scripts

For JavaScript/TypeScript services, include these scripts even if they wrap simple commands:

- `dev`: Local development entry point (e.g., `next dev`, `nodemon src/index.ts`).
- `build`: Compile or bundle step.
- `start`: Production start command using the build output.
- `lint`: Static analysis or formatting checks.
- `test`: Unit or integration tests; may temporarily be a placeholder until coverage improves.

Consistency across repositories allows shared CI workflows and the global health dashboard to operate without per-repo customization.
