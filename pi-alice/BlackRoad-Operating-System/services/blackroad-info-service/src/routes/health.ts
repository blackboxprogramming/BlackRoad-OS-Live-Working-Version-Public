import { Router } from "express";
import { SERVICE_ID } from "../constants";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ ok: true, service: SERVICE_ID });
});

export default router;
