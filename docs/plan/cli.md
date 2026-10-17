# CLI plan: `npx topclassui add button`

Written 17 October 2026 against `docs/release-and-site-plan` at f85fe1f (all 46 components on `main` at ab61575). Inputs: `docs/plan/release.md`, `docs/figma/docs-site.md` (page 3, "Add with the CLI"), `docs/DECISIONS.md` (25 Sep "The registry CLI", 25 Sep "Two ways to install", 2 Oct "One package named `topclassui`", the TypeScript-only entry), `docs/STATUS.md` (open question 1), `docs/PLAN.md` 4 and 21, the source under `src/`, the published `shadcn@4.22.0` and `next@16.4.2` tarballs, and the shadcn-ui/ui repository at d2fba50 (16 Oct 2026).

This plan is for a builder with no memory. It follows the shape of `docs/plan/release.md`: the facts first, then the design, then the build order, then the owner's choices with a default each. Each step is one branch and one pull request and ends with a green `pnpm check`. Nothing here is built yet.

---

## 0. Read this first

1. **The CLI comes after the release plan, not instead of it.** `docs/plan/release.md` ships 0.1.0-beta.0 with all 52 component entries as subpaths (its C2), reversing DECISIONS 2 Oct point 4. So the CLI is no longer the only way to get a Button; it is the way to **own** one. That is the 25 Sep "Two ways to install" decision, which the release plan brought back.
2. **What it is:** `npx topclassui init` once, then `npx topclassui add <slug>`. Each `add` copies a component's source, the components it imports and the shared files they need into one `topclassui/` folder in the consumer's project. After that, nothing in the copied tree imports the `topclassui` package.
3. **The defaults in one line.** The CLI ships inside the `topclassui` package as a `bin`, with no runtime dependency. The component sources travel in the same tarball, as registry JSON generated at build time, so the CLI makes no network call of its own. Imports are rewritten to relative paths. A lock section in `topclassui.json` records a hash of every file written, so `add` and `diff` can tell your edits from upstream changes.
4. **It settles STATUS open question 1 the other way from its recommendation.** STATUS recommended that copied components import `shared/` from the package. This plan copies `shared/` too (section 3.3, choice K2). The reason: two copies of the provider context would silently disagree (fact F9).
5. **Every departure from DECISIONS goes into one entry in step K1, before any code.** CLAUDE.md requires it. The departures are listed in K1.
6. **Not verified yet, and checked in the step named:**
   - whether Turbopack (Next.js 16's default bundler) resolves a `./x.js` specifier to `x.ts` (K7; the design does not depend on it, because it strips `.js`);
   - whether `vite build` warns once per copied `'use client'` file (K7; the design strips the directive in Vite projects anyway);
   - whether `npx shadcn add https://topclassui.com/r/button.json` accepts our item JSON as it is (later, with the site; section 3.8).

---

## 1. The facts

Measured on 17 October 2026 with a throwaway script over `src/`; it is not committed. The script followed every `import`, `export ... from` and `import()` specifier, type-only imports included, because a copy must type-check. It resolved `#shared/`, `#icons/`, `#components/` and relative paths to files, and left out `test/`, `*.test.*`, `README.md`, `meta.ts` and `dummy/`, which section 3.3 treats separately.

### F1. The copy closure of each component

| Measure | Value |
|---|---|
| Component folders with an `index.tsx` | 52 (the site's 46 plus `field`, `form`, `meter`, `icon`, `icon-registry`, `svg`) |
| Own files, all 52, without tests, demos, meta, README | 391 files, 653 KB |
| Demo files (`dummy/`), all 52 | 391 files, 331 KB |
| Everything every component reaches (own + shared + icons) | 515 files, 790 KB |
| …of which `shared/` | 37 of the 43 non-test files, 88 KB (all 43, minus `meta.ts`: 99 KB) |
| …of which `icons/` | 87 files, 49 KB (84 icon data files, `types.ts`, the generated tables) |
| Smallest closure | `svg`: 6 files, 4.5 KB |
| Median closure | 41.9 KB (`code-block`) |
| Largest closure | `combobox`: 39 files, 97 KB; `date-picker` 94 KB; `command` 92 KB |
| `icon` (the async server one) | 95 files, 55 KB: its loader map reaches all 84 icons |
| Files that start with `'use client'` (outside tests and demos) | 105 |
| `#shared/`, `#icons/`, `#components/` specifiers outside tests | 1,559 |

Examples: `button` is 20 files and 40 KB (its own 8, `svg`, 8 shared files, 2 icon files); `dialog` is 31 files and 68 KB (its own 7, `svg`, 20 shared files, `icons/data/x.ts`).

### F2. Dependencies between components

The non-demo code has very few cross-component imports:

- 28 components import only `svg`.
- `avatar-group` imports `avatar`.
- `toast` imports `button` and `svg`.
- `icon-registry` imports `icon` and `svg`.
- The remaining 20 import no other component.

Nothing is circular. The demos are another matter: `dummy/` files import `button` 119 times, `svg` 50 and `input` 18. The demos of `select` reach six other components (button, checkbox, number-field, radio-group, slider, switch), and those of `dialog` reach four (button, input, svg, tooltip). Copying every demo would turn `add select` into `add` seven components.

### F3. npm packages the copies need

Counted over the 52 closures:

| Package | Needed by | Note |
|---|---|---|
| `react`, `react-dom` | 52, 1 | peers, already in the app |
| `clsx`, `tailwind-merge` | 52 | through `shared/cn.ts` |
| `zod` | 43 | `schema.ts`, imported `import type` (R-8.3-1), so it is a type-check dependency; `zod/mini` at runtime where a client file validates |
| `@base-ui/react` | 27 | exact `1.8.0`, as every `meta.ts` `baseUiRange` says |
| `class-variance-authority` | 8 | `alert`, `badge`, `banner`, `button`, `input`, `pagination`, `tag`, `toast` |
| `server-only` | 1 | `icon` only |

### F4. Strings in shipped code that name the package

- `components/icon-registry/index.tsx:35` prints `import { x } from 'topclassui/icons/<name>'` in its development warning. Line 37 tells the reader to run `npx topclassui icons scan`.
- `components/code-block/dummy/highlighted.tsx` shows `import { CodeBlock } from 'topclassui'` as sample text.

In a copy, both point at a package the consumer may not have.

### F5. How big a registry is

Each component was written as one shadcn-shaped item JSON (`files[].content` inline, demos included), plus one `base` item (all of `shared/` and `icons/`, `tokens.css` and `styles.css`).

| Item | Raw | gzip |
|---|---|---|
| `button.json` | 20.8 KB | 5.3 KB |
| largest, `command.json` | 46.9 KB | not measured |
| all 52 components, summed | 1,118 KB | 313 KB |
| `base.json` (134 files) | 182 KB | 47 KB |
| the whole registry folder, `tar czf` | 1.3 MB raw | 323 KB |

For comparison, the release plan's tarball is 318 KB packed and 1.17 MB unpacked (release.md section 0, point 6).

### F6. What `npx topclassui` downloads today

npx installs the package and its `dependencies` into its cache before it runs a `bin`. Unpacked sizes from the registry:

| Package | Unpacked |
|---|---|
| `@base-ui/react` 1.8.0 | 9.6 MB, plus `@base-ui/utils` 0.3 MB and floating-ui |
| `zod` 4.6.5 | 6.1 MB |
| `tailwind-merge` 3.7.0 | 1.1 MB |
| `class-variance-authority` 0.7.1 | 22 KB |
| `clsx` 2.1.1 | 9 KB |
| `server-only` 0.0.1 | 1 KB |

That is about 17 MB on the first `npx topclassui`. Every package in that list is one the copied code needs anyway (F3). A project that already ran `npm i topclassui` runs the local `bin` with no download. Neither `topclassui` nor `topclassui-cli` is on npm today (both return 404).

### F7. How shadcn's CLI works today (shadcn@4.22.0, 16 Oct 2026)

These facts come from the published tarball and the repository at d2fba50; none of its code was run. The CLI is 217 KB unpacked with about 35 dependencies (Babel, recast, ts-morph, postcss, commander, prompts, execa and more). Most of the logic moved out of `packages/shadcn` into a new workspace package, `@shadcn/registry` 0.2.0 (678 KB).

**Commands.**
- `init` (also `create`); `add`, with `-y`, `-o/--overwrite`, `-c/--cwd`, `-a/--all`, `-p/--path`, `-s/--silent`, `--dry-run`, `--diff`, `--view`.
- `diff` still exists but is deprecated ("Use `add [component] --diff` instead", `diff.ts:43`).
- `view`; `search` (alias `list`, with `--json`); `build`; `migrate`; `info`; `registry add|build|validate`.
- `init -y` defaults to true, and the `--src-dir` flag is gone.

**`components.json`.** `style`, `rsc`, `tsx`, `tailwind {config, css, baseColor, cssVariables, prefix}`, `aliases {components, utils, ui, lib, hooks}`, and `registries` keyed by `@namespace`, each a URL template with `{name}`, or `{url, params, headers}` with `${ENV}` expansion for private registries. The schema is `.strict()`.

**Registry item** (`packages/registry/src/registry/schema.ts`).
- Fields: `name`, `type`, `files[] {path, content, type, target}`, `dependencies`, `devDependencies`, `registryDependencies`, `cssVars`, `css`, `envVars`, `meta`, `docs`, `categories`.
- Types: `registry:ui`, `lib`, `hook`, `file`, `page`, `block`, `component`, `theme`, `style`, `item`, `base`, `font`.
- `target` is required for `registry:file`; a target starting with `~/` resolves from the project root.
- The built-in registry is `https://ui.shadcn.com/r/styles/{style}/{name}.json`.
- A URL, a local path or a GitHub `owner/repo/item` also works. A private GitHub registry needs `GH_TOKEN` or `gh` auth.

**Detection** (`get-project-info.ts`).
- Framework: it globs config files to depth 3 and tests them in order. `next.config.*` gives next-app if `(src/)app` exists (which also sets RSC), else next-pages. Then astro, gatsby, laravel, remix, tanstack-start, react-router, vite.
- Tailwind is v3 if package.json matches `^~?3`, else v4.
- The CSS entry is the first `*.css` file to depth 5 containing `@import "tailwindcss"`.
- The alias is read from tsconfig paths, falling back to `tsconfig.app.json`.
- package.json `#imports` are supported.
- The package manager comes from `@antfu/ni` `detect` (lockfiles first), then `npm_config_user_agent`.

**Transforms.**
- They parse with `@babel/parser` and apply string edits; ts-morph is no longer used there.
- `transform-import.ts` rewrites `@/registry/<style>/ui|lib|hooks` to the configured aliases.
- `transform-rsc.ts` strips `"use client"` only when `rsc` is false. A known `/g` regex bug makes it skip every other file.

**Dependencies.** `resolveRegistryTree` recurses through `registryDependencies` with a visited set and sorts the result topologically. npm packages are installed with execa.

**CSS.** postcss updaters write `cssVars` into `:root`, `.dark` and `@theme inline`, and `css` rules into the CSS entry. Existing variables are kept unless overwriting.

### F8. Next.js and `.js` specifiers

The library writes `./constants.js` for `constants.ts` (R-5.12-5). TypeScript resolves that under every `moduleResolution`. webpack does not, unless `resolve.extensionAlias` maps `.js` to `.ts`. In `next@16.4.2`, `dist/build/webpack-config.js` sets `extensionAlias: config.experimental.extensionAlias`, so it is off unless the app opts in. Turbopack's behaviour is in the native binary and was not checked. The `create-next-app` and `create-vite` (react-ts) templates both use `moduleResolution: "bundler"`, which accepts extensionless relative specifiers. The Vite template has no `@/*` path alias at all.

### F9. Two providers cannot see each other

Copied components read `TopClassContext` from the copied `shared/provider/context.ts`. A project that also imports `TopClassProvider` from the package mounts a different context object. The copies would then fall back to their defaults: English labels, `ltr`, no numbering system. React raises no error and TypeScript reports nothing. The same holds for `OverlayScopeContext` and the toast manager in `shared/toast/manager.ts`.

### F10. What the repo already has to build on

- `scripts/lib/module-graph.ts`: the import regexes and `blankComments`, used by `check-boundaries`.
- `scripts/lib/specifiers.ts` (release R4): the `#shared/x` to `../../shared/x` rewrite, written and tested for `dist/`.
- `scripts/new-component.ts`: how the repo spawns `tsx` from a script.
- `check-structure`'s `ALLOWED_FILES`, the folder contract: `index.tsx`, `client.tsx`, `hook.ts`, `lib.ts`, `lib.tsx`, `variants.ts`, `classes.ts`, `constants.ts`, `boundaries.ts`, `types.ts`, `schema.ts`, `skeleton.tsx`, `empty-state.tsx`, `error-state.tsx`, `meta.ts`, `README.md`, plus `dummy/`, `parts/` and `test/`.

---

## 2. Where the component sources come from

| | A. Registry JSON served by the docs site (`topclassui.com/r/<slug>.json`) | B. The npm package carries them | C. The GitHub repository |
|---|---|---|---|
| Works while the repo is private | yes, if the site is deployed | yes | **no**: raw and API URLs return 404 without a token, and the CLI would need the user's `GH_TOKEN` |
| Works before the docs site exists | **no**: the site is planned for after 0.1.0 | yes | no, while the repo is private |
| Versioned | only if the site keeps `/r/<version>/` paths for every release | exactly: `npx topclassui@0.1.3 add` copies 0.1.3 | by git tag, if tags are kept |
| Network calls the CLI makes | one per item plus its dependencies | none; npx already downloaded the tarball | one per item, rate-limited (60 per hour unauthenticated on the API) |
| Offline after the first run | no | yes, from the npx cache or `node_modules` | no |
| Size cost | 5.3 KB gzip for `button`, 313 KB for all (F5), per fetch | about +1.3 MB unpacked and +0.33 MB packed, on every `npm i topclassui` | the same bytes as A, plus the API overhead |
| shadcn interop (`npx shadcn add <url>`) | yes, that is how shadcn registries work | no | partly (shadcn reads `owner/repo/item`) |
| Who can break it | a site deploy | a publish | a push to `main` |

**Default: B now, A added later from the same files.** The build writes the registry JSON into the package's `dist/registry/`, so the CLI reads its own installed version: no network, no site, no token, exact versions. When the docs site ships, it serves the same JSON files under `/r/`, so a shadcn user can add a TopClass component by URL. The CLI never fetches from the site; it has no reason to. C is rejected: it fails while the repo is private, and it ties a copy to a branch instead of a version.

This reverses release C10 ("neither source maps nor `src` in the tarball") only in part. The tarball carries the sources once, as JSON, not as a second `src/` tree and not as maps. The cost is stated in F5 and recorded in K1. If Omar wants the library tarball to stay small, choice K1 moves the CLI and the registry into their own package; the bytes then move with them.

---

## 3. The design

### 3.1 One package, one `bin`

`npx topclassui add button` runs the `bin` of the package named `topclassui`. So the default puts the CLI there:

```text
packages/topclassui/
  cli/                       the CLI source, outside src/ (the folder contract and the 13 lint rules are for src/)
    index.ts                 argv parsing with node:util parseArgs, dispatch, exit codes
    commands/init.ts  add.ts  diff.ts  list.ts
    lib/detect.ts            framework, TypeScript, Tailwind, CSS entry, folder, alias, package manager
    lib/tsconfig.ts          loads the consumer's own `typescript` to read tsconfig (JSONC, extends, references)
    lib/rewrite.ts           specifiers, 'use client', the package-name strings
    lib/resolve.ts           registry dependencies, in topological order
    lib/lock.ts              sha-256 of every file written, read and write topclassui.json
    lib/line-diff.ts         a small Myers line diff for `diff` and `--overwrite`
    lib/css.ts               adds the import lines to the CSS entry
    lib/install.ts           runs npm, pnpm, yarn or bun with the missing packages
    lib/prompt.ts            node:readline/promises; refuses to ask when stdin is not a TTY
    test/                    unit tests (vitest node project) and the fixtures of section 6
  scripts/registry-build.ts  writes dist/registry/ from src/ (section 3.2)
  scripts/lib/registry.ts    the pure part: closure, item JSON, the index
  tsconfig.cli.json          rootDir cli, outDir dist/cli, NodeNext
  package.json               "bin": { "topclassui": "./dist/cli/index.js" }
```

**Zero runtime dependencies.** A dependency of the CLI would be a dependency of the library, installed into every consumer app (R-5.9-1 lists the six the package may have). Everything the CLI needs is in Node ≥20.9: `parseArgs`, `readline/promises`, `crypto.createHash`, `child_process.spawn` and `fs`. The diff is about 100 lines. Prompts are plain readline. JSONC is read by the consumer's own `typescript`, which the CLI loads with `createRequire(<project>/package.json)`. The projects the CLI supports have `typescript` installed by definition (DECISIONS, TypeScript-only). The import rewrite uses regexes, not a parser. That is safe because the input is our own linted source: `check:registry` (K2) fails the build if any specifier is not in a form the regexes recognise. shadcn needs Babel because it accepts anyone's registry; we accept only our own.

**Size.** The CLI is about 1,500 lines of TypeScript, about 50 KB of JS. `dist/registry/` is about 1.3 MB raw (F5). The tarball goes from 318 KB to about 0.7 MB packed, and from 1.17 MB to about 2.5 MB unpacked. The app's bundle is unaffected: nothing imports `dist/cli` or `dist/registry`.

### 3.2 The registry build

`pnpm registry:build` runs inside `pnpm build` after the R4 steps. It writes:

```text
dist/registry/
  index.json                 [{ name, type, title, registryDependencies, dependencies, files: [paths] }] for list and the resolver
  base.json                  shared/ (minus meta.ts), icons/index.ts, types.ts, the *.generated.ts tables, tokens.css, styles.css
  icon-data.json             the 84 icons/data/*.ts, keyed by name, so add copies only the icons a component imports
  <slug>.json                one per component folder with an index.tsx: 52 files
```

Each `<slug>.json` is a shadcn registry item, so the site can serve it as it is:

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "dialog",
  "type": "registry:ui",
  "dependencies": ["@base-ui/react@1.8.0", "zod@^4.6.5", "clsx@^2.1.1", "tailwind-merge@^3.7.0"],
  "registryDependencies": ["svg"],
  "files": [
    { "path": "components/dialog/client.tsx", "type": "registry:file", "target": "~/topclassui/components/dialog/client.tsx", "content": "..." }
  ],
  "meta": {
    "topclassui": {
      "version": "0.1.0-beta.1",
      "shared": ["shared/cn.ts", "shared/classes.ts", "..."],
      "icons": ["x"],
      "examples": { "dummy/basic.tsx": ["button"], "dummy/with-form.tsx": ["button", "input"] },
      "client": ["components/dialog/client.tsx"]
    }
  }
}
```

The `content` is the source **before** rewriting, with `#shared/` specifiers intact. The rewrite depends on where the consumer's folder is, so the CLI does it at copy time. `meta.topclassui.examples` maps each demo file to the components it imports (F2), so `add` can tell which demos it can copy.

**`check:registry`** joins `pnpm check`. It runs the build into a temp folder and fails on any of these:
- a specifier the rewrite regexes do not recognise;
- a `#test/` import reached from a shipped file;
- a closure file missing on disk;
- a cycle in `registryDependencies`;
- an npm package used by a copy but absent from the library's `dependencies` (F3);
- a `'topclassui` string in a shipped file outside the allow-list of F4.

The generated JSON is git-ignored; it is build output, as `dist/` is.

### 3.3 What `add` copies, and where

**The consumer's tree** (a Next.js app with `src/app`; without `src/`, the same tree sits at the root):

```text
your-app/
  topclassui.json                       config and the lock (3.6)
  src/app/globals.css                   init adds two import lines
  src/topclassui/
    tokens.css  styles.css              from base, by init
    shared/                             all 42 shipped files, by init
    icons/  index.ts types.ts *.generated.ts   by init
    icons/data/x.ts ...                 only the icons a copied component imports
    components/
      svg/                              pulled in by dialog
      dialog/  index.tsx client.tsx hook.ts classes.ts constants.ts schema.ts types.ts
               dummy/basic.tsx ...      the demos whose components are all present
```

**Per file of the folder contract:**

| File | Copied | Why |
|---|---|---|
| `index.tsx`, `client.tsx`, `hook.ts`, `lib.ts`/`lib.tsx`, `parts/*` | yes | the component |
| `variants.ts`, `classes.ts`, `constants.ts`, `boundaries.ts` | yes | how it looks, its defaults and its bounds |
| `types.ts`, `schema.ts` | yes | `types.ts` derives from `schema.ts` (R-8.3-4), so neither works alone. This drops the 25 Sep `--schema` flag. |
| `skeleton.tsx`, `empty-state.tsx`, `error-state.tsx` | yes | the three states are exports of the component |
| `dummy/*.tsx` | **when every component the demo imports is present or being added**; others are listed as skipped; `--examples` adds their components too, `--no-examples` skips all | DECISIONS 2 Oct point 6 says the CLI copies demos; F2 shows that copying all of them pulls in up to six more components |
| `meta.ts` | no | it imports `#shared/meta.js`, which is library-internal docs data; the docs-site tree that draws it ("docs info, never ships") changes in K8 |
| `README.md` | no | after release R6 it shows `import ... from 'topclassui/<slug>'`, which is wrong for a copy |
| `test/` | no | it needs vitest, Testing Library, happy-dom and `#test/*`, none of which the consumer has; the docs-site tree that draws it changes in K8 |

**Shared files and icons.** `init` copies all of `shared/` except `meta.ts`: 42 files, 99 KB. It also copies the icon runtime (`icons/index.ts`, `types.ts` and the generated tables). So no `add` ever has to touch a shared file, and `diff` sees the whole base in one place. Copying only the 37 files components actually reach would save 11 KB and complicate every later `add`. Icon data files are copied on demand: `add dialog` writes `icons/data/x.ts`. `add icon` writes all 84 (49 KB), because its loader map imports every icon (F1).

**The import rewrite**, applied to every copied `.ts` and `.tsx` file, in order:

1. `#shared/x.js`, `#icons/x.js` and `#components/x.js` become a relative path from the file to `<folder>/shared/x.js` and so on, always starting with `./` or `../`. This is the release plan's `specifiers.ts` function, imported rather than rewritten.
2. The `.js` extension is removed from every relative specifier when the consumer's `moduleResolution` is `bundler` (both templates, F8). That avoids depending on webpack's `extensionAlias` and on Turbopack's behaviour. It is kept under `node16` or `nodenext`, where TypeScript requires it.
3. In a Vite project, a first-line `'use client'` is removed: there is no RSC there, and the directive is only a bundler warning. It stays in a Next.js project. The removal handles every file; shadcn's `/g` regex bug (F7) is a test case.
4. The F4 strings are rewritten: `'topclassui/icons/<name>'` becomes the consumer's import path for that icon, using the alias when one exists (3.4). The `npx topclassui icons scan` sentence stays, because the CLI keeps that command name for when it is built (PLAN 7). The code-block demo's sample text stays: it is a sample.
5. Nothing else is edited. Class strings, comments and formatting are byte for byte the library's, so `diff` is meaningful.

Relative paths are the default, not an alias, because the Vite template has no `@/*` alias (F8), and relative paths work in any project without a tsconfig change. Choice K4 offers `@/topclassui/...` instead.

**Dependencies between components.** The resolver reads `registryDependencies` from `index.json`, walks them depth-first with a visited set, and writes in topological order (`svg` before `dialog`). The graph has no cycles today (F2), and `check:registry` keeps it that way. A dependency already present is not rewritten unless it is part of an update (3.6). `add dialog` therefore prints three rows: `svg → src/topclassui/components/svg/ (dialog imports it)`, `dialog → src/topclassui/components/dialog/`, and `icons/data/x.ts`.

**npm packages.** The union of `dependencies` over the resolved items (F3), at the library's own ranges (exact `@base-ui/react`, caret for the rest; release C11). Packages already in `dependencies` at a satisfying version are skipped. One install command runs at the end: `npm install`, `pnpm add`, `yarn add` or `bun add`. `--no-install` prints the command instead. `init` installs `clsx`, `tailwind-merge` and `zod`, which `shared/` needs. `add` installs `@base-ui/react`, `class-variance-authority` or `server-only` when an item needs them.

**The `topclassui` package in the same project.** If `topclassui` is in the consumer's `dependencies`, or any file imports `topclassui/provider`, `init` stops with exit code 2. The message explains F9 and names the fix: mount the provider from `src/topclassui/shared/provider/provider.js`, or use only the package. `--force` overrides. Copies and package imports of different components can live side by side only under one provider. Choice K2 is the alternative that removes the problem.

### 3.4 Project detection

Detection reads files only, and runs nothing except loading the consumer's `typescript` module. `--cwd <dir>` sets the project root, which is the folder holding `package.json`. `deps` below means `dependencies` ∪ `devDependencies` of that file. An installed version is read from `node_modules/<pkg>/package.json`, walking up for hoisted installs. When nothing is installed, the CLI falls back to the minimum of the declared range.

| Question | Rule, in order; the first match wins | Fails with (exit 2) |
|---|---|---|
| Is this a project | `package.json` exists at the root | "No package.json in <dir>. Run inside your app, or pass --cwd." |
| Monorepo root by mistake | `pnpm-workspace.yaml` or a `workspaces` field, and neither `next` nor `vite` in `deps` | "This is a workspace root. Pass --cwd apps/<your-app>." |
| Framework: `next-app` | `next` in `deps`, and `app/` or `src/app/` is a directory. `next.config.*` is not required, because Next.js does not require it. `next` is tested before `vite`, because Next.js apps often carry `vite` through Vitest. | |
| Framework: `next-pages` | `next` in `deps`, `pages/` or `src/pages/`, no `app/` | "The Pages Router is not supported (DECISIONS 2 Oct). Use the App Router, or import from the package." |
| Framework: `vite-react` | `vite` in `deps`, `@vitejs/plugin-react` or `@vitejs/plugin-react-swc` in `deps`, and a `vite.config.{ts,mts,cts,js,mjs,cjs}` exists. A `react-router.config.*` makes it React Router framework mode, which is unsupported. | "Only Next.js App Router and Vite with React are supported (DECISIONS 2 Oct)." |
| Versions | React ≥19 installed; Next.js ≥15 for `next-app` | "React 19 or newer is required." |
| TypeScript | `tsconfig.json` exists and `typescript` is in `deps` | "TopClass UI supports TypeScript projects only." |
| Tailwind v4 | `tailwindcss` installed at ≥4.2.0 (the package's peer floor). For Next.js, `@tailwindcss/postcss` in `deps`; for Vite, `@tailwindcss/vite` in `deps`. A missing plugin is a warning, not a failure: the app may wire Tailwind another way. | v3, or no `tailwindcss`: "Tailwind CSS v4.2 or newer is required: <link to tailwindcss.com install guide for the framework>." The CLI does not install Tailwind. |
| CSS entry | `--css`, then `topclassui.json`, then the candidates in order (Next.js: `app/globals.css`, `src/app/globals.css`; Vite: `src/index.css`, `src/App.css`, `src/main.css`, `src/styles.css`), keeping the first that exists and matches `/^\s*@import\s+(url\()?\s*["']tailwindcss["']/m`. Otherwise every `.css` file to depth 5, skipping `node_modules`, `.next`, `dist`, `build`, `public` and `.git`: one match is used, several are asked about. | No match without a TTY: "No CSS file imports tailwindcss. Pass --css <file>." |
| The folder | `--dir`, then `topclassui.json`, then `src/topclassui` if `src/app` exists (Next.js) or always for Vite (the template's `tsconfig.app.json` includes only `src`), else `topclassui` at the root | |
| tsconfig coverage | The CLI parses the tsconfig with the consumer's `typescript` (`readConfigFile` and `parseJsonConfigFileContent`). For Vite, it follows `references` to `tsconfig.app.json`, because the root file has `files: []`. It warns if no project's `include` matches `<folder>/components/x.tsx`. | warning only |
| `moduleResolution` | read from the same parsed config: `bundler` strips `.js`, `node16` and `nodenext` keep it (3.3 step 2) | anything else (`node10`, `classic`): exit 2 |
| Alias | `compilerOptions.paths`: the first key ending in `/*` whose target is the folder's parent (`@/*` to `./src/*` or `./*`). It is used only to print import lines (`import { Button } from '@/topclassui/components/button'`) and, under choice K4, to rewrite. None found: the printed lines use a relative path from `src/app/page.tsx` or `src/App.tsx`. | |
| Package manager | `--pm`; then `packageManager` in `package.json`, walking up to the workspace root; then the lockfile, walking up (`pnpm-lock.yaml`, `yarn.lock`, `bun.lock` or `bun.lockb`, `package-lock.json` or `npm-shrinkwrap.json`); then `npm_config_user_agent`; then npm. **This reverses the 25 Sep order**, which read the user agent first: under `npx` the agent is always `npm/…`, even in a pnpm project. shadcn reads lockfiles first too (F7). | |

`init` prints what it detected before it writes anything. This is the first block of the docs page: `Detected Next.js 16.4, App Router, TypeScript, Tailwind 4.3` and `Detected pnpm (pnpm-lock.yaml)`.

### 3.5 What `init` installs

1. **Detect**, as in 3.4. Ask at most two questions, each pre-filled: the CSS entry, and the folder. The docs page's second question, "Import alias for shared code?", goes away under the relative default; it comes back only with choice K4.
2. **Copy `base`**: `tokens.css`, `styles.css`, `shared/` and the icon runtime into the folder.
   - `styles.css` keeps its `@source "./components"` and `@source "./shared"` lines. They are relative to the copied file, so they scan the copies.
   - Tailwind's automatic detection would find the copies anyway, unless the folder is git-ignored.
   - The `@source "./connectors"` line is gone by then (release R4).
3. **Edit the CSS entry**, the one file `init` edits but did not create, which is why the docs page says so ("What it never does").
   - It inserts two lines directly after the `@import "tailwindcss"` line: `@import "../topclassui/tokens.css";` and `@import "../topclassui/styles.css";`, relative from the CSS file.
   - If the file has no Tailwind import (only possible through `--css`), it adds that one first, so three lines.
   - If the lines are already there, it does nothing.
   - It never reorders or removes anything.
4. **Install** `clsx`, `tailwind-merge` and `zod` (3.3).
5. **Write `topclassui.json`** (3.6).
6. **Print the provider and theme-script snippet; do not edit the layout.**
   - For Next.js, the snippet is the docs Provider page's `app/[locale]/layout.tsx` (or `app/layout.tsx`), with the imports pointing at the copied `shared/provider/provider` and `shared/theme/theme-script`.
   - For Vite, the snippet is `src/main.tsx` wrapping `<App />`.
   - Editing a user's layout is the one change that breaks most often and that the user can do best (R-13-1: direction and locale come from the layout as props, which only the user knows how to derive).
   - Choice K6.

`init` run twice is a no-op that says so. `init --force` rewrites `base` under the update rules of 3.6.

### 3.6 `topclassui.json` and how updates work

```json
{
  "$schema": "./node_modules/topclassui/dist/cli/schema.json",
  "version": 1,
  "framework": "next-app",
  "css": "src/app/globals.css",
  "dir": "src/topclassui",
  "imports": "relative",
  "packageManager": "pnpm",
  "lock": {
    "registry": "0.1.0-beta.1",
    "files": {
      "shared/cn.ts": { "from": "base", "version": "0.1.0-beta.1", "sha256": "9f2c…" },
      "components/dialog/client.tsx": { "from": "dialog", "version": "0.1.0-beta.1", "sha256": "41ab…" }
    }
  }
}
```

The hash is of the file **as written**, after the rewrite. Paths are relative to `dir`. The file is plain JSON, written with two-space indentation and a trailing newline, and kept sorted so its git diffs stay small. The docs page's drawn config (`framework`, `css`, `components`, `alias`, `packageManager`) becomes `dir` and `imports` (K8 updates the page).

**Every file is in one of five states.** The CLI computes `local` (the hash on disk), `written` (the lock's hash) and `upstream` (the hash of what this CLI version would write now).

| State | Test | `add` | `diff` |
|---|---|---|---|
| up to date | local = written = upstream | nothing | `up to date` |
| update available | local = written ≠ upstream | replaces it silently: it is our untouched copy | `upstream changed` and the patch |
| modified locally | local ≠ written = upstream | leaves it | `modified locally` |
| both changed | local ≠ written ≠ upstream | leaves it and lists it; `--overwrite` prints the diff (local to upstream), then replaces it | `modified locally, upstream changed` and the patch |
| removed upstream | in the lock, not in the new item | leaves it and lists it; `--overwrite` deletes it only if unmodified locally | `removed upstream` |

This is the docs page's promise ("add never overwrites your edits"). It also makes the 25 Sep wording, "never overwrites a file it did not just write", precise. Because the CLI's version is the registry's version, updating is: `npx topclassui@<new> diff`, then `npx topclassui@<new> add <slugs> [--overwrite]`. `add` with no slug and `--update` updates every component in the lock. The lock's `registry` field records the last version applied.

A file the lock does not know, but which exists at a target path, is treated as "modified locally". So `add` never overwrites a file it did not write (the 25 Sep rule).

### 3.7 Commands, flags, prompts

```text
npx topclassui init   [--css <file>] [--dir <path>] [--pm npm|pnpm|yarn|bun] [--imports relative|alias] [--force]
npx topclassui add    <slug...> | --all | --update   [--overwrite] [--examples | --no-examples]
npx topclassui diff   [slug...]   [--exit-code]
npx topclassui list   [--json]
npx topclassui --version | --help | <command> --help

every command: --cwd <dir>  -y/--yes  --dry-run  --no-install  --silent
```

| Command | Does | Output |
|---|---|---|
| `init` | 3.5 | the detection block, the files written, the install line, the snippet |
| `add` | 3.3 and 3.6 for the slugs and their dependencies; runs `init` first if there is no `topclassui.json`, asking "Run init first?" (yes by default; `--yes` accepts) | one row per component (`select → src/topclassui/components/select/`, `field → … (select imports it)`), skipped demos, files left alone, the install line |
| `diff` | 3.6 for the slugs (default: every component in the lock, plus `base`) | per-file status and unified patches; exit 0 when nothing differs, 1 when something does (`--exit-code` is the default; the flag exists so a script can say so) |
| `list` | every slug in `index.json` with its title, whether it is in the lock, and its lock version | a table, or JSON with `--json` |

Every slug is checked against `index.json`. An unknown slug fails with exit 2 and the three closest names (Levenshtein, about 20 lines).

**Exit codes.** 0 done; 1 `diff` found differences, or `add` left a file because of local edits; 2 usage or detection error; 3 the package manager failed.

**Non-interactive mode.** It is on when `--yes` is passed, when stdin is not a TTY, or when `CI` is set. Every question takes its detected default. A question without one (no CSS entry, several candidates) fails with exit 2 and names the flag that answers it. `--dry-run` resolves, rewrites and prints every path, plus each patch with `--overwrite`, and writes and installs nothing. `--silent` prints only errors.

**Dropped from the 25 Sep entry:** `--js`/`--ts` (the project is TypeScript only, DECISIONS) and `--schema` (`types.ts` needs `schema.ts`). **Not built, kept as names:** `icons scan` (PLAN 7, DECISIONS React-support entry), which arrives with the icons page. **No telemetry,** and no network call except the package manager's.

The invocations stay the four of 25 Sep: `npx topclassui`, `pnpm dlx topclassui`, `yarn dlx topclassui`, `bunx topclassui`. The docs-site drawing's `npm dlx` line is a typo for `pnpm dlx`; K8 fixes it.

### 3.8 Later, not in this plan's pull requests

- The docs site serves `dist/registry/*.json` under `/r/` and `/r/<version>/`. A fixture then proves `npx shadcn add https://topclassui.com/r/button.json` writes a tree that type-checks. Our `target`s are `~/topclassui/...`, which shadcn resolves from the root, so it cannot place the folder under `src/`. A shadcn user gets the root layout, and gets no CSS edit (`cssVars` are not used; tokens arrive as a file).
- `icons scan` and `icons add-set`, with the icons page.
- A `migrate` command, when a release renames something copies depend on.

---

## 4. Tests

| Layer | What | Where |
|---|---|---|
| Unit | Each `cli/lib` function is pure over an injected file system (`{ exists, read, list }`), the same pattern release R3 uses for `repo-root.ts`. Expectations are written out (R-17-1). Detection covers one case per table row of 3.4, the Vite `references` case and the npx user-agent case. The rewrite covers depth 1 to 3, the Windows-path case, `.js` stripping by `moduleResolution`, `'use client'` removal on consecutive files (the shadcn `/g` bug) and the F4 strings. The lock covers the five states. The resolver covers order, de-duplication and a fake cycle. `line-diff` covers empty, append, delete and CRLF. | `cli/test/*.test.ts`, the vitest `node` project |
| Registry | `check:registry` (3.2) in `pnpm check`, plus a unit test that `index.json` lists 52 items and that `dialog`'s `registryDependencies` is exactly `["svg"]` | `scripts/lib/registry.test.ts` |
| Mutation | Rows in `scripts/mutations/` that break the depth count, flip one state of the lock table and drop the visited set | `pnpm test:mutation` |
| Fixtures | Two committed minimal apps. `cli/test/fixtures/next-app/` has Next.js 16 App Router, `src/app`, Tailwind 4 through `@tailwindcss/postcss` and `@/*` paths. `cli/test/fixtures/vite-react/` has Vite 8 react-ts, `tsconfig.app.json` references and `@tailwindcss/vite`. Each has `package.json`, the tsconfig files, the CSS entry, one page and no `node_modules`. | |
| Copy test, offline | Runs inside `pnpm check`, in about 30 s. For each fixture it copies to a temp dir, runs `init --yes --no-install` and `add dialog select toast --yes --no-install` against the freshly built `dist/registry`, and snapshots three things: the sorted list of written paths with their hashes, the CSS entry and `topclassui.json`. A snapshot is a written-out file under `cli/test/snapshots/`; `-u` is never run by CI. The test asserts that no written file contains `#shared/`, `#icons/`, `#components/` or `from 'topclassui`, that the Vite tree has no `'use client'` and that the Next tree keeps all of them. It then runs `add dialog` again (zero writes), edits one file and runs `diff` (exit 1, "modified locally"). | `cli/test/copy.test.ts` |
| Consumer test, online | Like release R7, before a publish and not in `pnpm check`. It packs the tarball. In each fixture it runs `npm install` with the fixture's own deps, then `npx <tarball> init --yes` and `add --all --yes`, then `tsc --noEmit` and `next build` or `vite build`. It fails on any type error, build error or `MODULE_LEVEL_DIRECTIVE` warning. It also renders `/` and checks that a copied Button has the class string and `data-size="md"` that the package's Button has. This is the 25 Sep acceptance "tsc passes without the package", proven: `topclassui` is not in the fixture's `package.json`. It answers the two "not verified" items of section 0 for Turbopack and Vite. | `pnpm test:cli-consumers` |

---

## 5. The build order

Precondition: release steps R1 to R5 are merged. The CLI needs the workspace layout (R3), the build and `specifiers.ts` (R4), and the manifest's `files` (R5). It can be built in parallel with R6 to R8 and ship in the first beta after 0.1.0-beta.0, or in that beta if it is ready first.

| Step | Branch | What | Builder time | Gate |
|---|---|---|---|---|
| K1 | `docs/cli-decisions` | One DECISIONS entry (below); STATUS open question 1 closed; PLAN 21 "copy-paste CLI" line pointed here | 30 min | `pnpm check` |
| K2 | `feat/registry-build` | `scripts/registry-build.ts`, `scripts/lib/registry.ts` with tests, `check:registry` in `pnpm check`, `dist/registry/` in `pnpm build`, `files` unchanged (it is under `dist`) | 4 h | `pnpm check` + `pnpm build` + a `pnpm pack` size check |
| K3 | `feat/cli-core` | `cli/index.ts`, `lib/detect.ts`, `lib/tsconfig.ts`, `lib/prompt.ts`, `lib/lock.ts`, `tsconfig.cli.json`, the `bin` field, `list`; lint and typecheck cover `cli/` | 5 h | `pnpm check` |
| K4 | `feat/cli-init` | `init`, `lib/css.ts`, `lib/install.ts`, the snippets | 4 h | `pnpm check` |
| K5 | `feat/cli-add` | `add`, `lib/rewrite.ts`, `lib/resolve.ts`, the demo rule, the five states | 5 h | `pnpm check` + `pnpm test:mutation` |
| K6 | `feat/cli-diff` | `diff`, `lib/line-diff.ts`, `--overwrite`, `--update` | 3 h | `pnpm check` |
| K7 | `test/cli-fixtures` | the two fixtures, the offline copy test in `pnpm check`, `pnpm test:cli-consumers`; record the Turbopack and Vite answers in DECISIONS | 5 h | `pnpm check` + `pnpm test:cli-consumers` |
| K8 | `docs/cli-page` | `docs/figma/docs-site.md` page 3 brought in line: the tree without `meta.ts`, `test/` or the `lib/` and `schemas/` folders it draws; the config fields; one question instead of two; `pnpm dlx`; the "What it never does" card saying no network call. STATUS: the CLI is built. A changeset. | 1 h | `pnpm check` |

That is about 27.5 builder hours, with one full `pnpm check` per step on top (about 30 minutes on the laptop, about 2 hours on a cloud machine). K3 to K6 are in order, because each one uses the previous one's modules. K2 can run in parallel with K3.

**The K1 entry**, "The CLI: one bin in `topclassui`, sources in the tarball, everything copied". It records:

1. The CLI is the `topclassui` package's `bin`, with no runtime dependency (3.1).
2. The sources ship as `dist/registry/*.json` in the tarball; the site serves the same files later; GitHub is never a source (2). This partly reverses release C10, and the size is stated.
3. `shared/` is copied, not imported from the package; STATUS question 1 is closed against its recommendation, for F9.
4. Imports are rewritten to relative paths without `.js` under `bundler` (3.3), and `'use client'` is stripped in Vite projects.
5. `meta.ts`, `README.md` and `test/` are not copied. Demos are copied only when their components are present (narrows DECISIONS 2 Oct point 6).
6. The package-manager order puts the lockfile before the user agent (reverses 25 Sep).
7. `--js`, `--ts` and `--schema` are dropped.
8. `init` prints the provider snippet and edits only the CSS entry.
9. The `topclassui.json` shape replaces the one drawn on the docs page.

---

## 6. What can go wrong, and the answer

| Risk | Answer |
|---|---|
| A copied tree drifts from the package and a bug fix never reaches it | `diff` lists it; the five-state table updates every file the user did not touch; the changelog names the files a fix changed |
| The user mounts the package's provider over copied components (F9) | `init` refuses while `topclassui` is a dependency; the K7 consumer test renders a copied component in Arabic under the copied provider |
| A new component imports a shared file in a form the regex rewrite misses | `check:registry` fails the library's own `pnpm check` before it is published |
| `npx` resolves an old cached `topclassui` | every command prints its version in the first line; the docs write `npx topclassui@latest init` once, as the drawing does |
| The tarball's size grows with every component | F5's numbers become a `check:package` budget when size-limit lands (release C9); choice K1 moves the bytes out |
| Windows paths | the rewrite and the lock use `path.posix` on normalised paths, as release R4 requires; a unit test feeds backslashes |
| The consumer has `"type": "commonjs"` or no `type` | irrelevant: the copies are `.ts`/`.tsx` compiled by the app's bundler; the CLI itself is ESM run by Node ≥20.9 |

---

## 7. The owner's choices

Each row is built as its default unless Omar says otherwise before the step named.

| # | Choice | Default (what gets built) | Alternative | Decide before |
|---|---|---|---|---|
| K1 | Where the CLI lives | a `bin` in `topclassui`; source in `packages/topclassui/cli/`; tarball about 0.7 MB packed and 2.5 MB unpacked | `packages/cli` published as `topclassui-cli` (free on npm today) with the registry inside it. The library stays at 318 KB, but the command becomes `npx topclassui-cli add button`, and the two versions must be kept in step. | K1 |
| K2 | Shared code in copies | copied once by `init`, so the tree imports nothing from the package | imported from the package (STATUS question 1's recommendation). Copies are smaller and get fixes by upgrade, but a copy of `dialog` at 0.1 then runs against `shared/` at 0.3 with no type error. | K1 |
| K3 | Where sources come from | the tarball (B), and later the site serves the same JSON | fetch from `topclassui.com/r/` (A): a smaller tarball, but nothing works until the site is deployed, and every run needs the network | K2 |
| K4 | Import style in copies | relative paths, no `.js` under `bundler` | the tsconfig alias (`@/topclassui/shared/cn`), which reads like shadcn's copies but fails in the Vite template, which has no alias, unless `init` adds one to two tsconfig files and `vite.config` | K5 |
| K5 | The folder | `src/topclassui/` when `src/` holds the app, else `topclassui/` at the root | the docs drawing's split, `components/topclassui/` plus `lib/topclassui/`, which contradicts the job's "one `topclassui/` folder" | K4 |
| K6 | The layout file | `init` prints the provider and theme-script snippet | `init` edits `app/layout.tsx` or `src/main.tsx`, with a guessed `direction` and `locale` that R-13-1 says the layout must supply | K4 |
| K7 | Demos | copied when their components are present; `--examples` pulls the rest | always (DECISIONS 2 Oct point 6 as written: `add select` becomes seven components); or never | K5 |
| K8 | Which components are listed | all 52, `icon-registry` and `svg` included, because components import them | the site's 46 in `list`, with the six helpers added only as dependencies | K3 |
| K9 | `diff` as a command | `diff`, as the docs page draws it | `add --diff`, as shadcn moved to in 4.x | K6 |
| K10 | Release of the CLI | the next beta after K8, via Changesets (release C7) | ship it in 0.1.0-beta.0 if K2 to K7 land before R8 | K8 |
