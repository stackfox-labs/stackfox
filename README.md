# StackFox Monorepo

This repository contains the core StackFox platform as a single npm workspaces monorepo.

It includes:

- the dashboard app
- the API app
- the in-progress Luau SDK
- the reserved package location for the future JavaScript SDK

## Workspaces

- `@stackfox/api`: Express + Prisma backend for auth, events, records, and dashboard data
- `@stackfox/dashboard`: TanStack Start dashboard app for project management and data inspection
- `@stackfox/sdk-js`: placeholder package for a future JS/TS SDK
- `@stackfox/sdk-luau`: The in-progress Luau SDK for Roblox game developers

## Requirements

- Node.js and npm
- a local Postgres instance for the API

## Install

```bash
npm install
```

## Development

Run the API and dashboard together from the monorepo root:

```bash
npm run dev
```

Run a single workspace:

```bash
npm run dev:api
npm run dev:dashboard
```

The root dev runner starts:

- `@stackfox/api`
- `@stackfox/dashboard`

## Verification

```bash
npm run prisma:generate
npm run typecheck
npm run build
npm run lint
npm run test
```

## Railway deployment

We deploy StackFox services on Railway with config-as-code so build and start behavior lives in the repo instead of in a dashboard form.

### Service config files

- `apps/api/railway.json`
- `apps/dashboard/railway.json`

Each `railway.json` file tells Railway:

- which builder to use
- which command builds the service
- which command starts the service
- which path to healthcheck after deploy

For this monorepo, each service uses a root-level script:

- API build: `npm run build:api`
- API pre-deploy: `npm run predeploy:api`
- API start: `npm run start:api`
- Dashboard build: `npm run build:dashboard`
- Dashboard start: `npm run start:dashboard`

This avoids Railpack guessing the wrong runtime shape for the dashboard and keeps the API startup tied to the same workspace command we run locally.

For Prisma on the API:

- `build:api` runs `prisma generate` so the Prisma client is baked into the built image
- `predeploy:api` runs `prisma db push` so the database schema is synced before the new deployment goes live

Do not move `prisma generate` into pre-deploy. Railway runs pre-deploy in a separate step, so generated files from that phase are not the right place to prepare runtime artifacts.

### Deploying on Railway

1. Import this repository into Railway.
2. Create one service for the API and point its Railway config path at `/apps/api/railway.json`.
3. Create one service for the dashboard and point its Railway config path at `/apps/dashboard/railway.json`.
4. Add a PostgreSQL service and expose its connection string to the API as `DATABASE_URL`.
5. Set API variables:

    ```env
    PORT=8080
    DATABASE_URL=
    APP_ORIGIN=https://dashboard.your-domain.com
    ROBLOX_OAUTH_CLIENT_ID=
    ROBLOX_OAUTH_CLIENT_SECRET=
    ROBLOX_OAUTH_REDIRECT_URI=https://api.your-domain.com/auth/roblox/callback
    ROBLOX_OAUTH_SCOPES=openid profile
    ```

6. Set dashboard variables:

    ```env
    VITE_STACKFOX_API_URL=https://api.your-domain.com
    ```

7. Attach domains after both services are healthy.

The API health endpoint is `GET /health`. The dashboard healthcheck is `/`.

Keep both services building from the monorepo root so npm workspaces and the shared lockfile are available. Do not use `Add Root Directory` for this repo unless each app gets its own independent lockfile and install flow.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request with your changes. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
