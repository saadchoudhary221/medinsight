import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import reportRoutes from "./routes/reports";
import profileRoutes from "./routes/profile";
import contactRoutes from "./routes/contact";

export const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:5173").split(",");

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/contact", contactRoutes);

// Central error handler — keeps stack traces and internals out of responses.
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(err?.status ?? 500).json({ error: "Something went wrong. Please try again." });
});
