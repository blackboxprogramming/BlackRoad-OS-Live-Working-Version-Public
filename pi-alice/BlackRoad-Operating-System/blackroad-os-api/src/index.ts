import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;
const SERVICE_NAME = "blackroad-os-api";

app.get("/", (_req, res) => {
  res.json({
    service: SERVICE_NAME,
    status: "ok",
    message: "BlackRoad OS API Gateway root"
  });
});

app.get("/health", (_req, res) => {
  res.json({
    service: SERVICE_NAME,
    status: "ok"
  });
});

// later this will proxy to core/agents/operator, for now it's just a shell

app.listen(PORT, () => {
  console.log(`✅ ${SERVICE_NAME} listening on port ${PORT}`);
});
