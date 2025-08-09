## Gymflow Frontend Monorepo

A small monorepo with:

- Web: React + Vite
- Mobile: React Native (Expo)
- API: Fastify + lowdb (JSON file DB)

### Requirements

- Node 18+
- pnpm 10+
- Git
- For mobile:
  - iOS: Xcode (macOS) and iOS Simulator
  - Android: Android Studio and an emulator (or a device)

### Setup

```bash
pnpm install
```

### Run the API (required for web/mobile)

```bash
pnpm nx run api:serve
```

The API listens on port 3333 by default. Data is stored in `.data/api-db.json` and is git-ignored.

### Run the Web app

```bash
pnpm nx run web:dev
```

4. Run Mobile (Expo)

### Run the Mobile app (Expo)

Option A: interactive

```bash
pnpm nx run mobile:start
```

- Then press `i` (iOS) or `a` (Android) in the terminal

Option B: direct

```bash
pnpm nx run mobile:run-ios
pnpm nx run mobile:run-android
```

### Tests

```bash
pnpm test
```

### Build (optional)

```bash
pnpm nx run api:build
pnpm nx run web:build
```
