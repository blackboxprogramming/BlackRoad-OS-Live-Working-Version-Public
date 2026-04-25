import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import healthRouter from "./routes/health";
import infoRouter from "./routes/info";
import pkg from "../package.json";
import { OS_ROOT, SERVICE_BASE_URL, SERVICE_ID, SERVICE_NAME } from "./constants";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const logEntry = {
      ts: new Date().toISOString(),
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration_ms: duration,
      service_id: SERVICE_ID
    };
    console.log(JSON.stringify(logEntry));
  });
  next();
});

app.get("/version", (_req, res) => {
  res.json({ version: pkg.version });
});

app.get("/debug/env", (_req, res) => {
  const allowedEnv = ["NODE_ENV", "SERVICE_BASE_URL", "OS_ROOT", "PORT"];
  const safeEnv: Record<string, string | undefined> = {};
  allowedEnv.forEach((key) => {
    if (process.env[key]) {
      safeEnv[key] = process.env[key];
    }
  });
  safeEnv.SERVICE_BASE_URL = SERVICE_BASE_URL;
  safeEnv.OS_ROOT = OS_ROOT;
  res.json({ ok: true, env: safeEnv, service: SERVICE_ID });
});

app.use(healthRouter);
app.use(infoRouter);

// Error handling
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ ok: false, error: err.message, service: SERVICE_ID });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`${SERVICE_NAME} listening on port ${port}`);
  });
}

export default app;
