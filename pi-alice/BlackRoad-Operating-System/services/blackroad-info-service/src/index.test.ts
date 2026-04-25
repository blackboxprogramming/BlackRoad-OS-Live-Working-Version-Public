import request from "supertest";
import app from "./index";
import { SERVICE_ID, SERVICE_NAME } from "./constants";
import pkg from "../package.json";

describe("BlackRoad Info Service", () => {
  it("returns health", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, service: SERVICE_ID });
  });

  it("returns info", async () => {
    const res = await request(app).get("/info");
    expect(res.status).toBe(200);
    expect(res.body.name).toBe(SERVICE_NAME);
    expect(res.body.id).toBe(SERVICE_ID);
    expect(res.body.version).toBe(pkg.version);
    expect(typeof res.body.time).toBe("string");
  });
});
