# Irin & Kaviya — Studio CRM (private)

A lightweight private CRM for the two-person studio: leads, pipeline, follow-ups, deals, clients,
projects, 30 / 30 / 40 payments, earnings, tasks and communication timelines.

**Access is limited to `imirinnnb@gmail.com`** (the `ADMIN_EMAILS` setting). There is no public
sign-up. This project is fully independent of the public website (`ik-studio-website`).

```
ik-studio-crm/
├── frontend/   React 19 + Vite + Tailwind CSS 3.4 — the CRM app
│   └── src/    api/ config/ context/ components/ lib/ pages/ shared/ styles/
└── backend/    Node.js + Express 5 + MongoDB (Mongoose 8)
    ├── src/crm/schema.js        CRM entities (fields, options, indexes) — validation + models
    ├── src/routes/auth.js       login, session, change password, sign out everywhere
    ├── src/routes/crm.js        CRUD for every CRM collection + lead/deal → client conversion
    ├── src/routes/intake.js     key-protected intake for enquiries from the website
    ├── src/middleware/          requireAdmin: JWT + email allow-list on every private route
    ├── scripts/create-admin.js  create or reset the admin account
    └── test/
```

## Features

- **Dashboard**: total/active leads, open & won deals, active clients, projects in progress and
  completed, total revenue, pending payments, this month's revenue; follow-up alerts (overdue /
  today / next 7 days); lead conversion, average deal value, top lead sources, upcoming deadlines.
- **Leads**: table and Kanban pipeline (New → Contacted → Interested → Discussion → Proposal Sent →
  Negotiation → Won → Project Started → Completed, plus Lost with a reason), archive, filters,
  search, CSV export.
- **Follow-ups**: mark done with an outcome and schedule the next one; everything is logged.
- **Deals** board, **Clients**, **Projects** board (Planning → … → Completed).
- **Convert to client**: a won lead or deal becomes a client + project + 30/30/40 payment plan.
- **Payments**: record each stage; totals and remaining amounts are calculated automatically.
- **Earnings**: revenue by month, package and project type; received vs pending; won vs lost;
  leads by source.
- **Tasks** board, **Activity** timeline, global search, CSV export of every collection.
- Website enquiries arrive automatically as New leads (when the website backend is connected).

## Run locally

```bash
# API
cd backend
cp .env.example .env        # MONGODB_URI, JWT_SECRET, ADMIN_EMAILS, CORS_ORIGINS, INTAKE_KEY
npm install
ADMIN_NAME=Irin ADMIN_EMAIL=imirinnnb@gmail.com ADMIN_PASSWORD='choose-a-strong-one-1' npm run create-admin
npm run dev                 # http://localhost:5000/api/health
npm test

# CRM app
cd ../frontend
cp .env.example .env        # VITE_API_URL=http://localhost:5000
npm install
npm run dev                 # http://localhost:5174
```

No MongoDB yet? `CRM_STORE=memory npm run dev` uses an in-memory store (data is lost on restart,
refused in production); with `ADMIN_EMAIL`/`ADMIN_PASSWORD` in `.env` it also creates a temporary
admin so you can try it.

## Environment variables

| Where | Variable | Purpose |
| --- | --- | --- |
| backend | `MONGODB_URI` | MongoDB for CRM data |
| backend | `JWT_SECRET` | ≥ 32 random characters; signs sessions |
| backend | `JWT_EXPIRES_IN` | Session length (default `8h`) |
| backend | `ADMIN_EMAILS` | Only these emails may sign in — `imirinnnb@gmail.com` |
| backend | `CORS_ORIGINS` | The CRM app's address |
| backend | `INTAKE_KEY` | Optional shared secret for website enquiries (same as the website's `CRM_INTAKE_KEY`) |
| backend | `ADMIN_NAME/EMAIL/PASSWORD` | Only for `npm run create-admin`; remove afterwards |
| frontend | `VITE_API_URL` | This backend's address |
| frontend | `VITE_SITE_URL` | Optional link to the public website on the sign-in page |

Never set `VITE_CRM_DEMO` or `VITE_ROUTER_MODE` in production; they exist for sandboxed previews.

## Security

- Sign-in only for emails in `ADMIN_EMAILS`; any other account is refused at login and on every
  request, even with a correct password or an old token. `create-admin` refuses other emails.
- bcrypt password hashing; login rate limit (10 per 15 min per IP); identical error for unknown
  email and wrong password.
- JWT (HS256, 8 h) required on every `/api/admin/*` route; changing the password or "sign out
  everywhere" revokes old sessions. The token lives in `sessionStorage` and is sent as a Bearer header.
- Field whitelist + validation on every write, 50 KB body limit, helmet, CORS allow-list,
  delete guards for linked records.
- The website intake endpoint only accepts requests carrying the shared `INTAKE_KEY`
  (constant-time comparison) and is off when the key is unset.
- The CRM app is `noindex`; `.env` files are git-ignored.

## Deploy

1. **Database** — MongoDB Atlas in your own account (can be a different database from the website's).
2. **API** — Render / Railway web service, root directory `backend`, build `npm install`, start
   `npm start`, variables from `backend/.env.example`. Then run `npm run create-admin` once.
3. **CRM app** — static site, root directory `frontend`, build `npm run build`, publish `dist`,
   `VITE_API_URL` = API address, every path rewritten to `index.html` (`public/_redirects`,
   `vercel.json` included). Use its own address, e.g. `crm.yourdomain.com`.
4. Set `CORS_ORIGINS` on the API to the CRM app's address and redeploy.
5. To receive website enquiries: set the same random value as `INTAKE_KEY` here and
   `CRM_INTAKE_KEY` in the website backend, and set the website backend's `CRM_INTAKE_URL` to
   this API's address.

## Tests

`cd backend && npm test` — 21 checks: email allow-list, login and token checks, rate limiting,
password change, validation, lead → client conversion, payment timeline, delete guards, website
intake key, and that the CRM app's options match the API.
