import { Router } from "express";
import { getConfig } from "../config";
import packageJson from "../../package.json";

/**
 * Standard endpoints required by BlackRoad OS service conventions.
 * These are lightweight, predictable endpoints for infrastructure.
 */
export function createStandardRouter() {
  const router = Router();

  /**
   * GET /health
   * Lightweight liveness check - returns 200 if the service is running.
   * Should not depend on external services or heavy operations.
   */
  router.get("/health", (_req, res) => {
    res.json({
      ok: true,
      service: "blackroad-os-api",
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * GET /ready
   * Readiness check - indicates if the service is ready to handle traffic.
   * Can be extended later to check dependencies (DB, other services, etc.)
   */
  router.get("/ready", (_req, res) => {
    const config = getConfig();
    
    // For now, just check that we have basic config loaded
    const ready = !!config.PORT && !!config.NODE_ENV;

    res.json({
      ready,
      service: "blackroad-os-api",
    });
  });

  /**
   * GET /version
   * Returns version info about the running service.
   * Uses environment variables with safe fallbacks.
   */
  router.get("/version", (_req, res) => {
    const config = getConfig();

    res.json({
      service: "blackroad-os-api",
      version: process.env.BR_OS_API_VERSION || packageJson.version || "0.0.1",
      commit: process.env.BR_OS_API_COMMIT || "UNKNOWN",
      env: process.env.BR_OS_ENV || config.NODE_ENV || "local",
    });
  });

  return router;
}
