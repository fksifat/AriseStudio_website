# AriseStudio — Official Corporate Website

A enterprise-grade web application for **AriseStudio**, built with **Next.js 16**, **TypeScript**, and **Tailwind CSS**.

AriseStudio is a business automation and IT engineering startup providing:
- **E-Commerce Automation Systems** (multi-channel sync, inventory routing, automated fulfillment)
- **Custom ERP & CRM Engineering** (bespoke resource planning, role-based workflows, financial ledgers)
- **Business Process Automation & RPA** (document OCR, approval pipelines, data bots)
- **24/7 Managed IT Support & Infrastructure** (cloud operations, SRE, SLA guarantees)

---

## 🚀 Architectural & Design Highlights

Inspired by the polished, trustworthy presentation of leading technology powerhouses like **Brain Station 23**, **Enosis Solutions**, and **Therap BD**:
- **Enterprise Dark/Modern Palette:** Styled with obsidian glassmorphic cards, indigo/cyan accent gradients, and typography designed for corporate clients.
- **Interactive Live Architecture Flow:** Visualizes how customer orders flow into the automation engine, sync to ERPs, and are monitored 24/7.
- **Dedicated Route Hierarchy:**
  - `/` — Homepage with value propositions, dynamic architecture flows, and metrics.
  - `/services` — Detailed breakdown of E-Commerce, ERP, CRM, RPA, and 24/7 Support with engagement models.
  - `/solutions` — Vertical-specific solutions (Retail & Omnichannel, Supply Chain & Logistics, Finance & Invoicing, Manufacturing).
  - `/case-studies` — Real-world problem/solution/impact case studies.
  - `/about` — Mission, engineering philosophy, and enterprise standards.
  - `/careers` — Engineering culture, open roles (Full-stack, DevOps/SRE, Python Automation).
  - `/contact` — Interactive consultation request form with SLA badges and budget selectors.
- **Fast & SEO Optimized:** Static prerendering with webpack, structured metadata, and responsive mobile-first navigation.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript
- **Icons:** Lucide React & inline SVG assets
- **Build Engine:** webpack

---

## 💻 Getting Started

To run the project locally:

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To build for production:

```bash
npm run build
npm start
```


## Submission storage and provider setup

Contact inquiries and reservations are saved before success is returned. Production requires
`TURSO_DATABASE_URL` and, for authenticated Turso databases, `TURSO_AUTH_TOKEN`.
A configured database outage returns HTTP 503; requests do not fall back to temporary storage.
For a self-hosted server, an explicit `file:/absolute/persistent/path/arisestudio.db` URL can be
used on a persistent volume. Never point this at ephemeral serverless storage.

Without a database URL, local development uses `data/arisestudio.db`. Keep this file private
and backed up. Database and WAL files are ignored by Git. Existing `data/bookings.jsonl`
and legacy `/tmp/bookings.jsonl` reservations are still checked and listed; they are not
rewritten or deleted. Existing `data/leads.jsonl` remains untouched. New inquiries are in
`contact_leads.submission` as JSON; reservations remain in `bookings`.

The application creates missing tables on first database use and retains the existing
booking schema and unique slot constraint. No live database is accessed by the test suite.

Optional email settings: `SMTP_HOST`, `SMTP_PORT` (default 587), `SMTP_USER`, `SMTP_PASS`,
and `CONTACT_NOTIFICATION_EMAIL` (default contact@arisestudio.com).
Google Meet generation uses `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and
`GOOGLE_REFRESH_TOKEN`. If email or Calendar fails after reservation, the slot stays reserved
and the booking screen reports the missing confirmation/link.

Studio slots are defined in `Asia/Dhaka`; changing the display timezone converts the same
instant using IANA timezone rules, including daylight saving and date changes. Calendar
links, email times and provider events all use that reservation's UTC start time.

Submission throttles apply per process (5 requests per IP per 10 minutes, 2 per email per
hour, separately for contact and booking). Use a shared edge rate limiter before deploying
multiple instances. Forwarded IP headers must be overwritten by the trusted hosting proxy.

## Verification

```bash
npm test
npx tsc --noEmit --incremental false
npm run lint
npm run build
```

Tests use Node's built-in test runner, the installed TypeScript compiler and isolated
in-memory SQLite. They cover concurrent reservation conflicts, legacy reservations,
timezone conversion, invalid/past slots, storage errors, bounded input, throttling and
provider payloads without sending mail or creating real meetings.

## Calendar cancellation sync

The scheduler refreshes availability every 30 seconds while visible, on focus, and on reload.
Availability reads and new booking attempts reconcile the connected host's primary Calendar.
This uses Google incremental sync (`showDeleted=true`, persisted sync tokens), with a full
baseline on an expired token. Reads within 15 seconds share the last sync attempt per process.
No webhook, cron service or additional Google permission is required.

Each new booking stores a generated Google event ID before creating the event. A confirmed
`cancelled` event releases the slot in one database transaction: the original booking is
archived in `booking_calendar_events.snapshot`, `cancelledAt` is set, and only that active
booking is removed from `bookings`. Repeated cancellation updates cannot remove a new booking
in the same slot. Cancellation does not edit or delete the original JSONL files.

The two additive tables `booking_calendar_events` and `calendar_sync_state` are created on
first database use. Existing booking columns and the unique slot constraint are retained.
Archived snapshots are private booking history and should be backed up with the database.

For older bookings without event IDs, a complete Calendar snapshot is used. Backfill requires
exactly one non-recurring host-organized event with the same discovery-session title,
customer email, start instant and 30-minute duration. Ambiguous matches and old deleted events
whose identifying details have disappeared remain locked for manual review. A matching
cancelled legacy booking is archived, so its unchanged JSONL file does not relock the slot.

Missing events, attendee declines, permission/network errors, incomplete pages and a changed
OAuth connection never count as cancellation. Sync state is scoped to a hash of the OAuth
connection (no refresh token is stored in the database). Replacing that connection requires
review of previously linked bookings. Restoring or rescheduling a cancelled Google event
does not restore or move the website reservation; book a new slot through the website.

Automatic synchronization runs when the website scheduler is used. For background processing
when nobody has the scheduler open, add a scheduled worker or Calendar push subscription.
Reference: https://developers.google.com/workspace/calendar/api/v3/reference/events/list
