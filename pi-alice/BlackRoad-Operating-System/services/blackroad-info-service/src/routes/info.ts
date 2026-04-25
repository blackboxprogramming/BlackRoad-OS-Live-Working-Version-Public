import { Router } from "express";
import { SERVICE_ID, SERVICE_NAME } from "../constants";
import pkg from "../../package.json";

const router = Router();

router.get("/info", (_req, res) => {
  res.json({
    name: SERVICE_NAME,
    id: SERVICE_ID,
    version: pkg.version,
    time: new Date().toISOString()
  });
});

export default router;
