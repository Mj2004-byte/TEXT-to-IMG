import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });
import express from "express";
import cors from "cors";
import generationsRouter from "./routes/generations.js";
import { connectDb } from "./db.js";

const app = express();

const PORT = Number(process.env.PORT || 5174);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const CLIENT_ORIGINS = CLIENT_ORIGIN.split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // allow non-browser tools (no Origin header)
      if (!origin) return callback(null, true);

      // allow configured origins
      if (CLIENT_ORIGINS.includes(origin)) return callback(null, true);

      // allow any localhost port in dev
      if (process.env.NODE_ENV !== "production") {
        try {
          const url = new URL(origin);
          if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
            return callback(null, true);
          }
        } catch {
          // ignore
        }
      }

      return callback(new Error("Not allowed by CORS"));
    }
  })
);
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api", generationsRouter);

app.use((err, _req, res, _next) => {
  const status = err?.statusCode || err?.status || 500;
  const message = err?.message || "Server error";
  res.status(status).json({ error: message });
});

try {
  await connectDb(process.env.MONGODB_URI);
} catch (err) {
  console.warn(
    "MongoDB not connected. History will be disabled until MONGODB_URI works.",
    err?.message || err
  );
}
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

