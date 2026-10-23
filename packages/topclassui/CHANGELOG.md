# topclassui

## 0.1.0-beta.3

### Patch Changes

- A disabled control shows the not-allowed cursor and still ignores a press: `DISABLED` is `opacity-50` plus `NOT_ALLOWED` with no `pointer-events-none`, the hover and active variants skip `:disabled`, `[aria-disabled="true"]` and `[data-disabled]`, and a disabled row in a list, menu, tree or calendar takes no highlight. A Button rendered as another element keeps its pointer block.

## 0.1.0-beta.2

### Minor Changes

- The 46 components match their Figma Previewer frames, and every one has a states demo that draws each state of its frame's strip. Among the changes a page shows: Table's sort marks, hover row and empty tray, with `density` (`comfortable`, `compact`), `variant` (`outline`, `plain`) and `selectedKeys`; Pagination's wide cells, a compact row on narrow lists and coarse pointers, and `disabled`; Navbar's 52 px bar with a `transparent` variant and the scrolled shadow; Timeline's filled current dot and `TimelineSkeleton`; `CardMedia`; `ToastStage`, which shows a toast at rest inside its own box; Separator's labelled form (`children`, such as "or"); a `disabled` Stepper step; the date picker's compact calendar; the switch, checkbox and radio scale a step up (md 24 px); list rows at 32 px; the portal's `container` and `keepMounted` on `TooltipPopup`.
  
  Breadcrumb takes `showHome` (default `false`) and `maxItems` (2 to 100, default 100, clamped), which folds a longer trail to the first crumb, three dots and the last `maxItems - 1`. Kbd takes `pressed` and `disabled`; a disabled key keeps 4.5:1 text. Both have a schema, so the docs Try it panel offers them.
  
  `font-sans` takes the Arabic stack under `lang="ar"` (`tokens.css`), so Arabic text set in the sans face renders in it without a class of its own; `font-mono` names each platform's monospace. An `ocean` section inside a dark page is light.
  
  Every pressable control shows the pointer cursor, and the arrow again when disabled, read-only or loading. The page's own scrollbar is thin and in the theme's colours, as every other scroll area already was.
  
  Migration: Breadcrumb's `baseUrl` is now `siteUrl` (an origin with no trailing slash), and the BreadcrumbList JSON-LD is written only when `siteUrl` is given. A Timeline with no `emptyFallback` now draws the tray and `labels.state.empty`; pass `emptyFallback={null}` to render nothing. A Progress at 100 % with no `tone` fills in success.
- `TooltipProvider` is exported from `topclassui/tooltip`: the tooltips inside one provider share a delay group, so a page or a section can set its own `delay` and `closeDelay`. OTPField's `validationType` joins its schema (numeric by default). DatePicker's `firstDayOfWeek` must be a whole day.
  
  More of the components follow their Figma frames: Badge's `xs` step is 19 px; a disabled SegmentedControl, Accordion or Tabs bar dims once, as a whole; Combobox keeps the room for its placeholder unless it is loading; Breadcrumb draws no caret after the home crumb; Pagination's `xs` cell is 24 px; Tag's remove button pulls back over the chip's gap; Dropdown's menu icons are muted at rest; AvatarGroup's counter keeps its ring; Command's search row, Sidebar's header row and rail gap, TreeView's loading and empty notes, and the Banner and Toast state text take their drawn sizes.

### Patch Changes

- Navbar measures its height on its ResizeObserver's first report instead of during the commit, so hydration forces no layout; `--tc-sticky-top`, `data-scrolled` and the `#anchor` correction land one frame after hydration.

## 0.1.0-beta.1

### Minor Changes

- The `topclassui` bin: `npx topclassui init` sets a Next.js App Router or Vite React project up, `add <component>` copies a component and what it imports into one `topclassui/` folder, `diff` compares the copies with this version, `list` names the components. The registry ships inside the package.
  
  Banner, Tag and Rating take no function on their server exports; the client exports carry the callbacks (`TagRemovable` with `onRemove`, the banner's dismiss and the editable rating with `onValueChange`).
  
  `TopClassProvider` warns once in development when the layout leaves out `direction` or `locale`. The tooltip popup carries `role="tooltip"` and its trigger `aria-describedby`. The icon's RTL mirror uses the `--tc-dir` knob. Every rule the plan listed as planned or manual is now an automated check.

## 0.1.0-beta.0

### Minor Changes

- 550ec89: First beta. 52 component entries as subpath imports (`topclassui/button`, `topclassui/dialog`, ... every folder under `src/components/` with an `index.tsx`, every one `status: beta`), `topclassui/provider` (`TopClassProvider`), `topclassui/theme` (`ThemeScript`), `topclassui/cn`, `topclassui/classes`, the English and Arabic labels (`topclassui/labels/en`, `topclassui/labels/ar`), 84 icons as modules (`topclassui/icons/<name>`), `topclassui/tokens.css`, `topclassui/styles.css`, and the schemas and meta files (`topclassui/schemas/<slug>`, `topclassui/meta/<slug>`). Not in it: the CLI, connectors, `@topclassui/next`, `@topclassui/vite`, size budgets, provenance.
