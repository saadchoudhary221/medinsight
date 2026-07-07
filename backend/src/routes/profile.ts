import { Router } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

router.patch("/", async (req: AuthedRequest, res) => {
  const { fullName, avatarUrl, currentPassword, newPassword } = req.body;

  if (newPassword) {
    if (!currentPassword) {
      return res.status(400).json({ error: "Current password is required to set a new password." });
    }
    const { rows } = await pool.query("select password_hash from profiles where id = $1", [req.userId]);
    const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: "Current password is incorrect." });
    if (newPassword.length < 8) return res.status(400).json({ error: "New password must be at least 8 characters." });
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query("update profiles set password_hash = $1 where id = $2", [hash, req.userId]);
  }

  const { rows } = await pool.query(
    `update profiles set
       full_name = coalesce($1, full_name),
       avatar_url = coalesce($2, avatar_url)
     where id = $3
     returning id, full_name, email, avatar_url, created_at`,
    [fullName ?? null, avatarUrl ?? null, req.userId]
  );

  res.json({ user: rows[0] });
});

export default router;
