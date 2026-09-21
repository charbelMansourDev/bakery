# La Belle Fournée

An artisan sourdough bakery site — a public storefront that renders live product
data from MongoDB, plus a deliberately narrow CMS so the bakery can change
prices, swap loaf photos and add seasonal products without a developer.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · MongoDB + Mongoose · JWT auth (`jose`)

---

## Setup

### 1. Node 22

The repo pins Node 22 in `.nvmrc`. Tailwind v4 requires Node 20+, so this matters.

```bash
nvm use
```

### 2. Install

```bash
npm install
```

### 3. Environment

Copy the example and fill it in:

```bash
cp .env.example .env.local
```

| Variable | What it is |
|---|---|
| `MONGODB_URI` | MongoDB connection string. The database name is part of the URI. |
| `ADMIN_USERNAME` | Username for the single admin account. |
| `ADMIN_PASSWORD` | Admin password. Bcrypt-hashed by the seed script — never stored in plaintext. |
| `SESSION_SECRET` | Signs the session JWT. Generate with `openssl rand -base64 32`. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Optional. Overrides the number in `lib/config.ts`. |

If you use MongoDB Atlas, add your IP to the cluster's Network Access allowlist,
or the seed will hang and then fail with a server-selection timeout.

### 4. Seed

```bash
npm run seed
```

Inserts the 8 menu products and the one admin user. **Safe to re-run** — products
are upserted on `name`, so re-seeding never overwrites prices or images you've
edited in the CMS. It does reset the admin password to the current `ADMIN_PASSWORD`.

### 5. Run

```bash
npm run dev
```

- Storefront — http://localhost:3000
- Menu — http://localhost:3000/menu
- CMS — http://localhost:3000/admin/login

---

## What's here

### Public site

`/` and `/menu` are `force-dynamic`, so anything changed in the CMS is visible on
the next page load with no rebuild.

The cart is **client-side only** — no order is ever stored. It models one loaf:
picking a different base loaf replaces the current one, while add-ons toggle.
"Review Order" opens a WhatsApp chat with the order pre-filled; the number lives
in `lib/config.ts`.

The "Have an Idea?" form is front-end only. It shows a confirmation and keeps
nothing.

### CMS

One admin, products only. Log in at `/admin/login`, manage at `/admin/products`
— add, edit, delete and replace images.

Auth is a signed JWT in an httpOnly cookie. `middleware.ts` does an optimistic
check so a signed-out admin gets redirected rather than seeing a flash of the
dashboard, but the decision that actually matters is `requireAdmin()` /
`requireAdminApi()` in `lib/auth.ts`, called next to the data. Middleware is not
treated as an authorization boundary.

### API

| Route | Access |
|---|---|
| `GET /api/products` | Public |
| `POST /api/products` | Admin |
| `PATCH` / `DELETE /api/products/:id` | Admin |
| `POST /api/upload` | Admin |
| `GET /api/media/:file` | Public (serves uploaded images) |
| `POST /api/auth/login` · `POST /api/auth/logout` | — |

---

## Uploads

Image uploads have two backends, picked by environment — one function, one
stored URL shape per backend:

| Environment | Where uploads go | Stored `imageUrl` |
|---|---|---|
| Vercel (`BLOB_READ_WRITE_TOKEN` set) | Vercel Blob | `https://<store>.public.blob.vercel-storage.com/<uuid>.jpg` |
| Local dev (no token) | `./uploads/` (gitignored) | `/api/media/<uuid>.jpg` |

**Why not `public/uploads/`?** Next indexes the `public/` folder once at boot in
production and caches negative lookups, so a file written there after startup
404s under `next build && next start` until the server restarts — while working
perfectly in `next dev`. A route handler behaves identically in both.

**Why Blob on Vercel?** Its filesystem is ephemeral. Anything written to disk is
gone on the next deploy, so uploads have to leave the container.

Seeded products still point at static files in `public/images/`, so `imageUrl`
can hold any of three shapes and every reader copes with all of them.

Uploads are capped at 4 MB and limited to JPEG, PNG and WebP. The stored
extension comes from the file's MIME type, never its filename, and filenames are
UUIDs.

---

## Product images

Seeded photos live in `public/images/`. To replace one, either upload it through
the CMS or drop a file over the existing name:

`classic.jpg` · `whole-wheat.jpg` · `zaatar.jpg` · `olive.jpg` ·
`multigrain.jpg` · `chocolate.jpg` · `cinnamon.jpg` · `la-belle-signature.jpg` ·
`hero-chocolate-sourdough.jpg`

---

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run seed` | Seed products + admin (idempotent) |
| `npm run lint` | ESLint |

---

## Not built, on purpose

No payment or checkout · no order persistence or history · no customer accounts ·
no email on the ideas form · one admin, no roles.
