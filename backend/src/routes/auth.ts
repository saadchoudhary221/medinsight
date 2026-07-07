import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { pool } from "../db";
import { signAuthToken, generateRandomToken } from "../lib/tokens";
import { requireAuth, AuthedRequest } from "../middleware/auth";

const router = Router();

const signupSchema = z.object({
  fullName: z.string().min(1, "Name is required."),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

router.post("/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }
  const { fullName, email, password } = parsed.data;

  const existing = await pool.query("select id from profiles where email = $1", [email.toLowerCase()]);
  if (existing.rows.length > 0) {
    return res.status(409).json({ error: "An account with this email already exists." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    `insert into profiles (full_name, email, password_hash) values ($1, $2, $3)
     returning id, full_name, email, avatar_url, created_at`,
    [fullName, email.toLowerCase(), passwordHash]
  );
  const user = rows[0];

  // Email verification token. In this scaffold we log the link instead of
  // sending a real email — see the setup guide for wiring up Resend/SendGrid.
  const token = generateRandomToken();
  await pool.query(
    `insert into email_verifications (user_id, token, expires_at) values ($1, $2, now() + interval '24 hours')`,
    [user.id, token]
  );
  console.log(`[dev] Email verification link for ${user.email}: /verify-email?token=${token}`);

  const authToken = signAuthToken({ userId: user.id, email: user.email });
  res.status(201).json({ token: authToken, user });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Enter a valid email and password." });
  }
  const { email, password } = parsed.data;

  const { rows } = await pool.query(
    "select id, full_name, email, avatar_url, password_hash, created_at from profiles where email = $1",
    [email.toLowerCase()]
  );
  const user = rows[0];
  if (!user) {
    return res.status(401).json({ error: "Incorrect email or password." });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: "Incorrect email or password." });
  }

  const token = signAuthToken({ userId: user.id, email: user.email });
  delete user.password_hash;
  res.json({ token, user });
});

router.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const { rows } = await pool.query(
    "select id, full_name, email, avatar_url, email_verified, created_at from profiles where id = $1",
    [req.userId]
  );
  if (!rows[0]) return res.status(404).json({ error: "User not found." });
  res.json({ user: rows[0] });
});

router.post("/verify-email", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Missing token." });

  const { rows } = await pool.query(
    "select * from email_verifications where token = $1 and used = false and expires_at > now()",
    [token]
  );
  const record = rows[0];
  if (!record) return res.status(400).json({ error: "This verification link is invalid or has expired." });

  await pool.query("update profiles set email_verified = true where id = $1", [record.user_id]);
  await pool.query("update email_verifications set used = true where id = $1", [record.id]);
  res.json({ ok: true });
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required." });

  const { rows } = await pool.query("select id, email from profiles where email = $1", [email.toLowerCase()]);
  const user = rows[0];

  // Always respond the same way whether or not the account exists, so the
  // endpoint can't be used to test which emails are registered.
  if (user) {
    const token = generateRandomToken();
    await pool.query(
      `insert into password_resets (user_id, token, expires_at) values ($1, $2, now() + interval '1 hour')`,
      [user.id, token]
    );
    console.log(`[dev] Password reset link for ${user.email}: /reset-password?token=${token}`);
  }
  res.json({ ok: true, message: "If that email is registered, a reset link has been sent." });
});

router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password || password.length < 8) {
    return res.status(400).json({ error: "A valid token and a password of at least 8 characters are required." });
  }

  const { rows } = await pool.query(
    "select * from password_resets where token = $1 and used = false and expires_at > now()",
    [token]
  );
  const record = rows[0];
  if (!record) return res.status(400).json({ error: "This reset link is invalid or has expired." });

  const passwordHash = await bcrypt.hash(password, 10);
  await pool.query("update profiles set password_hash = $1 where id = $2", [passwordHash, record.user_id]);
  await pool.query("update password_resets set used = true where id = $1", [record.id]);
  res.json({ ok: true });
});

export default router;
