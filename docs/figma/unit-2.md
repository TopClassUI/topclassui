# Figma facts for Unit 2

The next ten components: Input, Tag, Avatar, AvatarGroup, Rating, Breadcrumb, Pagination,
Timeline, Table and Banner. Read `docs/figma/unit-1.md` first: its sections "How to use this
file" and "Rules for all ten" apply here unchanged, and this file only adds to them.

**Read this instead of Figma.** File `BxRSdAVOhk9Hj3Tkq4tjcy`, read on 2026-10-09: the ten
docs previewers in `Docs site - LTR` (133:148) and their drawings on the Components page.
One reader, not yet re-checked: where a fact looks wrong, build from the Build this block
and say so in the pull request.

## What Unit 1 taught, and what changes

- **Server half only.** Five of the ten are marked "split" on the site: Tag, Avatar,
  AvatarGroup, Rating and Banner. Unit 2 builds the part that renders on the server and
  ships no JavaScript. The client half of each (remove, image-error fallback, editing,
  dismiss) is named under Not built and comes with Unit 3, after the overlays.
- **Commit as Omar.** `git config user.name "OmarAbed16"` and
  `git config user.email "OmarFathiAbed@gmail.com"` before the first commit. No commit
  carries "Claude" as author or committer, and no trailer.
- **No attribution in pull requests.** No "Generated with" line, no session link, and no
  comments posted on a pull request: put everything in the description.
- **One mutation file per component.** `scripts/mutations/<slug>.ts` exports that
  component's rows and `scripts/mutations/index.ts` collects them. Ten branches appending
  to one array meant ten merge conflicts in Unit 1; do not append to `index.ts`.
- **A helper two components need goes in `src/shared/` first**, in its own pull request.
  `truncateLabel` was copied into Badge and had to be lifted afterwards.
- **A link in a demo is a `Button` with `render`**, and a title inside a demo card is an
  `<h2>`. A bare `<a href>` fails the target-size spec; an `<h3>` fails axe.
- **GitHub's checks may not run** (the Actions budget). The gate is `pnpm check` and
  `pnpm test:mutation` on your machine: paste the real tail in the description.

## Shared pull requests

Open these first, each on its own, before any component.

1. **`feat/shared-mutation-files`.** Split `scripts/mutations/index.ts` into one file per
   area (`shared.ts`, `button.ts`, one per Unit 1 component) and make `index.ts` only
   collect them. The runner and its tests keep working unchanged.
2. **`fix/readme-part-family`.** `scripts/lib/readme.ts` prints
   `import { Card } from 'topclassui'` for a component split into parts. It should print
   the flat part names the folder exports. Avatar needs this.
3. **`feat/shared-unit-2-labels`.** In `src/shared/labels/en.ts`, `ar.ts` and `types.ts`:
   `breadcrumb.label` ("Breadcrumb"), `breadcrumb.home` ("Home"), `rating.value`
   (a count label, "4 out of 5"), `avatar.more` (a count label, "9 more"), `table.sortedAscending`,
   `table.sortedDescending` and `table.sortBy`. Arabic uses `Intl.PluralRules` (`R-5.11-2`).
4. **`feat/shared-icons-unit-2`.** `star-half` is missing from `raw/`; Rating needs it.
   Every other icon these designs use exists.

## Input

```text
Set "Input" 89:402, 30 variants: size xs|sm|md|lg|xl by state idle|hover|filled|disabled|invalid|focus-visible.
xs cell: 220 x 28, height -> Size control/xs, padding-x 8, gap 4, radius -> Knobs radius/control, fill base/surface-raised, stroke base/line. Placeholder "Enter your email" 12 Regular, base/muted.
Previewer 135:531, chip "server - 0 KB". Head: "A native input that ships 0 KB. It will not compile without an id or an aria-label."
Playground: variant (outline), size (md), type (text), toggles disabled, invalid, required, fullWidth, all off.
States: idle, hover, focus-visible, disabled, read-only, invalid.
Sample: <Field name="email" label="Email" hint="We never share it" required>{(control) => <Input {...control} type="email" autoComplete="email" />}</Field>. Note: "Outside a Field, Input needs id or aria-label - the types reject an unlabelled one."
```

**Build this.** Server. Tier 1, `forms`. A native `<input>`.

- **Props.** `size`: the six `SIZES`, default `md`. `invalid`, `fullWidth`: default `false`.
  Every native input prop passes through, `type` included (default `text`).
- **A name is required.** The props type requires one of `id`, `aria-label` or
  `aria-labelledby`, the way Progress requires its name.
- **`maxLength`.** `resolveMaxLength(maxLength, type)` from `#shared/contracts/boundaries.js`:
  the default of the type, the caller's number, or none for `null` (`R-5.7-8`). A `number`
  input gets none.
- **Classes.** `CONTROL_SIZE`, `rounded-control`, `bg-surface-raised text-body`,
  `BORDER_STRONG`, `FOCUS_RING`, `TRANSITION`, `DISABLED`, `TOUCH_TARGET`, and `w-full` when
  `fullWidth`. Placeholder in `text-muted`. `invalid` sets `aria-invalid` and
  `data-invalid`; the border turns `border-danger-solid` through `aria-invalid:`.
- **Not built:** `Field`, `Label`, the `variant` prop, a counter, the hover fill (not drawn).
- **For the reviewer:** the drawing strokes `base/line`; a control boundary must reach 3:1,
  so this uses `BORDER_STRONG`. `InputSkeleton` is the control height at full width.

## Tag

```text
Set "Tag" 89:608, 30 variants: tone (six) by size xs|sm|md|lg|xl.
xs cell: 108 x 19, padding 2 / 4, gap 4, radius -> Knobs radius/chip, fill <tone>/soft, text 12 Medium <tone>/on-soft, then icon/x 12 x 12.
Previewer 135:285, chip "split - 0 KB server + 0.4 KB client". Head: "A label chip that renders on the server. Setting removable adds a dismiss button, and that button is the only part that runs in the browser."
Playground: variant (soft), tone (neutral), size (md), toggles removable, truncate, disabled, all off.
States: idle, hover, active, focus-visible, disabled.
Sample: <Tag tone="neutral">{topic}</Tag> in a flex-wrap row.
```

**Build this.** Server half. Tier 2, `media-and-display`. A `<span>`.

- **Props.** `tone`: the six `TONES`, default `neutral`. `size`: the six `SIZES`, default `md`.
- **Classes.** The same size table as Badge (`px-1 py-pad-y-xs gap-1 text-xs` up to xl),
  `inline-flex items-center rounded-chip font-medium`, `CONTAIN`, the soft pair of the tone,
  and the label through `truncateLabel` from `#shared/truncate-label.js`.
- **How it differs from Badge:** soft only, default tone neutral. Say in the pull request
  whether the two should become one component; do not merge them yourself.
- **Not built:** `removable` and its x button (client half), `variant`, `disabled`, the
  hover, active and focus drawings (a plain Tag is not interactive).

## Avatar

```text
Set "Avatar" 90:630, 15 variants: size xs|sm|md|lg|xl by kind image|initials|icon.
xs image cell: 28 x 28, height -> Size control/xs, radius 14 raw (a circle), fill primary/solid, icon/image 11.
Previewer 137:461, chip "split - 0 KB server + 0.5 KB client". Head: "Image, initials or an icon, on the same five sizes as every control so rows line up."
Playground: size (md), shape (circle), toggles bordered, status, clickable, all off. States: image, initials, icon, loading.
Sample: <AvatarRoot size="lg"><AvatarImage src="/team/omar.jpg" alt="Omar Abed" /><AvatarFallback>OA</AvatarFallback></AvatarRoot>. Note: "The fallback shows while the image loads and after it fails; initials are children."
```

**Build this.** Server half. Tier 2, `media-and-display`. Parts, exported flat:
`AvatarRoot`, `AvatarImage`, `AvatarFallback`, plus `AvatarSkeleton`.

- **`AvatarRoot`.** A `<span>`: `relative inline-flex shrink-0 items-center justify-center
  overflow-hidden` at the control size on both axes (`size-control-xs` to `-xl`, `custom`
  empty), a circle (`rounded-full`, written once in `avatar/classes.ts`), `bg-primary-soft
  text-primary-on-soft font-medium`, and the type step of the size. `size` default `md`.
- **`AvatarFallback`.** Initials or an `<Svg>` child, centered. It is always rendered.
- **`AvatarImage`.** An `<img>` laid over the fallback (`absolute inset-0 size-full
  object-cover`), so the fallback shows until the image paints, with no JavaScript. `alt`
  is required by the type.
- **Not built:** hiding a broken image (that needs `onError`, the client half), `shape`,
  `bordered`, `status`, `clickable`.
- **For the reviewer:** a failed image shows the browser's broken-image mark over the
  fallback until the client half exists.

## AvatarGroup

```text
Previewer "Avatar group" 137:572, chip "split - 0 KB server + 0.4 KB client". Head: "Overlapping avatars with a +N counter; max is clamped to a safe range."
Playground: max (4), size (md), spacing (tight), toggles showCount (on), bordered (on). States: two, four, overflow (four avatars then "+9").
Sample: <AvatarGroup max={2}> with three AvatarRoot children. Note: "max counts children, so render every member and let the group hide the overflow."
```

**Build this.** Server. Tier 2, `media-and-display`. A `<span role="group">`. Build it after
Avatar is merged: it is the one Unit 2 component that imports another.

- **Props.** `max`: default 4, clamped to `AVATAR_GROUP_BOUNDARIES` (`maxMin: 1`,
  `maxMax: 20`). `size`: passed to the counter. `labels?: Labels`, `locale?: string`.
- **Behaviour.** `Children.toArray`, render the first `max`, and when more remain a last
  circle "+N" whose accessible name is `labels.avatar.more(n, fmt)`.
- **Classes.** `inline-flex items-center`; each child after the first overlaps with a
  negative inline-start margin (`-ms-2`) and carries a ring in the page color
  (`ring-2 ring-page`) so the overlap reads in every mode.
- **Not built:** `spacing`, `showCount` and `bordered` as props.

## Rating

```text
Frame "Rating" 77:277: five icon/star instances, 20 x 20, gap 4.
Previewer 137:2617, chip "split - 0 KB server + 1.3 KB client". Head: "Read-only stars add 0 KB and can emit AggregateRating JSON-LD; only the editable version hydrates."
Playground: max (5), size (md), precision (half), toggles readOnly (on), showValue (off), allowClear (off). States: empty, partial, full, hover, focus-visible, read-only.
Sample: <Rating value={4} max={5} /> beside a muted "128 reviews". Note: "value renders stars on the server; only an editable rating ships the client half."
```

**Build this.** Server half, read-only. Tier 3, `media-and-display`. A `<span role="img">`
named by `labels.rating.value(value, fmt)`; the stars inside are decorative.

- **Props.** `value`: default 0, clamped to 0 and `max`. `max`: default 5, clamped to
  `RATING_BOUNDARIES` (`maxMin: 1`, `maxMax: 10`). `size`: the icon scale, default `md`.
  `labels?: Labels`, `locale?: string`.
- **Stars.** `<Svg icon={star}>` per step, `gap-1`: filled ones in `text-warning-solid`,
  empty ones in `text-line-strong`, and `star-half` for a value ending in .5 (round to the
  nearest half). Stars do not flip in RTL; the row order does, by itself.
- **Not built:** editing, hover and focus, `allowClear`, `showValue`, the JSON-LD.

## Breadcrumb

```text
Frame "Breadcrumb" 76:266: a row, gap 8: icon/house 14, then crumbs 14 Regular base/muted separated by icon/caret-right 14.
Previewer 138:1140, chip "server - 0 KB". Head: "Real links with aria-current on the last crumb; it also emits BreadcrumbList JSON-LD."
Playground: separator (caret), maxItems (4), toggles showHome (on), collapse (off), truncate (off). States: idle, hover, collapsed, current.
Sample: <Breadcrumb locale={locale} labels={labels} items={[{ href: '/', label: 'Home' }, { href: '/docs', label: 'Docs' }, { label: 'Breadcrumb' }]} />. Note: "Leave href off the last item; the same array emits the BreadcrumbList JSON-LD."
```

**Build this.** Server. Tier 1, `navigation-and-disclosure`. A `<nav>` named by
`labels.breadcrumb.label`, holding an `<ol>`.

- **Props.** `items`: `{ href?: string; label: string }[]`. `labels?: Labels`.
- **Each crumb.** With `href`, an `<a>` in `text-muted` with `FOCUS_RING` and
  `TOUCH_TARGET`; the last item, without `href`, is a `<span aria-current="page">` in
  `text-body`. Between them `caret-right` at `1em`, `aria-hidden`; it is a directional
  icon, so `Svg` flips it in RTL.
- **JSON-LD.** One `<script type="application/ld+json">` with the `BreadcrumbList` of the
  items that have an `href`, built with `JSON.stringify` and `<` escaped as `\u003c`.
- **Not built:** `maxItems` and collapsing (it needs a menu), `separator`, `showHome` (the
  first item is the caller's), `truncate`.

## Pagination

```text
Frame "Pagination" 76:278: a row, gap 4, of 32 x 32 cells (height -> Size control/sm, radius 8): first and previous (carets, opacity 0.4 on page 1), the current page filled primary/solid with on-solid text 14 Medium, the others stroked base/line with base/body text.
Previewer 138:1269, chip "server - 0 KB". Head: "Page numbers are real hrefs, not click handlers; siblingCount is clamped to a safe range."
Playground: siblingCount (1), size (sm), shape (rounded), toggles showFirstLast (on), showPrevNext (on), compact (off). States: first page, middle, last page, disabled.
Sample: <Pagination value={3} pageCount={12} getHref={(page) => `/blog?page=${page}`} locale={locale} labels={labels} />. Note: "getHref keeps every page crawlable; siblingCount and boundaryCount are clamped."
```

**Build this.** Server. Tier 1, `navigation-and-disclosure`. A `<nav>` named by
`labels.pagination.label`, holding a list of links.

- **Props.** `value` (the current page, clamped to 1 and `pageCount`), `pageCount`,
  `getHref: (page: number) => string`, `siblingCount` (default 1) and `boundaryCount`
  (default 1), both clamped to `PAGINATION_BOUNDARIES` (0 to 3), `size` (default `sm`, as
  drawn), `labels?: Labels`, `locale?: string`.
- **The page list** is a pure function in `pagination/lib.ts` returning pages and gaps; a
  gap renders "..." with `aria-hidden`. Test it for 1, 2, 7 and 500 pages.
- **Each cell.** A square at the control size: `size-control-sm` and so on, `rounded-control`,
  `text-sm font-medium`, `FOCUS_RING`, `TOUCH_TARGET`. The current page is
  `bg-primary-solid text-primary-on-solid` with `aria-current="page"`; the others are
  `BORDER_STRONG text-body`. First, previous, next and last are icon links named by the
  existing `labels.pagination.*`; at the edge they render as a `<span aria-disabled="true">`
  with `DISABLED`, not as a dead link.
- **Not built:** `shape`, `compact`, `showFirstLast` and `showPrevNext` as props.

## Timeline

```text
Frame "Timeline" 80:449: rows with gap 12 between a rail and a body. Rail: a 12 x 12 dot (done success/solid, current primary/solid, todo surface-raised with a line-strong stroke) over a 2 x 44 connector in base/line. Body, gap 2: title 14 Medium base/body, time 12 Regular base/muted.
Previewer 137:1409, chip "server - 0 KB". Head: "A rail of dated events, each with a marker in its tone; the rail mirrors in right-to-left layouts."
Playground: variant (default), align (start), tone (primary), toggles compact (off), showConnector (on), reverse (off). States: done, current, todo, error, loading, empty.
Sample: <Timeline getKey={(event) => event.id} items={[{ id, icon: 'plus', title, time }, ...]} />. Note: "Item icons are IconName strings: the server half resolves them, no icon JS ships."
```

**Build this.** Server. Tier 3, `media-and-display`. An `<ol>` with `role="list"`.

- **Props.** `items`: `{ title: ReactNode; time?: ReactNode; tone?: Tone; icon?: ReactNode;
  status?: 'done' | 'current' | 'todo' }[]`, `getKey`, and `emptyFallback?: ReactNode`.
  An icon is a `ReactNode`, not a name: `<Icon name>` is async (see unit-1.md).
- **Each item.** An `<li>` with `flex gap-3`: the rail (`flex flex-col items-center`: a dot
  `size-3 rounded-full` in `bg-<tone>-solid`, default tone `primary`, or hollow with
  `BORDER_STRONG` for `todo`; then a connector `w-0.5 flex-1 bg-line`, absent on the last
  item) and the body (title `text-sm font-medium text-body`, time `text-xs text-muted`).
  The current item carries `aria-current="step"`.
- **Empty.** No items renders `emptyFallback`, or nothing.
- **Not built:** `useCollection`, windowing and `loadMore` (PLAN: "when it grows"),
  `variant`, `align`, `compact`, `reverse`, the loading state.

## Table

```text
Frame "Table" 77:174: a 640-wide table, radius -> Knobs radius/box, fill base/surface-raised, stroke base/line. Header row padding 10 / 16 on base/surface; body rows padding 12 / 16, 52 tall, every second one on base/surface; a 1 px base/line Separator between rows.
Previewer 137:1022, chip "server - 0 KB". Head: "Server-rendered table with sortable columns, a sticky first column and a page size you choose - 25, 50, 100 or 500 rows."
Playground: density (comfortable), variant (outline), sortBy (name), pageSize (50), toggles sortable (on), stickyFirstColumn, striped, hasMore (off). States: idle, hover row, sorted, selected, empty, loading.
Sample: <Table items={invoices} getKey={(invoice) => invoice.id} columns={[{ key: 'number', header: 'Invoice', cell: (invoice) => invoice.number }, ...]} />.
```

**Build this.** Server. Tier 1, `media-and-display`. Build it last and alone: it is the largest of the ten.
A real `<table>` inside a `<div>` that scrolls sideways (`overflow-x-auto`, `rounded-box`,
`BORDER`).

- **Props.** `items`, `getKey`, `columns`: `{ key: string; header: ReactNode; cell: (item)
  => ReactNode; sortHref?: string; align?: 'start' | 'end' }[]`, `caption` (required, shown
  or `sr-only`), `sort?: { key: string; direction: 'ascending' | 'descending' }`,
  `striped` and `stickyFirstColumn` (default `false`), `emptyFallback?: ReactNode`,
  `labels?: Labels`.
- **Markup.** `<caption>`, `<thead>` with `<th scope="col">`, `<tbody>`. A sortable header
  is a link to `sortHref` with `FOCUS_RING`; the sorted column sets `aria-sort` and shows
  `caret-up` or `caret-down`.
- **Classes.** Header cells `px-4 py-2.5 text-start text-xs font-medium text-muted
  bg-surface`; body cells `px-4 py-3 text-sm text-body`; rows divided by `border-t` in
  `border-line`; `striped` puts `bg-surface` on even rows; `stickyFirstColumn` is
  `sticky inset-s-0` with the row's own background.
- **Empty.** No items renders one row spanning every column with `emptyFallback`, or the
  text of `labels.state.empty`.
- **Not built:** `pageSize` and its selector (Pagination's job), selection, row hover,
  `density`, `useCollection` and windowing, `hasMore`.

## Banner

```text
Frame "Banner" 79:380: a full-width row, padding 12 / 20, gap 12, fill <tone>/soft: an optional icon 16, the message 14 Medium <tone>/on-soft, a "Read more" link 14 Semi Bold, then icon/x 14.
Previewer 137:1991, chip "split - 0 KB server + 1.1 KB client". Head: "Full width above the header; it pushes the page down rather than covering anything."
Playground: tone (primary), variant (soft), placement (top), toggles dismissible (on), sticky (off), withAction (on). States: primary, info, warning, dismissed.
Sample: <Banner id="v2-release" tone="info" icon="bell">Version 2 is out. ...</Banner>. Note: "Dismissal is remembered per id, so change the id when the message changes."
```

**Build this.** Server half. Tier 2, `media-and-display`. A `<div role="region">` named by a
required `aria-label`.

- **Props.** `tone`: the six `TONES`, default `primary`. `icon?: ReactNode`.
  `action?: ReactNode` (the caller's link or Button). `children`: the message.
- **Classes.** `flex w-full items-center gap-3 px-5 py-3 text-sm font-medium wrap-anywhere`
  and the soft pair of the tone; no radius and no border, because it spans the page.
- **Not built:** `dismissible`, the x button and remembering it per `id` (the client half),
  `sticky`, `placement`, `variant`.

## Build order

1. The four shared pull requests above.
2. `Input`, alone, and stop for review: it is the first form control and the first
   interactive component since Button.
3. `Tag`, `Avatar`, `Rating`, `Breadcrumb`, `Pagination`, `Timeline`, `Banner`, three or four
   at a time.
4. `AvatarGroup`, after Avatar is merged.
5. `Table`, last and alone.

## Choices for Omar

| # | Choice | Built as | The other option |
|---|---|---|---|
| 1 | The five "split" components | server half now, client half with Unit 3 | wait and build each whole |
| 2 | Tag beside Badge | two components, as the site lists them | one component with a `removable` prop |
| 3 | Banner without dismiss | a plain server banner for now | hold Banner until the client half |
| 4 | Table scope | sorting links, striped, sticky column, empty row | add page size, selection and windowing now |
| 5 | Timeline and Rating are tier 3 | built, because the site promises them | defer both |
