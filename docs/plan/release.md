# Release plan: topclassui becomes a workspace and ships 0.1.0-beta.0

Written 17 October 2026 against `main` at 9fb1288. Inputs: `docs/PLAN.md` (4, 14, 17, 19), `docs/DECISIONS.md`, `docs/STATUS.md`, `package.json`, `scripts/`, and the measured facts in `handoff/release-plan/release-facts.md`.

This plan is for a builder agent with no memory. Do the steps in order. Each step is one branch and one pull request, and each ends with a green `pnpm check`. The owner (Omar) does the npm account and the publish himself (step R9).

---

## 0. Read this first

1. **The plan and the decision log disagree.** PLAN 4 draws three packages (`packages/react`, `packages/tokens`, `packages/icons`) with Turborepo. DECISIONS (2 Oct, "One package named `topclassui`") folds them into one unscoped package, `topclassui`, and says the two were never reconciled.
2. **This plan reconciles them.** The repo becomes a pnpm workspace. The one published package, `topclassui`, lives in `packages/react/` (the folder name PLAN 4 uses). Tokens and icons stay inside it, as DECISIONS says. `apps/docs` joins later. Section 9 gives the three-package layout as the alternative, with its extra cost.
3. **What 0.1.0-beta.0 ships.** All 52 folders under `src/components/` that have an `index.tsx` (the site's 46 plus helpers such as `icon`, `icon-registry` and `svg`) as subpath imports: `import { Button } from 'topclassui/button'`. This reverses DECISIONS 2 Oct point 4 ("the package ships zero components"), because the CLI that was meant to deliver them is not built. The CLI comes later and can import from the package.
4. **Every default here that departs from PLAN or DECISIONS is written into one DECISIONS entry in step R1, before any code moves.** CLAUDE.md requires that.
5. **Not verified yet, and checked in the step named:** that Tailwind accepts `@source "./connectors"` when `dist/connectors/` does not exist (R7); whether npm also points `latest` at a first version published with `--tag beta` (R9). Settled by the review: pnpm 10.28.2 applies `publishConfig.imports` to the packed manifest, so the tarball's `imports` point at `dist`, not at an unshipped `src/` (R5).
6. **Reviewed on 17 October 2026.** A copy of `src` was emitted, rewritten and packed: 967 `.js`, 963 `.d.ts`, 1,153 files, 318 KB packed, 1.17 MB unpacked; all 66 tried entries resolve in Node; a consumer page type-checks under `bundler` and `node16`. The probes are in `handoff/release-plan/review-release/`. What the review changed is folded into R2, R4, R5, R6 and R9.

---

## 1. Where we end up

```text
topclassui/                      the repository (private package.json, not published)
  package.json                   name "topclassui-repo", private, forwards every script to packages/react
  pnpm-workspace.yaml            packages: packages/*, apps/*
  pnpm-lock.yaml  .npmrc  .node-version  .editorconfig  .gitattributes  .gitignore
  CLAUDE.md  AGENTS.md  .cursor/rules/topclassui.mdc   still generated from docs/RULES.md
  README.md  LICENSE             the repository's own
  .changeset/                    config.json and one file per change (R8)
  .github/workflows/ci.yml       unchanged: it runs pnpm check at the root
  docs/                          PLAN, RULES, DECISIONS, STATUS, figma/, reviews/, plan/
  packages/
    react/                       the published package "topclassui"
      package.json               name, exports, files, dependencies (R5)
      README.md  LICENSE  CHANGELOG.md
      tsconfig.json  tsconfig.build.json
      eslint.config.ts  vitest.config.ts  playwright.config.ts
      src/  raw/  scripts/  eslint-rules/  e2e/  test/
      docs/icons.md              the icon allow-list, beside raw/
      consumers/next/  consumers/vite/   two tiny apps the smoke test builds (R7)
      dist/                      build output, git-ignored, the only folder in the tarball
  apps/
    docs/                        later: the Next.js 16 site, "topclassui": "workspace:*"
```

**Why the whole library moves as one block.** Every script, config and test reads paths from `process.cwd()`: 70 mutation files with 745 `'src/...'` literals, 77 test files, the harness, e2e, `module-graph.ts`. pnpm runs a package's scripts with the package folder as the working directory. So if `src/`, `raw/`, `scripts/`, `eslint-rules/`, `e2e/`, `test/` and the four configs move together, every one of those paths stays true and none of them is edited. Only two things reach outside the block: `docs/icons.md` (moves in with it) and `rules-sync` (learns to find the repo root).

**Task runner.** None for now. One package and, later, one app need only `pnpm --filter`. `pnpm -r run build` already builds in dependency order. Turborepo (PLAN 2) is an owner choice (C6) for when `apps/docs` makes caching worth 765 KB plus a platform binary.

---

## 2. The steps in order

| Step | Branch | What | Builder time | Gate |
|---|---|---|---|---|
| R0 | none | Preconditions: the theme branch is merged, `main` is green | none | `pnpm check` on main |
| R1 | `docs/release-decisions` | One DECISIONS entry with every departure; STATUS update | 30 min | `pnpm check` |
| R2 | `fix/declaration-types` | Explicit return types on four hooks, so declarations emit | 1 h | `pnpm check` + a dry `tsc` emit |
| R3 | `chore/workspace` | The move into `packages/react`, the root workspace | 2 to 3 h | `pnpm check` + `pnpm test:mutation` |
| R4 | `feat/build` | `pnpm build`: tsc, specifier rewrite, CSS copy, watch mode | 3 h | `pnpm check` + `pnpm build` |
| R5 | `feat/package-manifest` | exports, files, deps, engines; publint, attw, `check:package` in `pnpm check` | 3 to 4 h | `pnpm check` (now builds and packs) |
| R6 | `fix/readme-subpath-imports` | READMEs, their compile tests and shipped strings name `topclassui/<slug>` | 3 h | `pnpm check` + `pnpm test:mutation` |
| R7 | `test/consumers` | A Next.js app and a Vite app built from the packed tarball | 3 to 4 h | `pnpm test:consumers` + `pnpm check` |
| R8 | `chore/release-0.1.0-beta.0` | Changesets, package README, LICENSE, CHANGELOG, version | 2 h | `pnpm check` + `pnpm test:consumers` |
| R9 | none (owner) | npm account, org, login, dry run, publish | 45 min | the runbook's own checks |
| R10 | `docs/after-publish` | Record what was published; STATUS | 30 min | `pnpm check` |

A full `pnpm check` is about 30 minutes on the laptop: Playwright alone took 23.2 minutes (7,279 tests) in the last logged run on main (`handoff/main-after-128-check.log`). Count one full run per step on top of the builder time. Steps R1 to R8 are about two working days with the gate runs. R2 can run in parallel with R1; everything from R3 on is in order, because each step edits files the previous one moved.

---

## 3. The steps

### R0. Preconditions

- The theme branch (blue primary, themed scrollbars) is merged. R3 renames every file under `src/`; starting it while another branch edits `src/` invites conflicts.
- `pnpm check` is green on `main`. The last logged run (`handoff/main-after-128-check.log`) ended with 2 sidebar e2e failures (`e2e/sidebar.spec.ts:687`, "a drag up the list scrolls the body to its last link"). Fix or explain them first, or no later step can tell its own failures apart.
- The owner answers the choices in section 8, or accepts the defaults.

### R1. The decision entry

Add one entry at the top of `docs/DECISIONS.md`, dated the day it lands: "Release 0.1.0-beta.0: one package in a workspace, components as subpaths". It records, each with its reason:

1. The repo becomes a pnpm workspace. The one package `topclassui` lives in `packages/react/`; tokens and icons stay in it (closes the "Still open" of 2 Oct and STATUS open question 3). No Turborepo yet (PLAN 2, 4, 17.2).
2. 0.1.0 ships the components as subpath exports (reverses 2 Oct point 4; makes the second install column on the 46 cards true again, STATUS open question 2).
3. `#shared/`, `#components/` and `#icons/` specifiers are rewritten to relative paths in `dist` by the build (settles the 21 Sep "deferred" entry, which was overtaken when the subpath imports were added).
4. The build is `tsc` plus a Node script, not `copyfiles` (PLAN 4 "Build and consumption"; same reasoning as the 3 Oct `check-css` entry: a short script, no dependency).
5. `files` is `dist` only, without `dummy/`, without source maps, without `src` (PLAN 4 says `["dist", "src"]`).
6. `sideEffects: ["**/*.css"]` (PLAN 4; today's `false` would let a bundler drop the CSS import).
7. Published `engines.node` is `>=20.9` (Next.js 16's floor, PLAN 2); the repo itself keeps `>=22.14` (21 Sep entry).
8. Dependency ranges: exact `@base-ui/react` (every `meta.ts` names `baseUiRange: '1.8.0'`), caret for the rest.
9. The first version is `0.1.0-beta.0` on the `beta` tag, published by hand from the laptop, with no provenance, because GitHub Actions is off (PLAN 17.4 and the 25 Sep publishing entry assume Actions). Trusted publishing comes when the repo is public and Actions runs.
10. size-limit waits for STATUS open question 6.
11. The build emits with `module` and `moduleResolution` `NodeNext` (PLAN's `library.json`), so every specifier TypeScript writes into a `.d.ts` carries `.js`; the repo's own `tsconfig.json` keeps `bundler`.
12. The published manifest maps `imports` to `dist` through `publishConfig.imports`; the repo's `imports` keep pointing at `src`.
13. The install line stays `npm i topclassui zod` (2 Oct point 1), written `npm i topclassui@beta zod` while only betas exist.
14. `shared/classes.ts` is a public subpath, `topclassui/classes` (C18): the lint rule tells every author to use `FOCUS_RING`, `HOVER` and `TOUCH_TARGET`, and the docs site is the first author outside `src/` (PLAN 4 drew it as part of `./utils`).

Update `docs/STATUS.md`: a "Release" section pointing at this file. Docs only; `pnpm check` still runs `rules:sync --check`.

### R2. The four declaration errors

A dry `tsc` emit fails on declarations in four files (facts 2.3). Add an explicit, exported return type to each hook, built from the repo's own types and React's public types:

| File | Line | Hook | Error |
|---|---|---|---|
| `src/components/tree-view/hook.ts` | 20 | `useTreeView` | TS2883: the inferred type names `csstype` |
| `src/components/otp-field/hook.ts` | 13 | `useOtpField` | TS2883: names Base UI's internal `OTPValidationType` |
| `src/components/field/hook.ts` | 12 | `useFieldLive` | TS4058: names `UNDEFINED_VOID_ONLY` from `@types/react` |
| `src/components/form/hook.ts` | 31 | `useFormAction` | TS4058: same |

The return types go in each component's `types.ts` (R-8.3-4). No behaviour changes, so no test changes; the type tests that exist must still pass. Prove it with a throwaway emit, set up as facts 2.3 did and not committed: a temp config that extends `tsconfig.json` with `module` and `moduleResolution` `NodeNext` (as R4 builds), `noEmit: false`, `declaration: true`, `emitDeclarationOnly: true`, `allowImportingTsExtensions: false`, `rootDir: src`, `outDir` in the scratch folder, `include: ["src"]` and the tests excluded. It must end with no error. Run it in a real checkout, not only through a `node_modules` junction.

### R3. The move to a workspace

Do it in two commits on one branch: first the pure `git mv` (so `git log --follow` keeps history), then the edits.

**Commit 1: git mv, by folder.**

| From (repo root) | To | Command |
|---|---|---|
| `src/` | `packages/react/src/` | `git mv src packages/react/src` |
| `raw/` | `packages/react/raw/` | `git mv raw packages/react/raw` |
| `scripts/` (all of it, `lib/` and `mutations/` included) | `packages/react/scripts/` | `git mv scripts packages/react/scripts` |
| `eslint-rules/` | `packages/react/eslint-rules/` | `git mv eslint-rules packages/react/eslint-rules` |
| `e2e/` (with `fixtures/`) | `packages/react/e2e/` | `git mv e2e packages/react/e2e` |
| `test/` (`setup-dom.ts`) | `packages/react/test/` | `git mv test packages/react/test` |
| `docs/icons.md` | `packages/react/docs/icons.md` | `git mv docs/icons.md packages/react/docs/icons.md` |
| `tsconfig.json` | `packages/react/tsconfig.json` | `git mv` |
| `eslint.config.ts` | `packages/react/eslint.config.ts` | `git mv` |
| `vitest.config.ts` | `packages/react/vitest.config.ts` | `git mv` |
| `playwright.config.ts` | `packages/react/playwright.config.ts` | `git mv` |
| `package.json` | `packages/react/package.json` | `git mv` (a new root one is written in commit 2) |

Create `packages/react/` first (`mkdir -p packages/react packages/react/docs`).

**Stays at the root:** `docs/` (everything else), `.github/`, `.cursor/`, `CLAUDE.md`, `AGENTS.md`, `README.md`, `LICENSE`, `.gitattributes`, `.editorconfig`, `.gitignore`, `.npmrc`, `.node-version`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`.

**Untracked output at the root, deleted, not moved:** `.harness/`, `coverage/`, `test-results/`, `node_modules/`. They regenerate under `packages/react/`. The `.gitignore` patterns (`.harness/`, `test-results/`, `coverage`, `dist`, `node_modules`, `*.tgz`) have no leading slash, so they already match inside `packages/react/`.

**Commit 2: the edits. This is the complete list.**

| File | Change |
|---|---|
| `package.json` (new, root) | `{ "name": "topclassui-repo", "private": true, "type": "module", "packageManager": "pnpm@10.28.2", "engines": { "node": ">=22.14" } }` plus one forwarding script per command in CLAUDE.md, for example `"check": "pnpm --filter topclassui check"`, `"new:component": "pnpm --filter topclassui new:component"`. Same names, so every command in CLAUDE.md still works from the root. |
| `pnpm-workspace.yaml` | Add `packages: ["packages/*", "apps/*"]` above the existing `onlyBuiltDependencies`. |
| `packages/react/package.json` | Remove `packageManager` (root only). Add `"directory": "packages/react"` to `repository`. Add `react 19.3.0`, `react-dom 19.3.0`, `tailwindcss 4.3.3` to `devDependencies` (today they come from pnpm's auto-installed peers at the root; `scripts/lib/harness.ts:20` and `scripts/lib/source-candidates.ts:77` read `node_modules/tailwindcss` from the package folder). Everything else unchanged in this step. |
| `packages/react/scripts/rules-sync.ts` | `ROOT` becomes the repo root, found by walking up from `process.cwd()` to the folder holding `pnpm-workspace.yaml`. `docs/RULES.md`, `CLAUDE.md`, `AGENTS.md` and `.cursor/` stay at the repo root. |
| `packages/react/scripts/mutate.ts:35` | Add `dist` and `.pack` to the skip list beside `node_modules`, `.git`, `.harness` (they exist from R4 on; copying 1,900 build files per mutant is waste). |
| `docs/RULES.md` "Commands" | One line: commands run from the repo root and forward to `packages/react`; paths in the rules (`src/`, `scripts/`) are relative to `packages/react/`. Then `pnpm rules:sync` to regenerate `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/topclassui.mdc`. |
| `pnpm-lock.yaml` | Regenerated by `pnpm install`. Expect importers to move from `.` to `packages/react`; no version may change. Check with `git diff pnpm-lock.yaml`. |
| `.github/workflows/ci.yml` | No change: `pnpm check` and `pnpm test:mutation` at the root forward. `node-version-file: .node-version` is still at the root. |

Nothing else changes: `tsconfig.json`, `eslint.config.ts`, `vitest.config.ts`, `playwright.config.ts`, every script, every test and every mutation keep their text, because their paths are relative to the folder they now sit in.

**Every gate, after the move.**

| Gate | Runs as | Why it still works |
|---|---|---|
| lint, with the 13 custom rules | `eslint .` in `packages/react` | `eslint.config.ts` and `eslint-rules/` moved together; globs are `src/**`, `scripts/**` |
| typecheck | `tsc --noEmit` in `packages/react` | `include` lists folders that moved with it |
| test, the four vitest projects (node, dom, rsc, ssr) | `vitest run` | `scripts/lib/test-projects.ts` patterns are `src/**`; `./test/setup-dom.ts` moved |
| check:structure, check:boundaries, check:css, check:contrast | `tsx scripts/...` | `ROOT = process.cwd()` is the package folder |
| check:icons, icons:build | `tsx scripts/icons-build.ts` | `raw/`, `src/icons` and `docs/icons.md` are all under the package |
| check:readme, readme:build | `tsx scripts/readme-build.ts` | `src/components` under the package |
| test:e2e, harness:build, harness:serve | `pnpm harness:build && playwright test` | Playwright runs `webServer.command` from its config folder; `.harness/` is written there |
| rules:sync | `tsx scripts/rules-sync.ts` | the one script that learns the repo root |
| test:mutation | `tsx scripts/mutate.ts` | copies the package folder and junctions `packages/react/node_modules`, which now holds every dev tool |
| new:component | `tsx scripts/new-component.ts x` | spawns `node_modules/tsx/dist/cli.mjs` from the package folder |

**Verify, in this order:** `pnpm install` at the root; `pnpm check`; `pnpm test:mutation` (the anchors read `src/...` from the package folder); `pnpm new:component zz-probe` then delete the folder; `pnpm test:mutation tag --maxWorkers=2` to prove arguments pass through the forwarder. Report the real output.

**Worktrees.** Each worktree that links `node_modules` to the main checkout now also needs `packages/react/node_modules`. Run `pnpm install` once per worktree, or add the second junction.

### R4. The build

New files in `packages/react/`:

- **`tsconfig.build.json`**: `extends: ./tsconfig.json`; `module: NodeNext`, `moduleResolution: NodeNext`, `noEmit: false`, `allowImportingTsExtensions: false`, `declaration: true`, `declarationMap: false`, `sourceMap: false`, `rootDir: src`, `outDir: dist`; `include: ["src"]`; `exclude: ["src/**/*.test.ts", "src/**/*.test.tsx", "src/**/test/**", "src/test/**"]`. Why `NodeNext` and not the repo's `bundler`: the specifiers we write already carry `.js` (R-5.12-5), but the ones TypeScript writes itself for inferred types do not under `bundler` (`dist/components/toast/constants.d.ts` held `import("../../icons").IconData` six times, and a `node16` consumer failed with TS2834). Under `NodeNext` they become `import("../../icons/types.js")`, the errors are the same four of R2, and the `.js` output is the same as under `bundler` (review, `tsc-nn.log`). `dummy/` is compiled on purpose: the docs app renders it from `dist` (21 Sep "consumes dist" entry).
- **`scripts/build.ts`**, about 60 lines, no dependency:
  1. delete `dist` (`rmSync`);
  2. run `tsc -p tsconfig.build.json`, fail on any error;
  3. rewrite every `'#shared/x'`, `'#components/x'` and `'#icons/x'` string in `dist/**/*.js` and `dist/**/*.d.ts` to a relative path from that file to `dist/shared/x` (and so on), always starting with `./` or `../`. This covers `import`, `export ... from`, `import('...')` and the `import("...").Type` references TypeScript writes into `.d.ts`. Fail on any `#test/` or other `#` specifier left;
  4. copy `src/tokens.css` and `src/styles.css` to `dist/` byte for byte;
  5. fail unless every `dist` file whose source starts with `'use client'` still starts with it (112 today), and `dist/components/icon/index.js` still imports `server-only`.
  `--watch` runs `tsc -w --preserveWatchOutput` and repeats steps 3 to 5 after each "Found N errors" line. `apps/docs` will need it with `next dev`.
- **`scripts/lib/specifiers.ts`** (the pure rewrite) and **`scripts/lib/specifiers.test.ts`**, with expectations written out (R-17-1), for example `dist/components/dialog/client.js` + `#shared/cn.js` gives `../../shared/cn.js`, and `dist/icons/index.d.ts` + `#icons/data/x.js` gives `./data/x.js`. Add one mutation row in `scripts/mutations/` that breaks the depth count.
- **`package.json` scripts:** `"build": "tsx scripts/build.ts"`, `"build:watch": "tsx scripts/build.ts --watch"`; the root forwards both.

Why rewrite instead of pointing `imports` at `dist`: after the rewrite nothing in the tarball depends on the `imports` field, so every resolver reads it, TypeScript's old `node` resolution included, and no tool in the repo needs a custom condition. The alternative is choice C5.

Expected output (facts 2.3, the review): about 967 `.js` and 963 `.d.ts`; JS outside `dummy/` about 670 KB unminified; `.d.ts` about 545 KB; 17 to 30 s; about 933 `#` specifiers rewritten in 422 files. `pnpm build` is not in `pnpm check` yet; R5 puts it there.

### R5. The manifest and the package checks

**`packages/react/package.json`, the published fields**, plus the `exports` object of section 4. `files` relies on npm's `!` negation; `check-pack` proves it worked.

```json
{
  "name": "topclassui",
  "version": "0.0.0",
  "description": "RTL-first, server-first React components for Next.js and Tailwind CSS v4. Beta.",
  "license": "MIT",
  "author": "Omar Abed",
  "homepage": "https://topclassui.com",
  "repository": { "type": "git", "url": "git+https://github.com/TopClassUI/topclassui.git", "directory": "packages/react" },
  "bugs": "https://github.com/TopClassUI/topclassui/issues",
  "type": "module",
  "sideEffects": ["**/*.css"],
  "engines": { "node": ">=20.9" },
  "files": ["dist", "!dist/**/dummy"],
  "publishConfig": {
    "access": "public",
    "imports": {
      "#shared/*": "./dist/shared/*",
      "#icons/*": "./dist/icons/*",
      "#components/*": "./dist/components/*"
    }
  },
  "dependencies": {
    "@base-ui/react": "1.8.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "server-only": "^0.0.1",
    "tailwind-merge": "^3.7.0",
    "zod": "^4.6.5"
  },
  "peerDependencies": { "react": "^19.0.0", "react-dom": "^19.0.0", "tailwindcss": "^4.2.0" }
}
```

- Remove `"private": true`; npm refuses to publish with it. The root `topclassui-repo` stays private.
- `imports` stays as it is for the repo (it points at `src`). `publishConfig.imports` replaces it in the packed manifest, without `#test/*`, so the tarball never names a folder it does not ship. pnpm 10.28.2 applies it (review probe `pc/`); npm ignores it. That is why every check below reads the tarball `pnpm pack` writes, never one `npm pack` writes. After R4, `dist` does not use `imports` at all; the mapping only keeps the manifest true.
- `version` stays `0.0.0` here; Changesets sets it in R8.
- No optional peers: DECISIONS 3 Oct says v0.1 has none. No `bin`: the CLI does not exist.
- `.npmrc` has `save-exact=true`; the caret ranges are typed by hand, and only in `dependencies`.
- Each dependency's own `engines` fits `>=20.9` (checked in the review: `@base-ui/react` needs `>=14`, `clsx` `>=6`, the rest name none; Base UI's `date-fns` peers are optional).
- `README.md`, `LICENSE` and `package.json` are always packed by npm; `CHANGELOG.md` must be added to `files` once it exists (R8).

**New scripts and checks** (each named with its purpose and size; the sizes are each package's own unpacked size from `npm view`, dependencies not counted, facts 2.6):

| Tool | Purpose | Version, size | Default |
|---|---|---|---|
| `publint` | package.json fields agree with the packed files | 0.3.25, 117 KB | add now (devDependency) |
| `@arethetypeswrong/cli` | every entry's types resolve under node16 and bundler | 0.18.5, 59 KB, pulls its own TypeScript | add now |
| `scripts/check-pack.ts` | our own tarball rules (below) | ours, no dependency | add now |
| `scripts/list-entrypoints.ts` | the concrete subpath list attw needs, because it skips patterns with `*` (PLAN 4) | ours | add now |
| `size-limit` + `@size-limit/preset-small-lib` | client JS budgets of PLAN 14 | 14.2.0, 50 KB + 3 KB, pulls esbuild | later (C9) |

- **`check-pack`** runs `pnpm pack --pack-destination .pack`, reads the file list, and fails when: any path is outside `dist/` (bar `package.json`, `README.md`, `LICENSE`, `CHANGELOG.md`); any path contains `/dummy/`, `/test/`, `.test.` or `.map`; any `.js` or `.d.ts` still holds a `#` specifier; any relative specifier in a `.js` or `.d.ts` (`from './x'`, `import('./x')`, `import("./x").T`) does not end in `.js`; the packed `package.json` has an `imports` target outside `dist/`; any `exports` target is missing from the tarball; `dist/styles.css` or `dist/tokens.css` is missing; the tarball is over a size budget (start at 1.5 MB unpacked, then pin to the measured size plus 10 %). Its logic lives in `scripts/lib/pack-checks.ts` with written-out tests.
- **`check:package`** = `pnpm build && tsx scripts/check-pack.ts && attw .pack/topclassui-<version>.tgz --profile esm-only --exclude-entrypoints styles.css tokens.css --include-entrypoints <list> && publint` on the same pnpm pack. `check-pack` writes the tarball first; attw then reads that file, not `--pack .` (which packs with npm and so ignores `publishConfig`). For publint, read the installed version's `--help` and use its option that packs with pnpm, or the one that reads a tarball; write down which in the pull request. Add `check:package` to `check` right after `typecheck`. Cost: about 30 s for the build plus about a minute for the checks; small against 30 minutes.
- **First thing to try in this step:** run attw on the tarball and confirm it passes the `node16` rows. If a row fails on a specifier without `.js`, R4's `NodeNext` setting is missing.
- `"prepublishOnly": "pnpm check:package"`: a guard for anyone who publishes from the folder. The runbook publishes the checked tarball instead.

### R6. Imports in READMEs and shipped strings

The bare `'topclassui'` is pinned in more places than the READMEs. Counted on 9fb1288, outside `dummy/`: 2 generators, 1 mutation row, 32 test files and 30 hand-written README blocks. Change them in one pull request, in this order.

- **The generators.** `scripts/lib/readme.ts:137` (`singleImport`) and `scripts/lib/readme-parts.ts:30` (`familyImport`) write `import { X } from 'topclassui'`, a root barrel that does not exist (PLAN 4: "There is no root barrel file"). Change both to `'topclassui/<slug>'` from `meta.slug`. Update `scripts/lib/readme-parts.test.ts:36,116,126`.
- **The mutation row.** `scripts/mutations/scripts.ts:105` writes `` from 'topclassui'` `` as its `to:`. Rewrite its `from:` and `to:` to the new generator text, or the row no longer applies and `pnpm test:mutation` fails on it.
- **The hand-written README blocks.** 30 READMEs import from `'topclassui'` between the `<!-- hand-written -->` markers, which `readme:build` never rewrites. Edit them by hand. A line that imports names from two folders becomes two lines: Sidebar's `import { Icon, SidebarBody, ... } from 'topclassui'` becomes `import { Icon } from 'topclassui/icon'` and `import { SidebarBody, ... } from 'topclassui/sidebar'`. Then run `pnpm readme:build`; all 52 component READMEs change.
- **The compile tests.** 29 `*.compile.test.ts` files type-check the README samples. 28 of them do `code.replace("'topclassui'", "'../index.js'")`; Sidebar maps names through its own `HOME` table. After this step that replace matches nothing, and once R5 adds `exports`, TypeScript resolves `'topclassui/<slug>'` as the package importing itself, into `dist/`: the tests would check stale build output, or fail when `dist` is missing. Add one helper, `src/test/samples.ts`, `importsFromRepo(code)`: it rewrites every `'topclassui/<x>'` to `'#components/<x>/index.js'` and throws when any `'topclassui` specifier is left. All 29 tests call it, and Sidebar's `HOME` table goes. Give the helper a test with written-out expectations (R-17-1).
- **The pinned expectations.** Update the expected strings in those 29 tests (for example `accordion.compile.test.ts:92`) and in `code-block/test/code-block.demos.dom.test.tsx:15` and `code-block.demos.ssr.test.tsx:72`.
- `src/components/icon-registry/index.tsx:35` tells users `import { x } from 'topclassui/icons/<name>'`, which R5 makes true. Line 37 tells them to run `npx topclassui icons scan`, which does not exist: drop that line until the CLI ships, and update any test that pins the message.
- Demos are not shipped, so `dummy/` text (`code-block/dummy/highlighted.tsx`, `no-header.tsx`, `accordion/dummy/first-open.tsx`) changes only where it shows `from 'topclassui'`; make those subpaths too.

### R7. Two consumer apps, built from the tarball

This is the proof PLAN 19 Phase 7 asks for: "the package installs and works in a fresh Next.js app ... and `tsc --noEmit` in that app reports `<Button variant="nope" />` as an error".

- **`packages/react/consumers/next/`**: `package.json` (no versions of ours), `next.config.ts` (empty), `postcss.config.mjs` (`@tailwindcss/postcss`), `tsconfig.json` (create-next-app's), `app/globals.css` (the three imports of section 5), `app/layout.tsx` (provider and theme script, `lang="ar" dir="rtl"`), `app/page.tsx` (a Server Component with `Button`, `<Icon name="check">` from `topclassui/icon`, `Badge`, and a client `DialogRoot`), and `app/type-check.tsx` holding `// @ts-expect-error` above `<Button variant="nope" />`.
- **`packages/react/consumers/vite/`**: React 19 SPA with `@vitejs/plugin-react` and `@tailwindcss/vite`, `src/index.css` with the same three imports, `src/main.tsx` rendering the provider, `Button`, `DialogRoot`, and `Icon` from `topclassui/icon-registry` with `registerIcons`, plus the same `@ts-expect-error` file.
- **`packages/react/scripts/consumer-smoke.ts`** (`pnpm test:consumers`, forwarded from the root): runs `check:package`; copies each template to a fresh temp folder; `npm install` the tarball plus `next react react-dom tailwindcss @tailwindcss/postcss typescript @types/react` (or the Vite set) from the registry; runs `tsc --noEmit` (must pass, so the `@ts-expect-error` proves the bad variant is an error); runs `next build` / `vite build`; then reads the built CSS and fails unless it contains a utility only the library writes (for example the class of Button's focus ring from `shared/classes.ts`). That last check is the only proof that `@source` works from `node_modules`: the harness compiles CSS from a candidate list and never scans files.
- Uses `npm`, because the site documents `npm` (DECISIONS 2 Oct point 2). Needs the network. First run 5 to 10 minutes (Next is about 193 MB), later runs use the npm cache. Not in `pnpm check`: it is run before every publish (C16). Ports 4610 and up if a server is ever started.
- Add `consumers` to `ignores` in `eslint.config.ts`; `tsconfig.json` does not include it already.
- **Expected findings to settle here:** whether Tailwind accepts `@source "./connectors"` with no `dist/connectors/` (if not, the build writes `dist/connectors/.keep`); whether `@source not "./**/*.d.ts"` in `styles.css` is worth adding (Tailwind 4.3.3 parses negated sources, `src/sources.test.ts` already reads `negated`); the Vite build's `'use client'` "module level directive" warnings (expected, harmless; `@topclassui/vite` was planned to silence them).

### R8. Version, changelog, README, license

- **Changesets** (`@changesets/cli` 3.0.3, 89 KB own size plus its dependencies; report the lockfile growth). Root devDependency. `.changeset/config.json`: `baseBranch: "main"`, `access: "public"`, `privatePackages: { version: false, tag: false }`, `changelog: "@changesets/cli/changelog"`. Then `pnpm changeset pre enter beta`, and one `minor` changeset for `topclassui` that lists what 0.1.0 holds. `pnpm changeset version` turns `0.0.0` into `0.1.0-beta.0` and writes `packages/react/CHANGELOG.md`. From here on every pull request that changes the package adds a changeset (PLAN 20, "A changeset is added").
- **`packages/react/README.md`**, short, the npm page: one line on what it is; a beta notice ("0.x: breaking changes can land in a minor, each listed in CHANGELOG.md with a migration note", PLAN 17.4); install; the three CSS lines; the layout with `TopClassProvider` and `ThemeScript`; one example; the import list (`topclassui/<component>`, `/provider`, `/theme`, `/labels/en`, `/icons/<name>`); the Vite note (use `topclassui/icon-registry`, not `topclassui/icon`); links; license. The text of the snippets is section 5.
- **`packages/react/LICENSE`**: a copy of the root MIT `LICENSE` ("Copyright (c) 2026 TopClassUI"). npm only packs the license inside the package folder.
- Root `README.md` (two lines today): what the repo holds, `pnpm install`, `pnpm check`, where the package lives.
- Gate: `pnpm check` and `pnpm test:consumers`, both green, real output in the pull request.

### R9. The publish runbook (owner, on the laptop)

Do this once, slowly. Nothing here is automated.

**Use Git Bash, not PowerShell.** The commands below are bash: Windows PowerShell 5.1, the laptop's default, has no `&&` and no `head`. Git Bash comes with Git for Windows and is already on the laptop. Open it in the repository folder.

**A. Account and organisation (once, about 20 minutes).**
1. Create an account at https://www.npmjs.com/signup. Verify the email.
2. Turn on two-factor authentication with a security key or a passkey (WebAuthn), mode "Authorization and writes". Save the recovery codes offline. npm no longer lets a new account set up an authenticator-app code (TOTP); it is being phased out ([GitHub changelog, 10 Oct 2025](https://github.blog/changelog/2025-10-10-strengthening-npm-security-important-changes-to-authentication-and-token-management)).
3. Create the free organisation `topclassui`: https://www.npmjs.com/org/create, plan "Unlimited public packages" (free). The unscoped package does not need it; it reserves the scope `@topclassui/` for `@topclassui/next` and `@topclassui/vite`, which the plan still names.
4. In a terminal: `npm login` (it opens the browser), then `npm whoami` prints your user name.

**B. Dry run (about 15 minutes).**
1. `git switch main && git pull`, clean tree, the R8 commit is on `main`.
2. `pnpm install`, then `pnpm check` (green), then `pnpm test:consumers` (green).
3. `npm view topclassui` must still say `E404`. If someone took the name, stop: the name is the one thing that cannot be changed after publishing.
4. Pack exactly what will ship: `cd packages/react && pnpm pack --pack-destination ../../.pack`.
5. Look inside: `tar -tzf ../../.pack/topclassui-0.1.0-beta.0.tgz | head -50` and `npm publish ../../.pack/topclassui-0.1.0-beta.0.tgz --dry-run --tag beta`. Expect `package/package.json`, `README.md`, `LICENSE`, `CHANGELOG.md`, `dist/...` and nothing else: no `src/`, no `test`, no `dummy`, no `.map`. Read the name, version, file count and unpacked size it prints.

**C. Publish (5 minutes).**
```sh
npm publish ../../.pack/topclassui-0.1.0-beta.0.tgz --tag beta --access public
```
npm prints an approval URL (or opens it in the browser). Open it, approve with your passkey or security key, and npm finishes the publish. If npm prints any other next step, do what it says and note it for R10. Publishing the `.tgz` publishes exactly what you inspected; it does not rebuild.

**D. Check right after (15 minutes).**
1. `npm view topclassui` shows `0.1.0-beta.0`; `npm dist-tag ls topclassui` shows `beta: 0.1.0-beta.0`. If it also shows `latest: 0.1.0-beta.0`, that is npm giving a new package a `latest`; it is harmless, because there is no other version.
2. Open https://www.npmjs.com/package/topclassui: the README renders, the license says MIT, the repository link works (it 404s for visitors while the repo is private).
3. In an empty folder outside the repo: `npx create-next-app@latest probe --ts --app --tailwind --eslint --no-src-dir --use-npm`, then `cd probe && npm i topclassui@beta zod`, paste the three CSS lines into `app/globals.css`, the provider into `app/layout.tsx`, `<Button>Hi</Button>` into `app/page.tsx`, run `npm run build && npm start`, open http://localhost:3000 and see a styled button. Add `<Button variant="nope" />` and see `npx tsc --noEmit` fail.
4. Tag the commit: `git tag topclassui@0.1.0-beta.0 && git push origin topclassui@0.1.0-beta.0`.

**E. Undo, if something is wrong.**
- **First choice, always:** fix, then publish `0.1.0-beta.1` the same way, and mark the bad one: `npm deprecate topclassui@0.1.0-beta.0 "Broken, use 0.1.0-beta.1"`. Deprecating keeps installs working and is reversible (`npm deprecate topclassui@0.1.0-beta.0 ""`).
- **Within 72 hours only, and only for a leaked secret or a broken tarball:** `npm unpublish topclassui@0.1.0-beta.0`. npm allows it in the first 72 hours when no other package depends on it. That version number can never be used again. Unpublishing the only version removes the whole package, and no version of it can be published for the next 24 hours; anyone could register the name in between. So unpublish the whole package only if the name itself must go.
- A wrong tag is not a reason to unpublish: `npm dist-tag add topclassui@<version> beta` or `npm dist-tag rm topclassui <tag>`.

### R10. After the publish

One DECISIONS entry: the published version, the date, the tarball's file count and size, what the probe app showed, and that this release has no provenance. STATUS: "On npm: `topclassui@0.1.0-beta.0` (beta tag)". The install line on the site and in the docs is `npm i topclassui@beta zod` until 0.1.0 is on `latest`, then `npm i topclassui zod`.

### Later, not in this plan's pull requests

- **0.1.0 on `latest`.** When the docs site ships and its Getting Started page passes the probe test (PLAN 19 Phase 7): `pnpm changeset pre exit`, `pnpm changeset version`, publish with `--tag latest`.
- **Trusted publishing and provenance.** Make the repository public; confirm GitHub-hosted runners run for a public repo despite the billing block; `npm trust github topclassui --repo TopClassUI/topclassui --file release.yml --allow-publish` (the package exists now, which is what the 25 Sep entry needed the hand-published first version for); add `release.yml` on Node 24 as PLAN 17.4 describes. Needs npm 11.5.1 or newer, which does not install on Node 22.14; the laptop has npm 10.9.2, which is fine for publishing by hand.
- **size-limit** after STATUS open question 6.
- **`apps/docs`**: its own plan. It depends on `"topclassui": "workspace:*"`, runs `pnpm --filter topclassui build:watch` beside `next dev`, renders demos from `dist/components/*/dummy/` (present in the workspace, absent from the tarball), and the root `check` gains `pnpm --filter docs check`.

---

## 4. The exports map

Concrete subpaths first, patterns last. `types` first in every condition object. No root `"."`: `import 'topclassui'` fails on purpose (PLAN 4).

```json
"exports": {
  "./package.json": "./package.json",
  "./styles.css": "./dist/styles.css",
  "./tokens.css": "./dist/tokens.css",
  "./provider": { "types": "./dist/shared/provider/provider.d.ts", "default": "./dist/shared/provider/provider.js" },
  "./theme": { "types": "./dist/shared/theme/theme-script.d.ts", "default": "./dist/shared/theme/theme-script.js" },
  "./cn": { "types": "./dist/shared/cn.d.ts", "default": "./dist/shared/cn.js" },
  "./classes": { "types": "./dist/shared/classes.d.ts", "default": "./dist/shared/classes.js" },
  "./labels/*": { "types": "./dist/shared/labels/*.d.ts", "default": "./dist/shared/labels/*.js" },
  "./icons": { "types": "./dist/icons/index.d.ts", "default": "./dist/icons/index.js" },
  "./icons/*": { "types": "./dist/icons/data/*.d.ts", "default": "./dist/icons/data/*.js" },
  "./schemas/*": { "types": "./dist/components/*/schema.d.ts", "default": "./dist/components/*/schema.js" },
  "./meta/*": { "types": "./dist/components/*/meta.d.ts", "default": "./dist/components/*/meta.js" },
  "./*": { "types": "./dist/components/*/index.d.ts", "default": "./dist/components/*/index.js" }
}
```

- **Client entries.** No separate client export is needed. `topclassui/dialog` resolves to `dist/components/dialog/index.js`, which re-exports from `./client.js`, whose first line is still `'use client'` (all 112 client files, facts 2.3). That file is where Next.js draws the boundary. `TopClassProvider` (`provider.js`) starts with `'use client'` the same way.
- **The server-only entry.** `topclassui/icon` is the async `<Icon name>`; its `index.js` imports `server-only`, so importing it from a client file fails the build, as intended (R-5.1-5). Browser-only apps use `topclassui/icon-registry` (sync `<Icon>` and `registerIcons`) and `topclassui/icons/<name>` for the data. `topclassui/svg` works everywhere.
- **The CSS files.** Plain string targets, so Tailwind's resolver (which asks for the `style` condition) and every bundler resolve them. `sideEffects: ["**/*.css"]` keeps them from being dropped.
- **Pattern precedence.** Node picks the longest matching key, so `topclassui/icons/check` hits `./icons/*`, `topclassui/labels/ar` hits `./labels/*`, and `topclassui/button` hits `./*`. The exact key `./icons` stops `./*` from sending `topclassui/icons` to a missing `dist/components/icons/`.
- **Left out of 0.1.0:** `./adaptive` and `./connectors/*` (connectors are tier 2; `src/connectors/` holds only a README), `./demos/*` (PLAN 4's name; demos are `dummy/` and not shipped), `./utils` (PLAN 4's name; nothing in `src/shared/` is called that, so its two halves are `./cn` and `./classes`).
- **attw list.** `scripts/list-entrypoints.ts` prints `provider theme cn classes labels/en labels/ar labels/get-labels labels/types icons icons/check` plus one entry per folder in `src/components/` that has an `index.tsx` (52 today), plus `schemas/button` and `meta/button` as samples.

---

## 5. How an app uses it

**Next.js 15 or 16 (App Router).**

```sh
npm i topclassui@beta zod
npm i -D tailwindcss @tailwindcss/postcss
```

`app/globals.css` (the order is the one `tokens.css` line 1 asks for):

```css
@import "tailwindcss";
@import "topclassui/tokens.css";
@import "topclassui/styles.css";
```

`app/layout.tsx` (direction and locale come from the layout, never from `document.dir`, R-13-1):

```tsx
import { TopClassProvider } from 'topclassui/provider'
import { ThemeScript } from 'topclassui/theme'
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head><ThemeScript /></head>
      <body>
        <TopClassProvider direction="ltr" locale="en">{children}</TopClassProvider>
      </body>
    </html>
  )
}
```

`app/page.tsx`:

```tsx
import { Button } from 'topclassui/button'
import { Icon } from 'topclassui/icon'

export default function Page() {
  return <Button tone="primary"><Icon name="check" /> Save</Button>
}
```

No `transpilePackages`: the package is plain ESM JavaScript. `zod` is a dependency of the package too; naming it in the install line puts it in your own `package.json`, so your code can import it for your own schemas (DECISIONS 2 Oct point 1, R-8.3-1).

**Vite with React 19 (tier 2).** Same install with `@tailwindcss/vite` instead of the PostCSS plugin, the same three CSS lines, `TopClassProvider` around the app in `main.tsx`, and icons through the registry:

```tsx
import { Icon, registerIcons } from 'topclassui/icon-registry'
import { check } from 'topclassui/icons/check'

registerIcons({ check })
```

`topclassui/icon` imports `server-only` and is for Server Components only. Vite prints a "module level directive" warning for each `'use client'` file; it is harmless.

R7 builds exactly these two setups from the packed tarball before every publish.

---

## 6. Versioning and what 0.1.0-beta.0 holds

- Semver, 0.x: a breaking change may land in a minor, always with a migration note in the changelog (PLAN 17.4).
- Pre-release line: `0.1.0-beta.0`, `0.1.0-beta.1`, ... on the `beta` tag, through Changesets pre mode. `0.1.0` goes to `latest` with the docs site.
- **Content:** the 52 component entries (every one `status: 'beta'`, STATUS), the provider, the theme script, the English and Arabic labels, `cn`, the class constants (`topclassui/classes`), the 84 icons as modules, `tokens.css` and `styles.css`, the schemas and the meta files.
- **Not in it:** the CLI (`npx topclassui add`), connectors, `@topclassui/next`, `@topclassui/vite`, size budgets, provenance, `stable` status for any component (PLAN 20 needs the visual matrix, the docs page and Figma parity).

---

## 7. What can go wrong, and the answer

| Risk | Answer |
|---|---|
| A `#shared/...` specifier survives in `dist` and breaks every consumer | `scripts/build.ts` fails on it; `check-pack` fails on it again; R7 builds two real apps |
| A component renders unstyled in a consumer app | R7 fails unless the consumer's built CSS holds a library-only utility |
| `'use client'` lost or moved | `scripts/build.ts` compares the first line of every client file |
| Demo classes leak into every consumer's CSS | `dummy/` is not packed; `check-pack` fails on any `/dummy/` path |
| A test or source file ships | `files` is `dist` only; `check-pack` fails on `.test.`, `/test/`, `src/` |
| Stale `dist` published | the runbook publishes the tarball `check:package` just built; `prepublishOnly` guards the folder path |
| The name is taken before the first publish | the runbook checks `npm view topclassui` right before; publish soon after R8 |
| R3 breaks a gate quietly | the gate table in R3, plus a full `pnpm check` and a full `pnpm test:mutation` |
| A README compile test quietly checks `dist` instead of `src` (the package importing itself) | `importsFromRepo` in R6 maps every `'topclassui/<x>'` and throws on any left |
| A `node16` consumer cannot read a `.d.ts` | R4 emits with `NodeNext`; `check-pack` fails on a relative specifier without `.js`; attw reads the pnpm tarball |
| The laptop runs short of memory | gates run one at a time as today; the consumer builds run one after the other, never beside Playwright |

---

## 8. The owner's choices

Each row is built as its "Default" unless the owner says otherwise before the step named.

| # | Choice | Default (what gets built) | Alternative | Decide before |
|---|---|---|---|---|
| C1 | Repository layout | pnpm workspace; one package in `packages/react/`; `apps/docs` later | (a) keep the library at the root and add `apps/docs` beside it: no move, but the tarball folder is also the repo root; (b) three packages as PLAN 4 draws (section 9) | R1 |
| C2 | What 0.1.0 ships | all 52 component entries as subpaths | zero components, CLI only (DECISIONS 2 Oct point 4): nothing usable until the CLI exists | R1 |
| C3 | Package name | `topclassui`, unscoped | `@topclassui/react` | R1 |
| C4 | Version and tag | `0.1.0-beta.0` on `beta`; `0.1.0` on `latest` with the docs site | `0.1.0` on `latest` now, beta stated in the README only | R8 |
| C5 | `#shared/*` in the published code | rewritten to relative paths by the build | conditional `imports` (`"#shared/*": { "topclassui-source": "./src/shared/*", "default": "./dist/shared/*" }`) with that condition set in tsconfig, Vite, Vitest, tsx and Playwright; `module-graph.ts:7-13` must learn object values | R4 |
| C6 | Task runner | none, `pnpm --filter` | Turborepo 2.11.9 (765 KB plus a platform binary) | when `apps/docs` lands |
| C7 | Changelog | Changesets 3.0.3 (89 KB own) | a hand-written `CHANGELOG.md` and `npm version` | R8 |
| C8 | Package checks | publint, attw and `check-pack` inside `pnpm check` (about 1.5 min more) | run them only before a release | R5 |
| C9 | Size budgets | later, after STATUS open question 6 | size-limit 14.2.0 now (pulls esbuild) | R5 |
| C10 | Source maps and `src` in the tarball | neither: smaller, no broken maps | ship `src` (without tests) and the maps, as PLAN 4's `"files": ["dist", "src"]` | R4 |
| C11 | Dependency ranges | Base UI exact `1.8.0`, the rest caret | all exact (today) / all caret | R5 |
| C12 | Published `engines.node` | `>=20.9` (Next.js 16's floor); repo keeps `>=22.14` | `>=22.14` everywhere | R5 |
| C13 | Provenance | none for the betas; hand publish | make the repo public and run Actions first, then publish through `release.yml` | R9 |
| C14 | Who owns it on npm | Omar's personal account, 2FA on; org `topclassui` created to hold the scope | publish under a team account | R9 |
| C15 | License | MIT, as `LICENSE` says | none other planned (PLAN O4) | R8 |
| C16 | Consumer smoke test | before every publish, not in `pnpm check` (needs the network, minutes) | inside `pnpm check` | R7 |
| C17 | Demos (`dummy/`) | compiled into `dist` for the docs app, not packed | not compiled at all (the docs app would need another way to load them) | R4 |
| C18 | The shared class constants (`FOCUS_RING`, `HOVER`, `TOUCH_TARGET`, ...) | public as `topclassui/classes`, so the docs site and users' own components follow the same lint rule | private; the site copies the strings it needs into its own `classes.ts` | R5 |
| C19 | The install line | `npm i topclassui@beta zod` during the betas, then `npm i topclassui zod` (DECISIONS 2 Oct) | `npm i topclassui@beta`, since `zod` installs with the package anyway | R8 |

---

## 9. The alternative: three packages, as PLAN 4 draws

If the owner picks C1 (b), R3 grows and two more packages are published:

| From | To | Extra edits |
|---|---|---|
| `src/tokens.css` | `packages/tokens/src/index.css` (`@topclassui/tokens`, `style` export, PLAN 4) | `check-css` (R-4-2: every `--tc-*` used in react must be declared in tokens) and `check-contrast` read `../tokens/src/index.css`; `contrast-checks.test.ts`, `token-refs.test.ts`, `tokens.test.ts`, `css-comments.test.ts` change paths; the harness entry in `scripts/lib/harness.ts:14` changes |
| `raw/`, `src/icons/`, `scripts/icons-build.ts`, `scripts/lib/icons*.ts`, `docs/icons.md` | `packages/icons/` (`@topclassui/icons`) | 200 `#icons/` import lines become `@topclassui/icons/...`; `icon` and `icon-registry` depend on it; the ESLint rule that keeps the loader map server-side follows the new name; its own build and exports |
| everything else | `packages/react/` (`@topclassui/react`) | depends on `@topclassui/icons` and peers on `@topclassui/tokens` (PLAN 4); Changesets `fixed` group for the three |

Cost: about a day more, three READMEs, three publishes, a scoped install line (`npm i @topclassui/react @topclassui/tokens`), and it reverses DECISIONS 2 Oct point 1 ("the install line is `npm i topclassui zod`"). Gain: icons usable without React, tokens usable without the components. Nobody needs either today, so the default is one package.
