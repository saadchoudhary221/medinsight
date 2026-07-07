import { Router } from "express";
import { z } from "zod";
import { pool } from "../db";

const router = Router();

const contactSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Enter a valid email address."),
  message: z.string().min(1, "Message can't be empty."),
});

router.post("/", async (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }
  const { name, email, message } = parsed.data;
  await pool.query("insert into contact_messages (name, email, message) values ($1, $2, $3)", [name, email, message]);
  res.status(201).json({ ok: true });
});

export default router;
