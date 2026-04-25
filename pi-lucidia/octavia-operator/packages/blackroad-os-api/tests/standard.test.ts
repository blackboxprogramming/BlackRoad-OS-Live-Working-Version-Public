import request from "supertest";
import { createApp } from "../src/server";

describe("Standard BlackRoad OS Endpoints", () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    app = createApp();
  });

  describe("GET /health", () => {
    it("returns ok with service name and timestamp", async () => {
      const res = await request(app).get("/health").expect(200);

      expect(res.body.ok).toBe(true);
      expect(res.body.service).toBe("blackroad-os-api");
      expect(res.body.timestamp).toBeDefined();
      expect(typeof res.body.timestamp).toBe("string");
    });

    it("returns a valid ISO-8601 timestamp", async () => {
      const res = await request(app).get("/health").expect(200);

      const timestamp = new Date(res.body.timestamp);
      expect(timestamp.toISOString()).toBe(res.body.timestamp);
    });
  });

  describe("GET /ready", () => {
    it("returns ready status with service name", async () => {
      const res = await request(app).get("/ready").expect(200);

      expect(res.body.ready).toBeDefined();
      expect(typeof res.body.ready).toBe("boolean");
      expect(res.body.service).toBe("blackroad-os-api");
    });

    it("returns ready: true when service is configured", async () => {
      const res = await request(app).get("/ready").expect(200);

      // In test environment with valid config, should be ready
      expect(res.body.ready).toBe(true);
    });
  });

  describe("GET /version", () => {
    it("returns version info with all required fields", async () => {
      const res = await request(app).get("/version").expect(200);

      expect(res.body.service).toBe("blackroad-os-api");
      expect(res.body.version).toBeDefined();
      expect(res.body.commit).toBeDefined();
      expect(res.body.env).toBeDefined();
    });

    it("returns safe defaults when env vars are missing", async () => {
      const res = await request(app).get("/version").expect(200);

      // Should not crash and should have fallback values
      expect(res.body.commit).toBeTruthy();
      expect(res.body.env).toBeTruthy();
      expect(res.body.version).toBeTruthy();
    });

    it("uses env vars when available", async () => {
      const oldVersion = process.env.BR_OS_API_VERSION;
      const oldCommit = process.env.BR_OS_API_COMMIT;
      const oldEnv = process.env.BR_OS_ENV;

      try {
        process.env.BR_OS_API_VERSION = "1.2.3";
        process.env.BR_OS_API_COMMIT = "abc123";
        process.env.BR_OS_ENV = "test";

        const res = await request(app).get("/version").expect(200);

        expect(res.body.version).toBe("1.2.3");
        expect(res.body.commit).toBe("abc123");
        expect(res.body.env).toBe("test");
      } finally {
        // Restore env vars
        if (oldVersion !== undefined) process.env.BR_OS_API_VERSION = oldVersion;
        else delete process.env.BR_OS_API_VERSION;
        if (oldCommit !== undefined) process.env.BR_OS_API_COMMIT = oldCommit;
        else delete process.env.BR_OS_API_COMMIT;
        if (oldEnv !== undefined) process.env.BR_OS_ENV = oldEnv;
        else delete process.env.BR_OS_ENV;
      }
    });
  });
});
