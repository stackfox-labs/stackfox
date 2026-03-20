# @stackfox/api

Express API for StackFox.

This app powers:

- Roblox OAuth for the dashboard
- dashboard session and project management
- event ingestion
- record CRUD
- dashboard overview data

## Environment

Copy `.env.example` to `.env` and set real values where needed.

```env
PORT=3443
DATABASE_URL=postgres://postgres:postgres@localhost:5432/stackfox
APP_ORIGIN=http://localhost:3442
APP_ORIGINS=http://localhost:3442
ROBLOX_OAUTH_CLIENT_ID=
ROBLOX_OAUTH_CLIENT_SECRET=
ROBLOX_OAUTH_REDIRECT_URI=http://localhost:3443/auth/roblox/callback
ROBLOX_OAUTH_SCOPES=openid profile
```

`APP_ORIGIN` is the primary dashboard origin used for browser redirects. `APP_ORIGINS` is the allowlist used by CORS and can contain one or more origins separated by commas or spaces.

## Scripts

From the monorepo root:

```bash
npm run dev --workspace @stackfox/api
npm run prisma:generate --workspace @stackfox/api
npm run typecheck --workspace @stackfox/api
```

From this folder:

```bash
npm install
npm run dev
npm run prisma:generate
npm run typecheck
```

## Implemented Route Surface

Dashboard and browser auth:

- `GET /health`
- `GET /auth/roblox/login`
- `GET /auth/roblox/callback`
- `GET /auth/session`
- `POST /auth/logout`
- `POST /auth/projects/link`
- `POST /auth/projects/create`
- `POST /auth/projects/delete`
- `POST /auth/projects/revoke-key`
- `GET /v1/dashboard/browser/overview`

API key authenticated endpoints:

- `GET /v1/projects`
- `POST /v1/events`
- `GET /v1/records/:collection/:key`
- `PUT /v1/records/:collection/:key`
- `DELETE /v1/records/:collection/:key`
- `GET /v1/records/:collection`
- `GET /v1/dashboard/overview`

## License

MIT License. See [LICENSE](../../LICENSE) for details.
