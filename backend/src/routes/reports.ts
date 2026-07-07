import { Router } from "express";
import multer from "multer";
import { pool } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { processReport } from "../lib/analyze";

const router = Router();

const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(new Error("INVALID_TYPE"));
    }
    cb(null, true);
  },
});

router.use(requireAuth);

router.post("/upload", (req: AuthedRequest, res) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      if (err.message === "INVALID_TYPE") {
        return res.status(400).json({ error: "Only PDF, PNG, and JPG files are supported." });
      }
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "File is too large. Maximum size is 10 MB." });
      }
      return res.status(400).json({ error: "Upload failed." });
    }
    if (!req.file) return res.status(400).json({ error: "No file was provided." });

    const { rows } = await pool.query(
      `insert into reports (user_id, file_name, mime_type, size_bytes, file_data, status)
       values ($1, $2, $3, $4, $5, 'processing')
       returning id, file_name, mime_type, size_bytes, status, upload_date`,
      [req.userId, req.file.originalname, req.file.mimetype, req.file.size, req.file.buffer]
    );
    const report = rows[0];

    // Fire and forget — the client polls status via GET /reports/:id
    processReport(report.id);

    res.status(201).json({ report });
  });
});

router.get("/", async (req: AuthedRequest, res) => {
  const { rows } = await pool.query(
    `select id, file_name, mime_type, size_bytes, status, upload_date
     from reports where user_id = $1 order by upload_date desc`,
    [req.userId]
  );
  res.json({ reports: rows });
});

router.get("/stats", async (req: AuthedRequest, res) => {
  const { rows } = await pool.query(
    `select
       count(*)::int as total_reports,
       count(*) filter (where status = 'completed')::int as completed_analyses,
       count(*) filter (where upload_date > date_trunc('month', now()))::int as uploads_this_month
     from reports where user_id = $1`,
    [req.userId]
  );
  res.json({ stats: rows[0] });
});

router.get("/:id", async (req: AuthedRequest, res) => {
  const { rows } = await pool.query(
    `select id, file_name, mime_type, size_bytes, status, upload_date
     from reports where id = $1 and user_id = $2`,
    [req.params.id, req.userId]
  );
  if (!rows[0]) return res.status(404).json({ error: "Report not found." });

  const analysis = await pool.query("select * from analysis_results where report_id = $1", [req.params.id]);
  res.json({ report: rows[0], analysis: analysis.rows[0] ?? null });
});

router.delete("/:id", async (req: AuthedRequest, res) => {
  const { rows } = await pool.query(
    "delete from reports where id = $1 and user_id = $2 returning id",
    [req.params.id, req.userId]
  );
  if (!rows[0]) return res.status(404).json({ error: "Report not found." });
  res.json({ ok: true });
});

export default router;
