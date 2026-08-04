# Broker CRM

A real estate lead pipeline built to feel like a habit, not a chore. Today's follow-ups show up
as a checklist with a progress ring, every lead is forced to have a next action and a follow-up
date, and daily/site-visit reports build themselves from what you log.

This guide takes you from zero to a live app on your phone's home screen. No coding experience
needed beyond copy-paste — just follow the steps in order.

---

## What you're building

- **Frontend**: React app, hosted free on **GitHub Pages**
- **Backend**: **Supabase** (free tier) — database, login, and security rules
- **Result**: A URL like `https://yourusername.github.io/broker-crm/` that you add to your
  phone's home screen and it behaves like a real app (full screen, no browser bar, works offline
  once loaded).

---

## Part 1 — Create your Supabase project (5 minutes)

1. Go to [supabase.com](https://supabase.com) and sign up (free — GitHub login is fastest).
2. Click **New Project**.
   - Name: `broker-crm` (anything you like)
   - Database password: generate one and **save it somewhere** — you likely won't need it again,
     but keep it safe.
   - Region: pick the one closest to India (e.g. Singapore).
3. Wait ~2 minutes while Supabase sets up your project.

### Load the database structure

4. In the left sidebar, click **SQL Editor**.
5. Click **New query**.
6. Open the file `supabase/schema.sql` from this project, copy **everything** in it, and paste it
   into the SQL editor.
7. Click **Run** (bottom right). You should see "Success. No rows returned."

This created three tables — `profiles`, `leads`, `activities` — and locked them down so agents
can only see their own leads (admins see everyone's).

### Turn off email confirmation (so new agents can log in immediately)

8. Left sidebar → **Authentication** → **Providers** → click **Email**.
9. Turn **off** "Confirm email". Save.
   - (You can turn this back on later if you want extra security — it just means new agents
     have to click a link in their inbox before their first login.)

### Get your API keys

10. Left sidebar → **Project Settings** (gear icon) → **API**.
11. Copy two values, you'll need them twice (once for local testing, once for GitHub):
    - **Project URL** (looks like `https://xxxxx.supabase.co`)
    - **anon public** key (a long string)

Keep this tab open — you'll come back for these.

---

## Part 2 — Put the code on GitHub

1. Go to [github.com](https://github.com) and create a **new repository** called `broker-crm`.
   - Keep it **Public** (GitHub Pages free hosting requires this, unless you're on a paid plan).
   - Don't initialize with a README (you already have one).
2. On your computer, open a terminal in this project folder and run:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/broker-crm.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your actual GitHub username.

### Add your Supabase keys as GitHub Secrets (so the live site can connect)

3. On GitHub, open your `broker-crm` repo → **Settings** → **Secrets and variables** → **Actions**.
4. Click **New repository secret** and add:
   - Name: `VITE_SUPABASE_URL` → Value: (the Project URL you copied)
   - Click **New repository secret** again:
   - Name: `VITE_SUPABASE_ANON_KEY` → Value: (the anon public key you copied)

### Turn on GitHub Pages

5. Repo → **Settings** → **Pages**.
6. Under "Build and deployment" → Source, choose **GitHub Actions**.

### Fix the base path (one line, important)

7. Open `vite.config.js` in this project and confirm this line matches your repo name exactly:

```js
base: '/broker-crm/',
```

If you named your GitHub repo something other than `broker-crm`, change this line to
`/your-repo-name/` (and also update `start_url` and `scope` a few lines below it to match).
Commit and push the change if you edit it.

8. Push your code again if you changed anything:

```bash
git add .
git commit -m "Set base path"
git push
```

9. Go to the **Actions** tab in your GitHub repo — you'll see a workflow running. Wait for the
   green checkmark (~1-2 minutes).
10. Go back to **Settings → Pages** — your live URL will be shown at the top, something like:

```
https://yourusername.github.io/broker-crm/
```

That's your live app. Every time you `git push` to `main`, it rebuilds and redeploys automatically.

---

## Part 3 — Create your account and make yourself admin

1. Open your live URL, tap **New agent? Create an account**, sign up with your email.
2. You're in! You'll land on **Today's Work** — empty for now.
3. To make yourself an **admin** (so you can eventually see every agent's leads, not just your
   own — useful once you add teammates):
   - Go back to Supabase → **Table Editor** → `profiles` table.
   - Find your row, click into the `role` cell, change `agent` to `admin`, hit enter.
4. Add a few leads (or use **Bulk Upload** from the Leads tab) and try the whole flow: log a call,
   set a follow-up, watch it show up on Today's Work tomorrow.

---

## Part 4 — Add it to your phone's home screen (feels like a real app)

**iPhone (Safari):**
Open the live URL in Safari → tap the Share icon → **Add to Home Screen** → Add.

**Android (Chrome):**
Open the live URL in Chrome → tap the three-dot menu → **Add to Home screen** (or Chrome may
prompt you automatically) → Add.

**Desktop (Windows/Mac, Chrome or Edge):**
Open the live URL → click the install icon in the address bar (or menu → **Install Broker CRM**) →
this creates a desktop shortcut that opens in its own window, no browser bar.

---

## Adding your team

Each agent just signs up for their own account from the login screen — no invite system needed.
By default every new signup is an `agent`, meaning they only see leads assigned to them. Promote
anyone to `admin` the same way you did for yourself in Part 3 (Supabase Table Editor → `profiles`
→ change `role`).

Assigning a lead to a specific agent (instead of yourself) currently requires updating the
`assigned_to` column directly in Supabase Table Editor — pick that agent's `id` from the `profiles`
table and paste it into the lead's `assigned_to` field. If your team grows past a couple of people,
the next thing worth adding is an in-app "assign to" dropdown for admins — happy to build that
when you're ready.

---

## Local development (optional, if you want to test changes before pushing)

```bash
npm install
cp .env.example .env
# paste your Supabase URL and anon key into .env
npm run dev
```

Opens at `http://localhost:5173`.

---

## How the "no skipped follow-ups" rule works

Every time you log a call, the app requires a **next action** and a **follow-up date** — unless
you're marking the lead **Won** or **Lost** (those are end states, nothing to follow up on). This
is enforced in the app, not just a guideline, so leads can't silently go cold.

## How Today's Work decides what to show

Any lead whose `next_followup_date` is today or earlier (and isn't Won/Lost) shows up on Today's
Work, oldest first. Logging a call clears it from the list and adds to your ring. Clear the list
for the day and, if you did the same yesterday, your streak grows.

## How reports are calculated

- **Daily Report** reads every call you logged on the selected date: total calls, answered
  (Interested + Not Interested — i.e. the phone was actually picked up), and how many leads moved
  into each pipeline stage that day.
- **SV Report** counts a site visit as "scheduled" on the date you set as its follow-up date when
  you moved a lead to **SV Scheduled**, and as "done" on the date you logged **SV Done** — giving
  you a real week/month calendar of what's planned vs. what actually happened.

---

## Project structure

```
src/
  components/   Reusable UI (cards, sheets, nav, icons)
  lib/           Supabase client, constants, helpers, auth context
  pages/         One file per screen
supabase/
  schema.sql     Run this once in Supabase SQL Editor
.github/workflows/deploy.yml   Auto-builds and deploys on every push
```
