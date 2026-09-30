# Irin & Kaviya — Studio Website

The public portfolio website for Irin (frontend) and Kaviya (backend): hero with a 360° team
presentation, services, three live demo projects, pricing, 30 / 30 / 40 payment stages, process,
the "You own it. We build it." model, FAQ and a project enquiry form.

Every enquiry is emailed to both of you through **Brevo**.

This project is fully independent. The private CRM is a separate project (`ik-studio-crm`); the
only link between them is optional: this backend can forward each enquiry to the CRM as a new lead.

```
ik-studio-website/
├── frontend/   React 19 + Vite + Tailwind CSS 3.4
│   └── src/    sections/ components/ data/ hooks/ layout/ pages/ utils/ styles/ assets/
└── backend/    Node.js + Express 5 + MongoDB (Mongoose 8) — contact-form API
    ├── src/routes/enquiries.js   POST /api/enquiries (validation, honeypot, rate limit)
    ├── src/lib/email.js          enquiry email to the team via Brevo
    ├── src/lib/forwardToCrm.js   optional hand-off to the CRM
    ├── scripts/send-sample-email.js  `npm run test-email` — checks the Brevo setup
    ├── scripts/resend-emails.js      re-send emails that failed
    ├── scripts/resend-to-crm.js      re-send enquiries the CRM missed
    └── test/
```

## Quick start (Windows / Mac)

Needs Node.js 20 or newer. Open two terminals in this folder.

```bash
# Terminal 1 — backend (emails via Brevo)
cd backend
npm install
npm run test-email     # sends one sample enquiry to both inboxes
npm run dev            # http://localhost:5000

# Terminal 2 — website
cd frontend
npm install
npm run dev            # open http://localhost:5173
```

Both `.env` files are already filled in. Without MongoDB, enquiries are saved in
`backend/data/enquiries.json`; add `MONGODB_URI` in `backend/.env` when you deploy.

## Features

- Every section's text lives in `frontend/src/data/` (contact details, projects, pricing, FAQ…).
- Live demo buttons for Brew & Bite, IronCore Fitness and Lumora Interiors. A GitHub button
  appears when you add `githubUrl` to a project in `data/projects.js` (none are shown until then).
- Honest metrics: the 40+ clients / 60+ projects figures are switched off in `data/site.js`
  (`verifiedTrackRecord.show`) until you confirm them.
- Contact form: field-by-field validation and a confirmation message. Without a backend
  (`VITE_API_URL` empty) it prepares the enquiry for email / WhatsApp instead.
- Responsive from 375 px to 1920 px, reduced-motion support, keyboard navigation, SEO metadata,
  Open Graph image, 404 page.

## Run locally

```bash
# API
cd backend
cp .env.example .env        # MONGODB_URI, CORS_ORIGINS (+ optional CRM_INTAKE_URL / CRM_INTAKE_KEY)
npm install
npm run dev                 # http://localhost:5000/api/health
npm test

# Website
cd ../frontend
cp .env.example .env        # VITE_API_URL=http://localhost:5000
npm install
npm run dev                 # http://localhost:5173
npm run build               # dist/
```

## Environment variables

| Where | Variable | Purpose |
| --- | --- | --- |
| backend | `MONGODB_URI` | MongoDB where enquiries are stored (empty = `backend/data/enquiries.json`) |
| backend | `CORS_ORIGINS` | The website's address(es) |
| backend | `BREVO_API_KEY` | Brevo API key (starts with `xkeysib-`). Empty = no emails |
| backend | `MAIL_FROM_NAME` | Sender name — `IK Studio` |
| backend | `MAIL_FROM_EMAIL` | Verified Brevo sender — `imirinnnb@gmail.com` |
| backend | `NOTIFY_EMAILS` | Who receives each enquiry — `imirinnnb@gmail.com,kaviyashree2408@gmail.com` |
| backend | `CRM_INTAKE_URL` | Optional — CRM backend address |
| backend | `CRM_INTAKE_KEY` | Optional — must equal `INTAKE_KEY` in the CRM backend |
| frontend | `VITE_API_URL` | This backend's address (public, not a secret) |

## How enquiries flow

1. The visitor submits the form → the backend validates it, stores it in MongoDB and replies at once.
2. It then emails the full enquiry through **Brevo** to `imirinnnb@gmail.com` and
   `kaviyashree2408@gmail.com`, from "IK Studio". *Reply* in Gmail goes straight to the customer.
   The result is saved on the enquiry (`emailStatus`: sent / failed); `npm run resend-emails`
   re-sends failed ones.
3. If `CRM_INTAKE_URL`/`CRM_INTAKE_KEY` are set, it then sends the enquiry to the CRM
   (`POST /api/intake/enquiries` with the shared key), where it becomes a **New lead**.
   The result is saved on the enquiry (`crmStatus`: sent / failed).
4. If the CRM was asleep or down, run `npm run resend-to-crm` to send the failed ones again.

## Brevo setup (email notifications)

1. Sign in to Brevo (account **IK Studio**, `imirinnnb@gmail.com`).
2. **Senders, domains & dedicated IPs → Senders**: make sure `imirinnnb@gmail.com` is listed and
   verified (Brevo emails a confirmation link the first time).
3. **SMTP & API → API keys → Generate a new API key**. Copy it once; Brevo won't show it again.
4. Put it in `backend/.env` (locally) and in the hosting dashboard (production) as `BREVO_API_KEY`.
   Never commit it or put it in the frontend.
5. Run `npm run test-email` in `backend/`. Both inboxes should receive a sample enquiry.
   The first few may land in **Spam/Promotions**: open one and mark it "Not spam".

Because the sender is a Gmail address, Gmail can't fully authenticate mail that Brevo sends on its
behalf, so spam filtering is stricter. That's fine for notifications to yourselves; if you later
use a custom domain (e.g. `hello@ikstudio.in`), add and authenticate it in Brevo and change
`MAIL_FROM_EMAIL`.

## Security

The Brevo key lives only in the backend environment. Customer input is HTML-escaped in the email.
Helmet headers, CORS allow-list, 20 KB body limit, per-IP rate limit (5 per 15 min), field
whitelist and validation, honeypot field. No secrets in the frontend. `.env` is git-ignored; only
`.env.example` is committed.

## Deploy

1. **Database** — MongoDB Atlas in your own account.
2. **API** — Render / Railway web service, root directory `backend`, build `npm install`,
   start `npm start`, environment variables from `backend/.env.example` (including the Brevo ones).
3. **Website** — static site (Render Static, Netlify, Vercel), root directory `frontend`,
   build `npm run build`, publish `dist`, `VITE_API_URL` = API address. Every path must rewrite to
   `index.html` (`public/_redirects` and `vercel.json` are included).
4. Put the website's address in the API's `CORS_ORIGINS` and redeploy the API.
