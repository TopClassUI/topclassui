# @topclassui/cli

The source of the `topclassui` bin: `npx topclassui init`, `add`, `diff` and `list`. The design is `docs/plan/cli.md`. This package is private; its build lands inside the `topclassui` tarball as `dist/cli/` and `dist/registry/`, so `npx topclassui add button` runs the bin of the library it copies from, with no network call and no runtime dependency.

## Commands

```text
pnpm build              dist/cli (tsc) and dist/registry (the registry build); --out <dir> writes both elsewhere
pnpm registry:build     dist/registry only
pnpm check:registry     the registry build without writing: fails on any specifier the copy cannot rewrite
pnpm lint               eslint
pnpm typecheck          tsc --noEmit
pnpm test               vitest: unit tests, the registry, and the offline copy test over both fixtures
pnpm test:consumers     --tarball <topclassui.tgz>: npm install, npx init and add, type-check and build each fixture
pnpm check              lint, typecheck, check:registry, build, test
```

The library's `postbuild` runs `pnpm --filter @topclassui/cli build --out ../topclassui/dist`, so `pnpm build` at the root ships the CLI and the registry with every build.

## Layout

```text
src/index.ts            the bin: runs main() with the real process
src/main.ts             argument parsing, dispatch, exit codes
src/commands/           init, add, diff, list, and what they share
src/lib/                detection, tsconfig, the rewrite, the lock, the resolver, the line diff, the CSS edit, install
scripts/registry-build.ts and scripts/lib/registry.ts   the closure of each component, as shadcn-shaped item JSON
scripts/consumers.ts    the online consumer test
test/fixtures/          a Next.js 16 App Router app and a Vite 8 React app, without node_modules
test/snapshots/         the copied tree, the CSS entry and topclassui.json after init and add, per fixture
```

## Where this differs from the plan

- The plan puts the source in `packages/topclassui/cli/`. It lives here so the CLI's code, tests and fixtures stay out of the library's folder contract and lint rules; the tarball layout is the plan's.
- `shared/provider/provider.tsx` renders the toast viewport, so `base` depends on `toast`, and `init` also copies `toast`, `button` and `svg` and installs `@base-ui/react` and `class-variance-authority`.
- In a Vite project `init` writes `<folder>/process-env.d.ts`: three dev warnings read `process.env.NODE_ENV`, which Vite inlines but the Vite template does not type.
- TypeScript 7 has no JavaScript API, so when the project's `typescript` cannot read its tsconfig the CLI reads it itself (comments, trailing commas, `extends`, `references`).
- `--imports alias` (choice K4) is refused with a message; copies use relative imports.
