import "dotenv/config";
import fs from "fs";
import path from "path";
import { pool } from "../db";

async function main() {
  const sql = fs.readFileSync(path.join(__dirname, "..", "..", "schema.sql"), "utf-8");
  console.log("Applying schema.sql...");
  await pool.query(sql);
  console.log("Done. Tables are ready.");
  await pool.end();
}

main().catch((err) => {
  console.error("Failed to initialize database:", err);
  process.exit(1);
});
