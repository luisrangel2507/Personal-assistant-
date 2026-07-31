# My Assistant

A personal assistant app for your agenda, shopping lists, and trip/packing lists — all in one place.

## Features

- **Agenda**: schedule events with a date, optional time, and notes; check them off as done.
- **Lists**: create as many named lists as you want (groceries, a trip's packing list, etc.), each with its own icon, checkable items, and optional quantities.
- Simple passcode gate for when it's deployed publicly.

## Stack

- Next.js 14 (App Router) + TypeScript
- Neon (PostgreSQL) for persistence
- Tailwind CSS
- lucide-react
- Deploy on Railway

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in the variables (see below).

3. Apply the database schema:

   ```bash
   npm run migrate
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

## Environment variables

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Neon (Postgres) connection string. Requires `sslmode=require`. |
| `APP_PASSCODE` | Simple access code. Leave empty to disable auth (local dev only). |

## Setting up Neon

1. Create a project at [neon.tech](https://neon.tech).
2. Copy the connection string (`DATABASE_URL`) from the dashboard.
3. Create the `events`, `lists`, and `list_items` tables by running `db/schema.sql` — either via `npm run migrate` (locally, or via `railway run npm run migrate` once deployed) or by pasting the contents of `db/schema.sql` into Neon's **SQL Editor**.

## Deploy on Railway

1. Create a new Railway project and connect it to this repository.
2. Railway auto-detects Next.js (Nixpacks) — no extra config needed.
3. Set `DATABASE_URL` and `APP_PASSCODE` in the service's variables.
4. After the first deploy, run the migration once:

   ```bash
   railway run npm run migrate
   ```

5. Done — the app is available at your Railway URL, protected by `APP_PASSCODE`.
