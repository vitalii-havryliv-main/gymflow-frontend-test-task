Gymflow Frontend Test Task

Quick start

1. Install dependencies

```bash
pnpm install
```

2. Run API (Fastify + lowdb)

```bash
pnpm nx run api:serve
```

The API listens on port 3333 by default. Data is stored in `.data/api-db.json` and is git-ignored.

3. Run Web (Vite dev server)

```bash
pnpm nx run web:dev
```

4. Run Mobile (Expo)

Option A – start dev server and choose platform from the prompt:

```bash
pnpm nx run mobile:start
```

Then, in the terminal:

- Press i to open iOS Simulator
- Press a to open Android Emulator

Option B – open a specific platform directly:

```bash
# iOS
pnpm nx run mobile:run-ios

# Android
pnpm nx run mobile:run-android
```

Notes

- Commands above use Nx targets exposed by the Expo plugin.
- If you prefer raw Expo CLI, you can also use:
  - `pnpm --filter mobile exec expo start`
  - `pnpm --filter mobile exec expo start --ios`
  - `pnpm --filter mobile exec expo start --android`
