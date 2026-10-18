# topclassui

RTL-first, server-first React design system for Next.js App Router and Tailwind CSS v4.

This is the repository: a pnpm workspace. The published package, `topclassui`, lives in [`packages/topclassui`](./packages/topclassui) with its own [README](./packages/topclassui/README.md), [CHANGELOG](./packages/topclassui/CHANGELOG.md) and [LICENSE](./packages/topclassui/LICENSE). `docs/` holds the plan, the rules, the decisions and the status; `.changeset/` holds the pending release notes.

## Work on it

```sh
pnpm install
pnpm check
```

`pnpm check` runs every gate (lint, typecheck, the four test projects, the structure, boundary, CSS, icon, README and contrast checks, then Playwright) and forwards to `packages/topclassui`; every command in [CLAUDE.md](./CLAUDE.md) runs from the root the same way. Once per machine: `npx playwright install chromium`.

Install from npm: `npm i topclassui@beta zod`. License: [MIT](./LICENSE).
