---
"topclassui": minor
---

The 46 components match their Figma Previewer frames, and every one has a states demo that draws each state of its frame's strip. Among the changes a page shows: Table's sort marks, hover row and empty tray, with `density` (`comfortable`, `compact`), `variant` (`outline`, `plain`) and `selectedKeys`; Pagination's wide cells, a compact row on narrow lists and coarse pointers, and `disabled`; Navbar's 52 px bar with a `transparent` variant and the scrolled shadow; Timeline's filled current dot and `TimelineSkeleton`; `CardMedia`; `ToastStage`, which shows a toast at rest inside its own box; Separator's labelled form (`children`, such as "or"); a `disabled` Stepper step; the date picker's compact calendar; the switch, checkbox and radio scale a step up (md 24 px); list rows at 32 px; the portal's `container` and `keepMounted` on `TooltipPopup`.

Breadcrumb takes `showHome` (default `false`) and `maxItems` (2 to 100, default 100, clamped), which folds a longer trail to the first crumb, three dots and the last `maxItems - 1`. Kbd takes `pressed` and `disabled`; a disabled key keeps 4.5:1 text. Both have a schema, so the docs Try it panel offers them.

`font-sans` takes the Arabic stack under `lang="ar"` (`tokens.css`), so Arabic text set in the sans face renders in it without a class of its own; `font-mono` names each platform's monospace. An `ocean` section inside a dark page is light.

Every pressable control shows the pointer cursor, and the arrow again when disabled, read-only or loading. The page's own scrollbar is thin and in the theme's colours, as every other scroll area already was.

Migration: Breadcrumb's `baseUrl` is now `siteUrl` (an origin with no trailing slash), and the BreadcrumbList JSON-LD is written only when `siteUrl` is given. A Timeline with no `emptyFallback` now draws the tray and `labels.state.empty`; pass `emptyFallback={null}` to render nothing. A Progress at 100 % with no `tone` fills in success.
