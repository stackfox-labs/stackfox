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

## Contributing

Contributions are welcome! Please open an issue or submit a pull request with your changes. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
