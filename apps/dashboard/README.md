# @stackfox/dashboard

Dashboard application for StackFox.

This app is the internal product UI for:

- signing in with Roblox
- creating and linking projects
- viewing project overview data
- inspecting events and records
- viewing logs and usage
- managing API keys and project settings

## Environment

The dashboard can read the API base URL from `VITE_STACKFOX_API_URL`.

If it is not provided, it falls back to:

```text
http://localhost:3443
```

## Scripts

From the monorepo root:

```bash
npm run dev --workspace @stackfox/dashboard
npm run typecheck --workspace @stackfox/dashboard
npm run build --workspace @stackfox/dashboard
```

From this folder:

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

## License

MIT License. See [LICENSE](../../LICENSE) for details.
