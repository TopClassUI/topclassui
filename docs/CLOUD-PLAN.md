# Building components in the cloud

A working plan for the Claude session that builds components. Components only. The
docs site, the Figma frames and the npm release are not in this plan and must not be
touched by it.

---

## 1. Read these first, in this order

1. `CLAUDE.md` - the rules, all of them, generated from `docs/RULES.md`.
2. `docs/STATUS.md` - where things stand, including the open questions.
3. `docs/DECISIONS.md` - every decision already made. Read it before proposing anything
   that looks like a decision. It is long and it is load-bearing.
4. `docs/PLAN.md` sections 8.1 to 8.5 (the folder contract and the state contract),
   18 (the catalog) and 20 (the Definition of Done).
5. `src/components/button/` - the whole folder. Button is the template. Every component
   in this plan is Button with different variants, so read it before writing anything.
6. `docs/figma/unit-1.md` - the design of the ten Unit 1 components, as text. You have no
   Figma access, so it is your only design input; do not ask for screenshots. Each
   component has the facts and a **Build this** block, and the block is what you build.

Do not skim `src/components/button/test/`. Fourteen test files is not ceremony; each one
exists because a review found something the others could not see.

---

## 2. Who does what

| | Cloud session (you) | Local session (Omar's machine) |
|---|---|---|
| Builds components | yes, all of it | no |
| Writes tests and demos | yes | no |
| Runs the eleven gates | yes, before every push | yes, again on the branch |
| Reviews | self-review only | the real review, adversarial |
| Fixes review findings | the large ones | the small ones |
| Merges, pushes to `main` | never without being asked | Omar decides |
| Adds a dependency | never | only after Omar names it |
| Touches `docs/PLAN.md` | never | only Omar |

You are the volume. The local session is the brake. Push branches, open pull requests,
and let the review come to you. Never merge your own branch.

---

## 3. Ground truth: what exists today

Verified on `main` after Button merged, 2026-10-07, all eleven gates green:

```
pnpm check   ->  lint, typecheck, 1289 tests in 60 files, check-structure,
                 check-boundaries, check-css, check-icons, check-readme,
                 check-contrast, 98 Playwright tests, rules-sync --check
pnpm test:mutation  ->  47 of 47 mutations caught
```

**Built and finished:**

- **Tokens.** `src/tokens.css`: three modes (`light`, `dark`, `ocean`), six knobs, a
  per-tone interaction ramp. 339 contrast pairs checked in every mode, measured as the
  worse of two gamut readings. Every token is declared in all three modes and
  `check-css` now fails if one is not.
- **Icons.** 84 Phosphor icons in `raw/`, built into `src/icons/` by `pnpm icons:build`.
  Two entry points: async `<Icon name>` for server trees, sync `<Svg icon={x}>` for
  client and shared files.
- **Shared.** `cn`, `clamp`, `renderElement`, `floating`, `variants/memoizeVariants`,
  `contracts/` (size, state, tone, collection, boundaries), `collection/useCollection`,
  `adaptive/useAdaptiveMode`, `labels/` (en + ar with plural rules), `theme/script`,
  `provider/context`, `use-controllable-state`. All with tests.
- **Button.** Server-only, zero client JavaScript, 5 variants x 6 tones x 6 sizes. A
  long label truncates with an ellipsis instead of pushing the layout apart (`R-5.2-7`),
  and `boundaries.ts` caps the label string itself.
- **Gates.** Eleven in `pnpm check`, plus `pnpm test:mutation` as the gate on the gates.
  Thirteen custom ESLint rules. A static Playwright harness: every `dummy/*.tsx` becomes
  6 pages (3 modes x 2 directions) and is automatically covered by the axe and
  target-size specs. The focus-ring and contain specs open Button's demos by name.

**Not built. Do not try to use them:**

- `pnpm test:visual` and `pnpm size` - no visual baselines, no size-limit wiring.
- No `.changeset/`. The Definition of Done asks for a changeset; there is nowhere to put
  one yet. Skip that line and record it (section 10).
- No docs site, no docs pages, no props-table generation.
- No monorepo. One package, `src/` at the root. `docs/PLAN.md` section 4 still describes
  three packages; that is an open question in `docs/STATUS.md`, not your problem.
- **No component has a `client.tsx` yet.** `src/shared/` has client files, the provider and
  the hooks among them, but no component has ever shipped `'use client'`.
  `check-boundaries` has rules for it and `R-5.12-1` describes it, but no component proves
  the pattern works. This is why Track B exists.

---

## 4. Out of scope, explicitly

Do not build, edit or plan: the docs site, any page, any route, MDX, the props table
generator, Figma frames, the screenshot comparison against Figma, `@topclassui/next`, the
SEO kit, the CLI (`npx topclassui add`), the editor kit, the release pipeline, the monorepo
split. The design itself is in scope: the tokens, parts and states of each component follow
`docs/figma/unit-1.md`.

Do not add a dependency. Do not add a script. Do not add a gate. Do not edit
`docs/PLAN.md`, `docs/RULES.md`, `CLAUDE.md`, `AGENTS.md` or `.cursor/rules/`.

If a component needs something that does not exist, **stop that component**, say so in
the pull request, and either add the missing piece to `src/shared/` in its own small
pull request with tests first, or wait. That is `docs/PLAN.md` section 19's rule for
Phases 4 to 7 and it is not negotiable: *no new infrastructure inside a component
branch.*

---

## 5. The one deviation this plan makes

`docs/PLAN.md` section 19 puts **forms** next (Phase 4: Field, Label, Input, Textarea,
Checkbox, RadioGroup, Switch, NumberField, Slider, Select, Form), and section 18 lists a
catalog larger than what the site advertises. This plan does neither, for two reasons.

**It follows the site's 46, not the catalog.** The home page promises 46 components by
name. The catalog in section 18 is longer and includes `Heading`, `Text`, `Container`,
`Stack` and `Grid`, which the site never mentions and which, in a Tailwind library, are
mostly indirection over `max-w-5xl mx-auto px-4`. Build what was promised; reconsider the
rest once it ships.

**It builds the server set before the forms.** No component has a `client.tsx` yet, so
the client half of the folder contract is described by `R-5.12-1` and checked by
`check-boundaries` but proven by nothing. Phase 4 is almost entirely client components,
which would mean inventing the client template, the Field architecture, the Base UI Field
integration and the `labels` wiring at once, in parallel, at volume. That is design work,
not quantity work. The server set copies Button exactly, so throughput is high and risk is
low - which is what this session is for - and one client component built carefully and
reviewed hard is worth more than eleven built on a pattern nobody has validated.

Omar has agreed to both, and the entry in Appendix C is already in `docs/DECISIONS.md`: do
not paste it again. Follow section 6. Appendix B records the strict section 19 order in case
it is ever needed.

## 6. The order of work

### Gate 0 - start from a `main` that has Button and this plan

Button merged on 2026-10-07. Every component branch must start from a `main` that contains
Button, the tone contract, `shared/classes.ts` and the eleven gates, or you will rebase
forty times.

Before creating any worktree, confirm `origin/main` contains `src/components/button/` and
`docs/figma/unit-1.md`.

### Track A - the server set, in parallel worktrees

Three to four worktrees at a time. Each is one component, one branch, one pull request.
Ten components per unit, three or four worktrees running at a time. See Appendix A.

### Track B - the first client component, alone

**Tooltip.** One worktree, no parallel work beside it, highest care. It is the second
template, so it decides the shape of every client component after it: `'use client'`,
`client.tsx`, an `index.tsx` that only re-exports, and a hydration test. Base UI holds its
state, so it has no `lib.tsx` (`R-8.1-1`); its `hook.ts` only reads the portal's direction
and language (`usePortalLocale`). It does not need `zod/mini`: `clamp()` covers its two delays.

It is also the first component to use `shared/floating.ts`, which already exists and has
never been exercised: the `placement` prop mapping to Base UI's `side` and `align`
(`R-5.3-4`), a popup that stays inside the viewport, and a delay group so moving between
two tooltips does not re-wait. Read `node_modules/@base-ui/react/tooltip/` before writing
a line, and write anything that differs in the pull request under Decisions (`R-0-1`).

Run it last in Unit 1, after the nine server components, so the server template is
re-proven before the client one is invented.

**`Switch` is the other template**, and it opens Unit 4 for the same reason: it settles
whether a form control uses Base UI's `checked` / `onCheckedChange` or the
`value` / `onValueChange` that `R-5.7-1` asks for. **Do not guess.** Read
`node_modules/@base-ui/react/switch/`, put the recommendation in the pull request, and
let Omar choose.

---

## 7. Worktrees: the exact commands

One worktree per component. They share one `node_modules`, which is what makes this cheap.

```bash
# from the main checkout, once per component
git fetch origin
git worktree add ../tc-badge -b feat/badge origin/main
cd ../tc-badge
ln -s ../topclassui/node_modules node_modules
```

The symlink is safe: pnpm's `node_modules` is self-contained, every link inside it points
at `node_modules/.pnpm`, so one store serves every worktree. `scripts/mutate.ts` already
does exactly this (a junction on Windows, line 40) and the full suite runs green through
it. **Do not run `pnpm install` in a worktree** - it is minutes of wasted credit and it
can rewrite the lockfile.

What is per-worktree and must not be shared: `.harness/`, `test-results/`,
`playwright-report/`, `*.tsbuildinfo`. All four are already in `.gitignore`.

Playwright's browsers live in the user cache, not in the repo, so they are downloaded
once per machine:

```bash
npx playwright install --with-deps chromium
```

Every gate runs inside the worktree, unchanged:

```bash
cd ../tc-badge && pnpm check
```

When a branch is merged or abandoned:

```bash
git worktree remove ../tc-badge
git worktree prune
```

**The limit on parallelism is not the worktrees, it is the shared files.** Two components
that both add a label, a token or a shared class will conflict. Section 9 is how you
avoid that; Appendix A groups each unit so that it mostly cannot happen.

### The live harness: one page by hand

The static pages cannot open anything. The live ones are the same pages, hydrated:

```bash
pnpm harness:serve
# http://127.0.0.1:4517/                                    every demo, six links each
# http://127.0.0.1:4517/tooltip--basic--light--ltr.html     one page, named like the static file
# http://127.0.0.1:4517/tooltip--basic--light--rtl.html?edge=top&tall=1
```

- `edge` pins the demo to `top`, `bottom`, `start` or `end`. `tall=1` makes the page three
  screens high. Any other parameter is a 404 that says why.
- A page that failed shows a red box, and `data-harness` on `<html>` reads `failed`
  instead of `hydrated`.
- The server reads the source once. Restart it after an edit.
- `pnpm test:e2e` starts its own server and refuses a port that is taken: stop yours first.
- Two worktrees at once: give the second its own port, for the whole command.
  `TC_HARNESS_PORT=4518 pnpm check`, or `$env:TC_HARNESS_PORT = 4518` first in PowerShell.
- A spec opens a page with `openLive` from `e2e/live.ts`; `e2e/tooltip.spec.ts` is the pattern.

---

## 8. The per-component recipe

Follow it in order. The gate after each step is the point - a failure found at step 4 is
a minute, the same failure found at step 11 is an hour.

1. **Read the catalog row** (`docs/PLAN.md` section 18) and the section of the component in
   `docs/figma/unit-1.md`. The row decides the rendering mode (`S`, `Sp`, `C`), the tier
   and the notes; the **Build this** block decides the parts, the props, the defaults and
   the classes. Do not widen either.
2. **Scaffold.** `pnpm new:component <slug>`. It writes `constants.ts`, `boundaries.ts`,
   `classes.ts`, `schema.ts`, `types.ts`, `variants.ts`, `index.tsx`, `meta.ts`,
   `README.md`, `test/<slug>.test.tsx` and `dummy/basic.tsx`, and the result already
   passes `pnpm check`. Run it now, before writing a line, so you know the baseline is
   green. Then delete every prop and file the component does not have (`R-8.1-1`): the
   scaffold writes a `variant`, `tone` and `size` trio that most of Unit 1 does not need.
3. **The folder contract gained three files since Button.** `boundaries.ts` holds the
   bounds and nothing else (`R-8.3-6`), `classes.ts` holds this component's class tables
   (`R-5.12-4`), and `lib.ts` holds pure helpers and may not import React: markup that
   both halves draw is a part in `parts/` with no directive, never a `lib.tsx` (there is
   none; 2026-10-17 entry in DECISIONS). `pnpm new:component` writes the first two.
4. **Check the installed types before using any API** (`R-0-1`). Open
   `node_modules/@base-ui/react/<part>/` and read the `.d.ts`. Never guess a prop name.
   Anything that differs from what you expected goes in the pull request under Decisions.
5. **`constants.ts` and `boundaries.ts`** - the value lists as `as const` arrays and the
   defaults (`<NAME>_DEFAULTS`) go in `constants.ts`; the bounds go in `boundaries.ts` and
   nothing else does (`R-8.3-6`). A component with nothing to bound has no such file. Sizes
   come from `shared/contracts/size.ts`, tones from `shared/contracts/tone.ts` and a
   text cap from `shared/contracts/boundaries.ts`. Never redeclare any of them locally
   (`R-8.3-2`, `R-5.7-8`).
6. **`schema.ts`** - every design prop, with `min` and `max` on anything numeric
   (`R-5.7-7`, and `docs/PLAN.md` 18.11 lists which props have limits). Clamp at runtime
   with `clamp()`.
7. **`types.ts`** - the unions derived from `constants.ts`, the prop interfaces derived
   from the schema. No prop interface anywhere else (`R-8.3-4`).
8. **`classes.ts` and `variants.ts`** - the class tables go in `classes.ts`, cva goes in
   `variants.ts`, and the export is wrapped in `memoizeVariants` from
   `#shared/variants.js`, which caches the 360 real combinations (7.43us against 0.52us).
   Never a built class name (`R-5.2-3`). Sizes, radius, border, focus, hover, transitions
   and `CONTAIN` come from `shared/classes.ts` (`R-5.2-4`, `R-5.2-7`).
9. **`index.tsx`** - the server half. No `'use client'`, no client hook, no import of
   `./hook.js` (`R-5.1-1`). Spread the rest onto the root and emit presence attributes
   (`data-open`, not `data-state="open"`, `R-5.7-6`). A component takes `render` only where
   its Build this block says so, and then through `renderElement` (`R-5.7-4`); none of the
   nine server components of Unit 1 does.
10. **`client.tsx` and `hook.ts`**, only if the catalog row says `C` or `Sp`. `client.tsx`
   is JSX plus at most one `useXxx()` call; every `useState`, `useEffect`, `useRef`,
   `useMemo` and `useCallback` lives in `hook.ts`, and pure helpers in `lib.ts`
   (`R-5.12-1`).
11. **`skeleton.tsx`**, only where the Build this block names one - the real dimensions,
    from the same size knobs the component uses. A skeleton that reserves the wrong height
    is a layout shift.
12. **`dummy/*.tsx`** - one demo per file, covering every variant, size, tone and state,
    plus an `rtl.tsx`. Each file becomes 6 harness pages and is picked up automatically
    by the axe and target-size specs; the focus-ring and contain specs measure Button's
    demos only. This is the cheapest coverage in the repo; use it. The target-size spec
    measures every `button` and `a[href]` in every demo, so a link in a demo is a `Button`
    with `render`, never a bare `<a href>`.
13. **Tests**, in `test/`. Button's fourteen files are the pattern:
    behaviour, the design attributes, every variant, every tone, the states, the schema,
    the types, the skeleton, the `render` prop, the demos under SSR, hydration in the DOM,
    and `meta.ts`. Suffix rules: `.dom.test.tsx` for happy-dom, `.rsc.test.tsx` for a
    React Server Components tree, `.ssr.test.tsx` and plain `.test.tsx` for SSR,
    `.test.ts` for node.
14. **`meta.ts`** - `baseUi` and `baseUiRange` are `null` for a component that imports no
    Base UI part, and otherwise the part and the version you read the types from
    (`@base-ui/react` is 1.8.0 today). Set the category and the tier from the catalog row:
    the scaffold writes `'actions'`, tier 1 and `'draft'`. `status` is `'beta'` while
    section 20 is not fully met.
15. **Labels**, if the component has any built-in text: add it to
    `src/shared/labels/en.ts` **and** `ar.ts`. A label with a count is
    `(n, fmt) => string` using `Intl.PluralRules` in Arabic (`R-5.11-1`, `R-5.11-2`).
    This is a shared file - read section 9 first. Unit 1 adds no label key.
16. **`pnpm readme:build`, then `pnpm check`.** Rebuild the README whenever `schema.ts`,
    `types.ts` or `meta.ts` changed, or `check:readme` fails on a stale file, and replace
    every scaffolded `TODO(tc)`: the schema descriptions, the comment in `meta.ts` and the
    placeholder between the hand-written markers of `README.md` (`R-8.1-3`).
17. **Add a mutation** for whatever the component's hardest guarantee is, in a file of the
    component's own, `scripts/mutations/<slug>.ts`; the Build this block names it. Copy the
    shape of `scripts/mutations/kbd.ts`. The runner finds the file by itself: do not edit
    `scripts/mutations/index.ts`. Every component should leave one behind. Prove it bites
    by breaking the source by hand first, then run **`pnpm test:mutation`** once, with the
    new row in it. A green suite that no mutation disturbs is a suite that measures nothing.
18. **Push the branch, open a pull request** with the body from section 12. Do not merge.

---

## 9. Shared files: the serialization rules

These files are touched by many components and are where parallel work goes wrong:

```
src/tokens.css                 src/shared/labels/en.ts    src/shared/labels/ar.ts
src/shared/classes.ts          src/shared/contracts/*     src/styles.css
docs/DECISIONS.md              scripts/mutations/shared.ts
```

The rule: **a change to a shared file is its own pull request, merged before the component
branches that need it.** Never two component branches editing `en.ts` at the same time.

In practice:

- Before starting a batch, read the batch's components and list every shared addition they
  need - a new label, a new token, a new class constant, a new contract value.
- Land those first, each in its own small `feat(shared):` pull request with tests. Unit 1
  has two, listed in `docs/figma/unit-1.md`.
- Then create the worktrees that need them from the new `main`.
- A component branch edits no shared file for its mutations. They go in a file of its own,
  `scripts/mutations/<slug>.ts` (step 17), and `scripts/mutations/index.ts` finds every
  file in that folder by itself, so nobody edits `index.ts`. A row that breaks a shared
  file belongs to the shared pull request that changes that file: `shared.ts` for
  `src/shared` and the stylesheets, `scripts.ts` and `eslint-rules.ts` for the tooling.
  `docs/DECISIONS.md` is newest entry first, directly under the `---`, and no component
  branch edits it (see below).

A new tone, size or state value is a change to a contract, which reaches every component
at once. That is a decision, not a component detail. Ask.

**A decision made inside a component branch goes in the pull request body**, under
Decisions, not in `docs/DECISIONS.md`. The local session records one entry per unit when it
merges, so ten branches never edit that file at once.

---

## 10. What "done" means in this plan

`docs/PLAN.md` section 20 has seventeen lines. Thirteen apply to you today. Four cannot
be met because the infrastructure does not exist:

| Line | Status here |
|---|---|
| The visual matrix is approved and matches Figma | **deferred** - no baselines exist; the tokens, parts and states still follow `docs/figma/unit-1.md` |
| Behaviour tests pass in Firefox and WebKit | **deferred** - Chromium only today |
| The docs page exists in English and Arabic | **deferred** - no docs site |
| A changeset is added | **deferred** - no `.changeset/` |

Do not silently drop them. For each component, the four deferred lines go in the pull
request body under **Deferred**, and `meta.ts` keeps `status: 'beta'` until they are met.
That is what `'beta'` means in this repo and `button.meta.test.ts` already enforces the
link between the two.

The thirteen that do apply are not negotiable. In particular: zero lint disables,
`check-structure` and `check-boundaries` green, every built-in string from `labels` with
an Arabic default, the `xs | sm | md | lg | xl | custom` scale, `className`, `style`,
`ref` and rest props passed through, schema limits clamped, axe clean in all three modes
and both directions, and the SSR and hydration tests green.

---

## 11. The traps - what Button actually cost

Every item here was a real bug that shipped green at least once. They are listed because
they will happen again.

**Tooling and shell**

1. **Heredocs and template literals eat backslashes.** A regex written as `` `\s` `` in a
   template literal becomes `s`. A heredoc once wrote a literal backspace byte (0x08)
   where the source said `\b`, which left a `check-structure` rule dead from birth while
   it reported success. Use `String.raw`, a regex literal, or the Edit tool.
   `scripts/lib/bytes.test.ts` walks every text file for control bytes and BOMs - if it
   fails, that is why.
2. **Windows and Linux differ, and CI is Linux.** A literal `/` in a path filter, a bare
   Windows path passed to `import()`, and a POSIX-only browser path have each broken CI
   while passing locally. Use `node:path`, and `pathToFileURL` for dynamic imports.
3. **`pnpm check` runs Playwright.** It cannot launch a browser it has not downloaded.
   `npx playwright install --with-deps chromium` once per machine.
4. **Line endings are LF, enforced by `.gitattributes`.** A file with no trailing newline
   makes git report its line endings as `none`, which fails the CI check. End every file
   with a newline.

**Tailwind and CSS**

5. **`outline-none` sets `--tw-outline-style: none`,** which the width utility then
   substitutes, so a focus ring paints nothing. `FOCUS_RING` uses `outline-none` plus
   `focus-visible:outline-solid` (not `outline-hidden`: under forced colours it rings every
   control at rest). Verified in a real browser: 0 ring pixels before the
   fix, 592 after. The e2e spec exists because the unit tests could not see it.
6. **`@theme inline` stops Tailwind emitting the declaration.** Putting
   `--default-transition-duration` inside `@theme inline` killed every transition while
   every test stayed green. It lives in a plain `@theme` block.
7. **A class-list assertion proves nothing about the cascade.** Two utilities that set the
   same property have the same specificity, so the emitted order decides.
   `src/cascade.test.ts` pins the order for `opacity`; do the same for any new pair.
8. **A class that can never paint is dead code.** `aria-busy:cursor-progress` was shipped
   and asserted for weeks; a loading control is always `pointer-events: none`, so no
   cursor could ever show. See `docs/DECISIONS.md`, 2026-10-06.
9. **`@source` is what makes Tailwind scan `src/`.** Without those three lines a
   consumer's build emits no component CSS at all. `src/sources.test.ts` guards them, and
   it covers any new folder under `src/` that writes classes.
10. **A token declared in one mode is undefined in the other two.** `check-css` now fails
    on that. Declare in `:root` unless the value really is per-mode.

**React and Base UI**

11. **`mergeProps` merges `className` right to left** and does **not** merge `ref`.
    `renderElement` composes both refs itself and runs `cn()` in the right order. If you
    write another merge path, read `src/shared/render.ts` first.
12. **A `render` element's own props win.** That is deliberate - an explicit prop on the
    element the caller passed beats the component's. It also means you cannot remove one
    of its props by passing `undefined`; you have to `cloneElement` the element itself.
13. **`disabled || loading`, never `disabled ?? loading`.** With `??` a caller re-enables
    a loading button by passing `disabled={false}`. A test once asserted the wrong
    semantics as correct.
14. **A non-native element needs the ARIA pair, not `disabled`.** `aria-disabled` plus
    `tabIndex={-1}`, which is exactly what Base UI's `useButton` does. Base UI also
    cancels activation in `onClick`; a Server Component has no handler, so for an
    intrinsic `<a>` the `href` is removed instead and `role="link"` keeps it announced.
15. **The `rsc` Vitest project needs both `ssr.resolve.conditions` and
    `ssr.resolve.externalConditions` set to `['react-server']`.** One alone silently
    resolves the browser build.

**Tests that lie**

16. **A test that cannot fail is worse than no test.** A focus-ring assertion once
    measured a PNG's byte length, which is never zero. An opacity assertion checked the
    class attribute, not the cascade. Ask of every new test: what single-character change
    to the source makes this fail? If there is none, delete it or fix it.
17. **Run `pnpm test:mutation` before claiming a component is tested.** 47 mutations today
    and every one is caught. Add one per component.
18. **Review agents leave probe files behind.** If `tsc` suddenly fails on a file you do
    not recognise, that is what happened. Delete it.

---

## 12. Commits, branches, pull requests

- One component per branch and per pull request. Many catalog rows name more than one
  component; in Unit 1 they are `Skeleton, Spinner`, `EmptyState, ErrorState` and
  `Progress, Meter`. Each component is still its own branch, which is how "one catalog row
  per branch" at the top of `CLAUDE.md` reads in this plan.
- Branch names: `feat/<slug>` for a component, `feat/shared-<thing>` for a shared
  addition, `fix/<slug>-<what>` for a follow-up.
- Conventional commits, subject in lower case, describing the effect and not the file
  list. Look at `git log` for the register: *"fix(ci): the three Windows and CI faults the
  Linux session could not see"*.
- A commit message is that one subject line: no body and no `Co-Authored-By` trailer.

- Pull request body, every time:

  ```markdown
  ## What
  One line. Which catalog row.

  ## Gates
  Paste the real tail of `pnpm check` and of `pnpm test:mutation`. Real output, not a
  summary. If something fails and you could not fix it, say so here.

  ## Definition of Done
  The thirteen lines that apply, each ticked or explained.

  ## Deferred
  The four lines from section 10, unchanged, plus anything the Build this block defers.

  ## Decisions
  Anything you had to decide, and the "Not built" line of the Build this block. The local
  session records them in `docs/DECISIONS.md` when the unit merges.

  ## For the reviewer
  Where you are least confident. Be specific - this is the most useful section in the
  file.
  ```

- **Never merge, never force-push a shared branch, never push to `main`.**

---

## 13. Budget

The credit is finite and the work is long, so spend it on building, not on rediscovery.

- **Read before you write.** Button and its tests are maybe twenty minutes of reading and
  they remove most of the trial and error from the first ten components.
- **Run the cheap gates often, the expensive ones once.** `pnpm typecheck` and
  `pnpm lint` are seconds. `pnpm check` is a minute or two. `pnpm test:mutation` runs the
  whole suite once per mutation - run it at the end of a component, not during.
- **Three or four worktrees at a time**, not ten. Past that, the shared-file conflicts
  cost more than the parallelism returns. Ten per unit is the review round, not the
  number running at once - see Appendix A.
- **Do not re-derive what `docs/DECISIONS.md` already settled.** It is the cheapest file
  in the repo.
- **Stop at a blocker and say so.** A long session spent working around a missing shared
  piece is the single most expensive failure mode available to you.

---

## Appendix A - Track A units

Ten components per unit. One unit is one review round: the cloud session builds all ten,
the local session reviews all ten, then they merge together and the next unit starts.

**Ten, not fifteen.** The limit is not the worktrees, it is the two things that do not
parallelise: shared files (section 9) and review. Fifteen pull requests in one round
means the review becomes a rubber stamp, which is the one failure this whole plan exists
to prevent. If a unit lands with no findings worth fixing, raise the next one to fifteen.

**Inside a unit, run three or four worktrees at a time**, not ten. Each component is one
worktree, one branch, one pull request; three or four run at once so that two components
never edit `shared/labels/en.ts` on the same afternoon.

### The list this follows

The home page advertises **46 components**, and that set is what v0.1 owes anyone who
reads it. `docs/PLAN.md` section 18 is a larger internal catalog across four tiers, and
the two disagree: the catalog has `Heading`, `Text`, `Container`, `Stack` and others the
site never promises. **The site's 46 wins.** Build those, then look at what is left and
decide whether it earns a place.

### Unit 1 - the ones closest to Button

| # | Component | Mode | Why it is here | New ground it breaks |
|---|---|---|---|---|
| 1 | `Badge` | S | Button's variant and tone machinery with no interaction | none - it re-proves the template |
| 2 | `Spinner` | S | every `loading` state needs it | first component to take the `labels` prop |
| 3 | `Skeleton` | S | every later `skeleton.tsx` is built on it | the `rows` boundary |
| 4 | `Separator` | S | orientation without tone | first `orientation` prop, and its RTL |
| 5 | `Kbd` | S | a keyboard key | smallest component on the list |
| 6 | `Alert` | S | tones, an icon, a title, actions | first component that composes an icon |
| 7 | `EmptyState` | S | used by every later `empty-state.tsx` | labels with an illustration slot |
| 8 | `Progress` | S | `value`, clamped to 0 to 100 | **a clamped value that drives a CSS variable** |
| 9 | `Card` | S | header, body, footer | **first multi-part component: `CardRoot` (R-9.2-4)** |
| 10 | **`Tooltip`** | **C** | the full text of a truncated label has to be readable | **the first client component in the repo** |

**What each one is** - its parts, props, defaults and classes - is the Build this block of
its section in `docs/figma/unit-1.md`. This table says why a component is in the unit; that
file says what to build.

**Build order.** Open the two shared pull requests, then `Badge` **alone**: it re-proves
the whole template end to end and the local session reviews it before any other component
starts. Then 2 to 9 in three or four worktrees at a time. `Tooltip` **last and alone**.

Three of these break genuinely new ground, so expect them to take longer than the rest:
`Progress` is the first component whose clamped value drives a CSS variable, `Card` is the
first split into parts, and `Tooltip` is the first that runs in the browser at all.

**Why Tooltip is in a server unit.** It is the only `C` component here and the first in
the repo, so it is the second template: `'use client'`, `client.tsx` and an `index.tsx`
that only re-exports. It earns the same care Button got. It is
in this unit rather than later because `R-5.2-7` truncates a long label to an ellipsis,
and the text it hides has to be readable somewhere.

**Shared additions, each in its own pull request first (section 9):**
`feat/shared-progress-token`, before `Progress`: the `--tc-progress-value` line in
`src/tokens.css` and the type declaration in a new `src/shared/style-tokens.ts` that lets
`style` carry a `--tc-*` key; and `feat/shared-tooltip-provider`, the Base UI
`Tooltip.Provider` inside `TopClassProvider`, before `Tooltip`. No label and no icon is needed: every string and all
twelve icons the designs use already exist.

**What Button already settled, so do not reinvent it:** the folder contract including
`boundaries.ts`, `classes.ts` and `lib.tsx`, `memoizeVariants` from `#shared/variants.js`,
`CONTAIN` and `LABEL` for a long label, `renderElement` for the `render` prop, the tone
and size contracts, and the generated `README.md`. A component that needs none of these
is probably wrong.

### Unit 2 - the rest of the server set

**What each one is** - parts, props, defaults, classes and what is left out - is its Build
this block in `docs/figma/unit-2.md`, which also lists the four shared pull requests that
land first and what Unit 1 taught. Where that file and the paragraph below differ, the file
wins.

`Input`, `Table`, `Breadcrumb`, `Pagination`, `Timeline`, `Tag`, `Avatar`,
`AvatarGroup`, `Banner`, `Rating`.

`Input` is the first form control and the first consumer of `TEXT_MAX_LENGTH`
(`R-5.7-8`): its `maxLength` comes from the shared default by input type, the browser
enforces it, and a prop overrides it. `Table` and `Timeline` are the first components
that render items, so they are the first to use `useCollection` (`R-8.5-1`).
`Pagination` is real `href`s with `siblingCount` clamped.

### Unit 3 - the overlays

`Dialog`, `Drawer`, `Popover`, `Toast`, `DropdownMenu`, `CommandPalette`, `Tabs`,
`Accordion`, `Navbar`, `Sidebar`.

All client or split. By now Tooltip has settled the client template and `shared/floating`
already exists, so this unit fills the provider's toast viewport (the tooltip provider
lands in Unit 1) and
proves `R-10.5-1`: a popup that stays inside the viewport, a body that scrolls inside
itself, and focus that returns to the trigger.

### Unit 4 - the remaining form controls

`Select`, `Combobox`, `Checkbox`, `RadioGroup`, `Switch`, `Slider`, `NumberField`,
`Textarea`, `SegmentedControl`, `OTPField`.

Phase 4 of `docs/PLAN.md` section 19, with its acceptance criteria. `Switch` opens it,
alone, because it settles `checked`/`onCheckedChange` against `value`/`onValueChange`
for every control after it.

### Unit 5 - what is left

`DatePicker`, `FileUpload`, `TreeView`, `Stepper`, `CodeBlock`, `Progress`'s sibling
`Meter`, and whatever the first four units proved was missing. Then, and only then, read
`docs/PLAN.md` section 18 again and decide which of the catalog's extras - `Heading`,
`Text`, `Container`, `Stack`, `Grid` - earn a place. In a Tailwind library most of them
are indirection over `max-w-5xl mx-auto px-4`, so the default answer is no.

---

## Appendix B - the strict `docs/PLAN.md` section 19 order

If Omar prefers the plan as written, Phase 4 is: `Field`, `Label`, `Input`, `Textarea`,
`Checkbox`, `RadioGroup`, `Switch`, `NumberField`, `Slider`, `Select`, `Form`, with the
acceptance criteria in section 19 under **Phase 4 - forms**.

In that case:

1. `Field` and `Label` go first and alone - they are the architecture every other control
   plugs into, and they are the `Sp` split (server half passes control props through a
   render-prop child, `FieldLive` wraps Base UI Field).
2. `Input` and `Textarea` next, still serial, because they are the first controls to go
   through `Field`.
3. Only then parallelise `Checkbox`, `RadioGroup`, `Switch`.
4. `NumberField`, `Slider`, `Select` last - `Select` needs the collection contract and a
   ten-thousand-option demo.
5. `Form` closes the phase, because its acceptance criterion is a whole working form with
   JavaScript disabled.

Everything else in this plan - the worktrees, the recipe, the shared-file rules, the
traps, the pull request format - applies unchanged.

---

## Appendix C - the `docs/DECISIONS.md` entry for this order, already recorded

This entry has been in `docs/DECISIONS.md` since 2026-10-07. It is kept here for reference;
do not add it again.

```markdown
## 2026-10-07 - The site's 46 is the build list, server set first

**Decision.** The 46 components the home page advertises are what v0.1 builds, in the five
units of Appendix A in docs/CLOUD-PLAN.md: the server set first, Tooltip as the first
client component, then the overlays, then the Phase 4 form controls. PLAN.md section 18
stays as the long-term catalog, and its extras - Heading, Text, Container, Stack, Grid -
are reconsidered only after the 46 ship.

**Why.** Two reasons, and they point the same way. The catalog and the site disagree: the
catalog lists components the home page never promises, so building them first would delay
what a reader was told to expect. And no component has a client.tsx yet, so the client
half of the folder contract is described by R-5.12-1 and checked by check-boundaries but
proven by nothing; Phase 4 is almost entirely client components, which would mean
inventing the client template, the Field architecture and the Base UI Field integration at
volume and in parallel. The server set copies Button exactly, so it is quantity rather
than design, and it re-proves the template before the second one is written.

**Affects.** PLAN.md section 19 phase order and section 18's priority. Every Definition of
Done line and every acceptance criterion is unchanged, and Phase 4's own criteria still
gate the form controls when Unit 4 reaches them.
```
