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

For this monorepo, the commands stay workspace-aware:

- API build: `npm run prisma:generate --workspace @stackfox/api`
- API start: `npm run start --workspace @stackfox/api`
- Dashboard build: `npm run build --workspace @stackfox/dashboard`
- Dashboard start: `npm run start --workspace @stackfox/dashboard`

This avoids Railpack guessing the wrong runtime shape for the dashboard and keeps the API startup tied to the same workspace command we run locally.

### Deploying on Railway

1. Import this repository into Railway.
2. Create one service for the API and point its Railway config path at `/apps/api/railway.json`.
3. Create one service for the dashboard and point its Railway config path at `/apps/dashboard/railway.json`.
4. Add a PostgreSQL service and expose its connection string to the API as `DATABASE_URL`.
5. Set API variables
6. Set dashboard variables
7. Attach domains after both services are healthy.

The API health endpoint is `GET /health`. The dashboard healthcheck is `/`.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request with your changes. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
