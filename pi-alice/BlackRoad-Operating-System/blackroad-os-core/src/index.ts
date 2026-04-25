import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;
const SERVICE_NAME = "blackroad-os-core";

app.get("/", (_req, res) => {
  res.json({
    service: SERVICE_NAME,
    status: "ok",
    message: "BlackRoad OS Core root"
  });
});

app.get("/health", (_req, res) => {
  res.json({
    service: SERVICE_NAME,
    status: "ok"
  });
});

app.listen(PORT, () => {
  console.log(`✅ ${SERVICE_NAME} listening on port ${PORT}`);
});
