# Forkly

Forkly is a SvelteKit (Svelte 5) web app backed by Postgres + Drizzle and Redis, with background workers for long-running tasks (recipe import, ingredient sanitization).

## Architecture (high level)

- **Web app**: SvelteKit routes under `src/routes` (pages in `(pages)`, JSON APIs in `(api)`).
- **Database**: Postgres via Drizzle (`src/lib/server/db/schema.ts`, migrations under `src/lib/server/db/migrations`).
- **Redis**:
  - **BullMQ queues** for background jobs (`REDIS_URL`, `src/lib/server/queue.ts`, workers in `scripts/*.ts`).
  - **Upstash-style REST client** for caching / job results (`KV_REST_API_URL` + `KV_REST_API_TOKEN`, `src/lib/server/redis.ts`).
- **Deploy**: Vercel adapter; cron configured in `vercel.json`.

## Quickstart (local development)

### Prerequisites

- **Node**: `>= 22` (see `package.json`)
- **pnpm**
- **Docker + docker compose**

### 1) Install dependencies

```bash
pnpm install
```

### 2) Create `.env`

This repo includes an `.env.example`. Copy it to `.env` and fill in values:

```bash
cp .env.example .env
```

Minimal local values if you’re using the provided `docker-compose.yml`:

```bash
# Postgres (docker-compose maps container 5432 -> host 5433)
DATABASE_URL="postgres://postgres:postgres@localhost:5433/forkly"

# BullMQ workers + queues (direct Redis)
REDIS_URL="redis://localhost:6379"

# Upstash-style Redis REST (docker-compose runs a local REST proxy)
KV_REST_API_URL="http://localhost:8079"
KV_REST_API_TOKEN="localdevtoken"

# Used for email verification links + OAuth callback URLs
APP_URL="http://localhost:5173"
```

### 3) Start Postgres + Redis

```bash
docker compose up -d
```

Ports used by default:

- **Postgres**: `localhost:5433`
- **Redis**: `localhost:6379`
- **Redis REST proxy**: `localhost:8079`

### 4) Run migrations + seed

```bash
pnpm db:migrate
pnpm db:seed
```

The seed script creates a demo user:

- **email**: `demo@forkly.local`
- **password**: `password`

### 5) Run the app + workers

`pnpm dev` runs the web app plus both workers (recipe import + ingredient sanitization):

```bash
pnpm dev
```

Open `http://localhost:5173`.

## Environment variables

These are referenced in code (either via `$env/static/private` in SvelteKit or `process.env` in worker scripts).

### Required for most local workflows

- **`DATABASE_URL`**: Postgres connection string (Drizzle + app server + seed).
- **`REDIS_URL`**: direct Redis URL for BullMQ queues/workers.
- **`KV_REST_API_URL` / `KV_REST_API_TOKEN`**: Upstash-compatible Redis REST API used by `src/lib/server/redis.ts`.
- **`APP_URL`**: absolute base URL used for email verification links and Google OAuth callback URLs.

### Optional (feature-dependent)

- **AI / recipe features**
  - **`ANTHROPIC_API_KEY`**: used by `src/lib/llm.ts` and the import worker.
  - **`OPENAI_API_KEY`**: used by server food adapters and the sanitize/import workers (e.g. vision / text extraction).
  - **`SPOONACULAR_API_KEY`**: used by Spoonacular adapter for ingredient/nutrition lookups.
- **Auth**
  - **`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`**: Google OAuth (`src/lib/server/oauth.ts`).
- **Email**
  - **`RESEND_API_KEY`**: signup verification + feedback emails.
- **Media**
  - **`CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`**: signed uploads (`src/lib/server/cloudinary.ts` and `/cloudinary/sign` API).

## Common commands

- **Dev**: `pnpm dev` (web + workers)
- **Dev (with cleanup)**: `pnpm dev:clean`
- **Build/preview**: `pnpm build`, `pnpm preview`
- **Typecheck**: `pnpm check`
- **Format/lint**: `pnpm format`, `pnpm lint`

### Database

- **Start containers**: `pnpm db:start`
- **Run migrations**: `pnpm db:migrate`
- **Generate migrations**: `pnpm db:generate`
- **Push schema + seed**: `pnpm db:push`
- **Seed only**: `pnpm db:seed`
- **Reset DB (drop + push + seed)**: `pnpm db:reset`
- **Drizzle studio**: `pnpm db:studio`

### Workers (run separately)

- **Import worker**: `pnpm worker`
- **Sanitize worker**: `pnpm worker:sanitize`

### Tests

- **All tests**: `pnpm test`
- **Watch mode**: `pnpm test:watch`

`pnpm test` loads `.env.test` (see `package.json`) and runs a pretest step that creates a test database and applies migrations.

### Storybook

- **Run storybook**: `pnpm storybook`
- **Build storybook**: `pnpm build-storybook`

## Deployment notes (Vercel)

- The app uses the Vercel adapter (`svelte.config.js`).
- A cron job is configured in `vercel.json` to hit `GET /sanitize-ingredient/retry-failed` every 30 minutes.
- Make sure the Vercel project has all required env vars set (at minimum `DATABASE_URL` and `REDIS_URL`, plus any feature-specific keys you use in production).

## Troubleshooting

- **Ports already in use**: adjust `docker-compose.yml` ports (Postgres `5433`, Redis `6379`, REST `8079`) or stop the conflicting services.
- **Workers can’t connect to Redis**: confirm `REDIS_URL="redis://localhost:6379"` and `docker compose ps` shows `redis` healthy.
- **App can’t connect to Postgres**: confirm `DATABASE_URL` uses host port `5433` (not `5432`).
