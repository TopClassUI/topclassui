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

Verified on branch `feat/button`, 2026-10-07, all eleven gates green:

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
  6 pages (3 modes x 2 directions) and is automatically covered by the axe,
  target-size and focus-ring specs.

**Not built. Do not try to use them:**

- `pnpm test:visual` and `pnpm size` - no visual baselines, no size-limit wiring.
- No `.changeset/`. The Definition of Done asks for a changeset; there is nowhere to put
  one yet. Skip that line and record it (section 10).
- No docs site, no docs pages, no props-table generation.
- No monorepo. One package, `src/` at the root. `docs/PLAN.md` section 4 still describes
  three packages; that is an open question in `docs/STATUS.md`, not your problem.
- **No component has a `client.tsx` yet.** Nothing in the repo has ever shipped
  `'use client'`. `check-boundaries` has rules for it and `R-5.12-1` describes it, but no
  component proves the pattern works. This is why Track B exists.

---

## 4. Out of scope, explicitly

Do not build, edit or plan: the docs site, any page, any route, MDX, the props table
generator, Figma frames or Figma parity, `@topclassui/next`, the SEO kit, the CLI
(`npx topclassui add`), the editor kit, the release pipeline, the monorepo split.

Do not add a dependency. Do not add a script. Do not add a gate. Do not edit
`docs/PLAN.md`, `docs/RULES.md`, `CLAUDE.md`, `AGENTS.md` or `.cursor/rules/`.

If a component needs something that does not exist, **stop that component**, say so in
the pull request, and either add the missing piece to `src/shared/` in its own small
pull request with tests first, or wait. That is `docs/PLAN.md` section 19's rule for
Phases 4 to 7 and it is not negotiable: *no new infrastructure inside a component
branch.*

---

## 5. One thing Omar must confirm before you start

`docs/PLAN.md` section 19 puts **forms** next (Phase 4: Field, Label, Input, Textarea,
Checkbox, RadioGroup, Switch, NumberField, Slider, Select, Form).

This plan recommends a different order, and that is a deviation that needs Omar's word.
**The recommendation:** build the tier-1 **server** components first, then one client
component as a second template, then forms.

The reasoning:

1. Forms are almost all client components, and **no client component exists yet**. Phase
   4 would mean inventing the client template, the Field/Form architecture, the Base UI
   Field integration and the `labels` wiring all at once, in parallel, at volume. That is
   design work, not quantity work.
2. The server set is pure template-copying. Button already proves every part of it, so
   the throughput is high and the risk is low - exactly what the cloud session is for.
3. One client component built carefully, alone, and reviewed hard is worth more than
   eleven built on a pattern nobody has validated.

**If Omar says yes:** paste the entry in Appendix C into `docs/DECISIONS.md` as your
first commit, then follow section 6.
**If Omar says no:** use Appendix B, the strict Phase 4 order, and expect Track B's work
to happen inside the Field/Input branch instead.

Until Omar answers, Gate 0 below is safe to do either way.

---

## 6. The order of work

### Gate 0 - land Button first

Nothing starts until `feat/button` is merged to `main`. Every component branch must
start from a `main` that already contains Button, the tone contract, `shared/classes.ts`
and the eleven gates, or you will rebase forty times.

Omar merges it. Your job is to confirm `origin/main` contains `src/components/button/`
before creating any worktree.

### Track A - the server set, in parallel worktrees

Three to four worktrees at a time. Each is one component, one branch, one pull request.
Ten components per unit, three or four worktrees running at a time. See Appendix A.

### Track B - the first client component, alone

**Switch.** One worktree, no parallel work beside it, highest care. It is the second
template, so it decides the shape of thirty other components.

Switch is the right first client component because it is the smallest real Base UI
control that still exercises everything the pattern needs: `'use client'`, `client.tsx`,
`hook.ts`, `useControllableState`, a hidden input for no-JS form submission, a thumb that
must translate by `--tc-dir` in RTL (`R-5.3-2`), the `data-*` state attributes of
`R-5.7-6`, and a hydration test.

Switch also forces one API decision that every later control inherits: Base UI uses
`checked` / `defaultChecked` / `onCheckedChange`, and `R-5.7-1` says controlled pairs are
`value` / `defaultValue` with `onValueChange`. **Do not guess.** Read
`node_modules/@base-ui/react/switch/`, write the recommendation in the pull request, and
let Omar choose. Record it in `docs/DECISIONS.md` once he does.

Run Track B after Batch 1 of Track A, so the server template is re-proven first.

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

---

## 8. The per-component recipe

Follow it in order. The gate after each step is the point - a failure found at step 4 is
a minute, the same failure found at step 11 is an hour.

1. **Read the catalog row** (`docs/PLAN.md` section 18) and the Figma frame name if one
   is recorded. The row decides the rendering mode (`S`, `Sp`, `C`), the tier and the
   notes. The row is the specification; do not widen it.
2. **Scaffold.** `pnpm new:component <slug>`. It writes `constants.ts`, `boundaries.ts`,
   `classes.ts`, `schema.ts`, `types.ts`, `variants.ts`, `index.tsx`, `meta.ts`,
   `README.md`, `test/<slug>.test.tsx` and `dummy/basic.tsx`, and the result already
   passes `pnpm check`. Run it now, before writing a line, so you know the baseline is
   green.
3. **The folder contract gained three files since Button.** `boundaries.ts` holds the
   bounds and nothing else (`R-8.3-6`), `classes.ts` holds this component's class tables
   (`R-5.12-4`), and `lib.tsx` is where a pure helper that returns JSX lives, because
   `lib.ts` may not import React. `pnpm new:component` writes all three.
4. **Check the installed types before using any API** (`R-0-1`). Open
   `node_modules/@base-ui/react/<part>/` and read the `.d.ts`. Never guess a prop name.
   Anything that differs from what you expected goes in `docs/DECISIONS.md`.
5. **`constants.ts` and `boundaries.ts`** - the value lists as `as const` arrays go in
   `constants.ts` and nothing else does; the defaults and the bounds go in `boundaries.ts`,
   which is the one file a team opens to see what it may override (`R-8.3-6`). Sizes
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
   `./hook.js` (`R-5.1-1`). Spread the rest onto the root, support `render` through
   `renderElement` (`R-5.7-4`), and emit presence attributes (`data-open`, not
   `data-state="open"`, `R-5.7-6`).
10. **`client.tsx` and `hook.ts`**, only if the catalog row says `C` or `Sp`. `client.tsx`
   is JSX plus at most one `useXxx()` call; every `useState`, `useEffect`, `useRef`,
   `useMemo` and `useCallback` lives in `hook.ts`, and pure helpers in `lib.ts`
   (`R-5.12-1`).
11. **`skeleton.tsx`** - the real dimensions, from the same size knobs the component
    uses. A skeleton that reserves the wrong height is a layout shift.
12. **`dummy/*.tsx`** - one demo per file, covering every variant, size, tone and state,
    plus an `rtl.tsx`. Each file becomes 6 harness pages and is picked up automatically
    by the axe, target-size and focus-ring specs. This is the cheapest coverage in the
    repo; use it.
13. **Tests**, in `test/`. Button's fourteen files are the pattern:
    behaviour, the design attributes, every variant, every tone, the states, the schema,
    the types, the skeleton, the `render` prop, the demos under SSR, hydration in the DOM,
    and `meta.ts`. Suffix rules: `.dom.test.tsx` for happy-dom, `.rsc.test.tsx` for a
    React Server Components tree, `.ssr.test.tsx` and plain `.test.tsx` for SSR,
    `.test.ts` for node.
14. **`meta.ts`** - set `baseUi` and `baseUiRange` to the version you read the types from
    (`@base-ui/react` is 1.8.0 today). `status` stays `'beta'` while section 20 is not
    fully met.
15. **Labels**, if the component has any built-in text: add it to
    `src/shared/labels/en.ts` **and** `ar.ts`. A label with a count is
    `(n, fmt) => string` using `Intl.PluralRules` in Arabic (`R-5.11-1`, `R-5.11-2`).
    This is a shared file - read section 9 first.
16. **`pnpm check`**, then **`pnpm test:mutation`**. A green suite that no mutation
    disturbs is a suite that measures nothing.
17. **Add a mutation** for whatever the component's hardest guarantee is, in
    `scripts/mutations/index.ts`. Every component should leave one behind. Prove it bites
    by breaking the source by hand first.
18. **Push the branch, open a pull request** with the body from section 12. Do not merge.

---

## 9. Shared files: the serialization rules

These files are touched by many components and are where parallel work goes wrong:

```
src/tokens.css                 src/shared/labels/en.ts    src/shared/labels/ar.ts
src/shared/classes.ts          src/shared/contracts/*     src/styles.css
docs/DECISIONS.md              scripts/mutations/index.ts
```

The rule: **a change to a shared file is its own pull request, merged before the component
branches that need it.** Never two component branches editing `en.ts` at the same time.

In practice:

- Before starting a batch, read the batch's components and list every shared addition they
  need - a new label, a new token, a new class constant, a new contract value.
- Land those in one small `feat(shared):` pull request first, with tests.
- Then create the worktrees from the new `main`.
- `scripts/mutations/index.ts` is append-only: add at the end of the array and the merge
  conflict is trivial. `docs/DECISIONS.md` is the opposite - newest entry first, directly
  under the `---` - so expect a conflict there and resolve it by keeping both entries in
  date order.

A new tone, size or state value is a change to a contract, which reaches every component
at once. That is a decision, not a component detail. Ask.

---

## 10. What "done" means in this plan

`docs/PLAN.md` section 20 has seventeen lines. Thirteen apply to you today. Four cannot
be met because the infrastructure does not exist:

| Line | Status here |
|---|---|
| The visual matrix is approved and matches Figma | **deferred** - no baselines exist |
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
   substitutes, so a focus ring paints nothing. `FOCUS_RING` uses `outline-hidden` plus
   `focus-visible:outline-solid`. Verified in a real browser: 0 ring pixels before the
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
17. **Run `pnpm test:mutation` before claiming a component is tested.** 33 mutations today
    and every one is caught. Add one per component.
18. **Review agents leave probe files behind.** If `tsc` suddenly fails on a file you do
    not recognise, that is what happened. Delete it.

---

## 12. Commits, branches, pull requests

- One catalog row per branch and per pull request (`docs/PLAN.md` section 18, and the
  rule at the top of `CLAUDE.md`).
- Branch names: `feat/<slug>` for a component, `feat/shared-<thing>` for a shared
  addition, `fix/<slug>-<what>` for a follow-up.
- Conventional commits, subject in lower case, describing the effect and not the file
  list. Look at `git log` for the register: *"fix(ci): the three Windows and CI faults the
  Linux session could not see"*.
- End every commit message with:

  ```
  Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
  ```

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
  The four lines from section 10, unchanged.

  ## Decisions
  Anything you had to decide, and whether it is in `docs/DECISIONS.md` yet.

  ## For the reviewer
  Where you are least confident. Be specific - this is the most useful section in the
  file.

  🤖 Generated with [Claude Code](https://claude.com/claude-code)
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

### Unit 1 - the ones closest to Button

| # | Component | Mode | Why it is here | New ground it breaks |
|---|---|---|---|---|
| 1 | `Badge` | S | Button's variant and tone machinery with no interaction | none - it re-proves the template |
| 2 | `IconButton` | S | Button with a required `label` | first required prop; first **yes** in a README |
| 3 | `Spinner` | S | every `loading` state needs it | first `labels` entry of its own |
| 4 | `Skeleton` | S | every later `skeleton.tsx` is built on it | the `rows` boundary |
| 5 | `Separator` | S | orientation without tone | first `orientation` prop, and its RTL |
| 6 | `Heading` | S | `level` separate from `size` | semantics split from looks |
| 7 | `Text` | S | sizes, `muted`, truncate, line clamp | first numeric boundary after Button |
| 8 | `Code` | S | inline code | smallest component in the catalog |
| 9 | `Container` | S | max width and gutters | first layout primitive |
| 10 | **`Tooltip`** | **C** | the full text of a truncated label has to be readable | **the first client component in the repo** |

**Build order.** `Badge` first and **alone**: it re-proves the whole template end to end
and the local session reviews it before anything else starts. Then 2 to 9 in three or
four worktrees at a time. `Tooltip` **last and alone**.

**Why Tooltip is in a server unit.** It is the only `C` component here, and it is the
first in the repo, so it is the second template - `client.tsx`, `hook.ts`, `'use client'`,
and the first use of `zod/mini` if it needs validation at all. It earns the same care
Button got. It is in this unit rather than later because `R-5.2-7` truncates a long label
to an ellipsis, and the text it hides has to be readable somewhere.

**Shared additions, which land first in their own pull request (section 9):** labels for
`IconButton`, `Spinner` and `Tooltip`.

**What Button already settled, so do not reinvent it:** the folder contract including
`boundaries.ts` and `lib.tsx`, `memoizeVariants` from `#shared/variants.js`, `CONTAIN` and
`LABEL` for a long label, `renderElement` for the `render` prop, the tone and size
contracts, and the generated `README.md`. A component that needs none of these is
probably wrong.

`Stack` moved to Unit 2 to keep this unit at ten.

### Unit 2 - containers, feedback and navigation

`Stack`, `Grid`, `Card`, `Alert`, `EmptyState`, `ErrorState`, `Link`, `VisuallyHidden`,
`SkipLink`, `Breadcrumb`.

`Card` is the first multi-part component, so it proves `R-9.2-3` and `R-9.2-4`: flat
exports, `CardRoot`, and the `Header`/`Body`/`Footer` naming. `Alert`, `EmptyState` and
`ErrorState` all carry labels and an icon. `Link` settles external-link handling,
`Breadcrumb` emits structured data, and `Pagination` is real `href`s with `siblingCount`
clamped - the second schema limit.

Shared additions expected: labels for `Alert`, `EmptyState`, `ErrorState`, `SkipLink`,
`Breadcrumb` and `Pagination`; possibly one or two icons in `raw/`.

### Unit 3 - Switch and the first forms

`Switch` opens it, alone and first: it is the first *form* control, so it settles the
`checked` / `onCheckedChange` versus `value` / `onValueChange` question that every later
control inherits (section 6, Track B). Only when it is merged do the rest start.

Then `Pagination`, carried over from Unit 2, and the Phase 4 forms in the order of
`docs/PLAN.md` section 19: `Field`, `Label`, `Input`, `Textarea`, `Checkbox`,
`RadioGroup`, `NumberField`.

`Field` and `Label` go second and together, because they are the architecture every other
control plugs into. `Input` and `Textarea` follow. `NumberField` is the first component to
exercise `R-5.7-8`: it limits with `min`, `max` and `step`, never with `maxLength`.

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

## Appendix C - the `docs/DECISIONS.md` entry to paste if the order is accepted

Add this to `docs/DECISIONS.md` **at the top**, under the `---`, because that file is
newest first. Nothing else in that commit.

```markdown
## 2026-10-06 - The server tier-1 set is built before Phase 4 forms

**Decision.** After Button lands, the next components are the tier-1 server components of
catalog 18.1 to 18.3 (Appendix A of docs/CLOUD-PLAN.md), then Switch as the first client
component, then Phase 4 forms in the order of PLAN.md section 19.

**Why.** No component has a `client.tsx` yet, so the client half of the folder contract is
described by R-5.12-1 and checked by check-boundaries but proven by nothing. Phase 4 is
almost entirely client components, which would mean inventing the client template, the
Field architecture and the Base UI Field integration at volume and in parallel. The server
set copies Button exactly, so it is quantity rather than design, and it re-proves the
template before the second one is written.

**Affects.** PLAN.md section 19 phase order only. Every Definition of Done line and every
acceptance criterion is unchanged, and Phase 4's own criteria still gate Phase 4.
```
