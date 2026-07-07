# MedInsight — Setup & Deployment Guide

This is the complete guide to get the MedInsight codebase running on your machine in VS Code, then
deployed live on Vercel. Follow it top to bottom the first time; skip around once you're set up.

**What you're working with:**
- `backend/` — Node + Express + TypeScript API, Postgres, JWT auth, Gemini-powered report analysis (free tier)
- `frontend/` — React 19 + TypeScript + Vite, Tailwind CSS v4, the full MedInsight UI

Two notes on scope, so nothing surprises you later:
- Google login and outbound emails (verification/reset links) are **stubbed**, not fully wired —
  see the "Extending this" section at the end for exactly what to add and where.
- Uploaded files are stored as raw bytes in Postgres, not in a separate storage bucket. This keeps
  the whole stack to two services (Vercel + one Postgres database) and is fine at the 10 MB/file
  limit already enforced in the code. If you outgrow it, see the note at the end.

---

## 1. Install prerequisites

You need these installed once on your machine:

1. **VS Code** — https://code.visualstudio.com
2. **Node.js 20 LTS** — https://nodejs.org (this also installs `npm`). Verify:
   ```
   node -v
   npm -v
   ```
3. **Git** — https://git-scm.com
4. **Postgres**, for local development. Easiest path is a free hosted database from
   **[Neon](https://neon.tech)** — sign up, click "Create a project," and copy the connection
   string it gives you. You can use this same Neon database for local dev *and* production, so
   you can skip installing Postgres locally entirely. (If you'd rather run Postgres locally, install
   [Postgres.app](https://postgresapp.com) on Mac or the official installer on Windows/Linux.)

---

## 2. Open the project in VS Code

1. Unzip the project folder you downloaded.
2. Open VS Code → File → Open Folder... → select the `medinsight` folder.
3. Open a terminal inside VS Code: Terminal → New Terminal. You'll run all commands below from here.
4. Recommended extensions (VS Code will likely prompt you): **ESLint**, **Tailwind CSS IntelliSense**,
   **Prisma** is not needed here (we use plain SQL), but **PostgreSQL** (by Chris Kolkman) is handy
   for browsing tables from inside VS Code.

---

## 3. Set up the database

1. Get a Postgres connection string (from Neon, or your local Postgres install).
2. In VS Code terminal:
   ```
   cd backend
   cp .env.example .env
   ```
3. Open the new `backend/.env` file and paste your connection string into `DATABASE_URL`.
4. Generate a JWT secret and paste it into `JWT_SECRET`:
   ```
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
5. Get a free Gemini API key from https://aistudio.google.com/apikey (sign in with any Google
   account, click "Create API key" — no credit card, no billing setup) and paste it into
   `GEMINI_API_KEY`.
6. Install backend dependencies and create the tables:
   ```
   npm install
   npm run db:init
   ```
   You should see `Applying schema.sql...` then `Done. Tables are ready.` This created the
   `profiles`, `reports`, `analysis_results`, `contact_messages`, and token tables — see
   `backend/schema.sql` if you want to read exactly what it created.

---

## 4. Run the backend locally

Still inside `backend/`:
```
npm run dev
```
You should see:
```
MedInsight API listening on http://localhost:4000
```
Leave this terminal running. Quick sanity check — open http://localhost:4000/api/health in a
browser; you should see `{"ok":true}`.

---

## 5. Run the frontend locally

Open a **second** terminal in VS Code (the `+` icon in the terminal panel), then:
```
cd frontend
cp .env.example .env
npm install
npm run dev
```
Vite will print a local URL, typically `http://localhost:5173`. Open it in your browser.

**How the two talk to each other:** `frontend/vite.config.ts` proxies any request to `/api/...`
straight through to `http://localhost:4000`, where your Express server is listening. You don't
need to hardcode a backend URL anywhere in the frontend code — this is also exactly how it will
work in production, once both are deployed as one Vercel project (Section 7).

Try it end to end: sign up for an account at `/signup`, then go to Upload and drop in a PDF or a
photo of any document — you should see it move through Uploading → Processing → Complete and land
on the Analysis page.

---

## 6. Project structure reference

```
medinsight/
├── vercel.json                # declares frontend/backend as Vercel Services + routing
├── backend/
│   ├── src/
│   │   ├── app.ts            # Express app (routes, CORS, error handling)
│   │   ├── index.ts          # server entry point (used locally AND by Vercel)
│   │   ├── db.ts             # Postgres connection pool
│   │   ├── middleware/auth.ts
│   │   ├── routes/           # auth, reports, profile, contact
│   │   ├── lib/analyze.ts    # the Gemini-powered analysis pipeline (free tier)
│   │   └── lib/tokens.ts     # JWT + random token helpers
│   ├── schema.sql            # run once to create all tables
│   └── .env                  # your local secrets (never commit this)
└── frontend/
    ├── src/
    │   ├── pages/             # one file per route
    │   ├── components/        # Navbar, Footer, AppShell (sidebar), SocialLinks, ui/
    │   ├── context/AuthContext.tsx
    │   └── lib/api.ts         # fetch wrapper, attaches your JWT to every request
    └── vite.config.ts
```

---

## 7. Deploying to Vercel

Vercel has a "Services" project type built for exactly this repo shape — a `frontend/` and a
`backend/` folder that deploy together under one domain. This project is already configured for
it via the root `vercel.json`, which declares both folders as services and routes `/api/*` to the
backend, everything else to the frontend.

### 7.1 Push to GitHub
```
cd medinsight
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/medinsight.git
git branch -M main
git push -u origin main
```

### 7.2 Import on Vercel
1. https://vercel.com → sign in → **Add New → Project** → import your `medinsight` repo.
2. Vercel detects the repo contains multiple services (from the root `vercel.json`) and shows
   both `frontend` (Vite) and `backend` (Express) automatically. If it prompts for a
   `vercel.json`, it's already in the repo — click **Refresh** so Vercel re-reads it.
3. Under **Environment Variables**, add:
   - `DATABASE_URL` — your Neon connection string
   - `JWT_SECRET` — same value as your local `.env`
   - `GEMINI_API_KEY` — your free Gemini key
   
   **Important:** for each variable, make sure the **Environments** dropdown is set to
   **Production and Preview** (or "All Environments"). "Development" only affects `vercel dev`
   running on your own machine — a variable scoped to Development only will be missing from the
   live site and cause it to fail exactly like a missing key would.
4. Click **Deploy**.

### 7.3 Your free domain
Vercel gives the project a free permanent HTTPS subdomain automatically, e.g.
`https://medinsight-yourname.vercel.app`. Nothing further to configure — this is the free "domain"
your portfolio site also uses.

### 7.4 After the first deploy
- Visit `https://your-project.vercel.app/api/health` — confirm you get `{"ok":true}`.
- Visit the site itself, sign up, and upload a test report to confirm the full pipeline works
  in production (upload → Gemini analysis → Postgres → analysis page).
- Every `git push` to `main` triggers a new deploy automatically.

---

## 8. Extending this project

**Google login.** Add [Auth.js](https://authjs.dev) or [Passport](https://www.passportjs.org)
to `backend/src/routes/auth.ts`, register an OAuth app in the
[Google Cloud Console](https://console.cloud.google.com/), and add a `/api/auth/google/callback`
route that issues the same JWT the email/password flow does — everything downstream (the
`requireAuth` middleware, the frontend `AuthContext`) already just expects a JWT and doesn't care
how it was issued.

**Real emails for verification/reset links.** Right now those links are only logged to the server
console (`backend/src/routes/auth.ts`). Sign up for [Resend](https://resend.com) (simplest API,
generous free tier) and replace the `console.log(...)` lines with a call to their send-email
endpoint using the same link format.

**Object storage instead of storing files in Postgres.** If you start handling many users or
larger files, swap `reports.file_data bytea` for a `storage_path text` column and use
[Vercel Blob](https://vercel.com/docs/storage/vercel-blob) or S3 — upload the file there instead
of into the database, and store just the path/URL. The rest of the analysis pipeline doesn't
change, since it already just needs the file bytes at analysis time.

**Dark mode.** The Settings page already has a theme switcher UI wired to local state — to make
it functional, add a `dark:` variant palette to `frontend/src/index.css`'s `@theme` block and
toggle a `dark` class on `<html>` from that switcher.
