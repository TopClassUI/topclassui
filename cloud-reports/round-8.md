# Cloud jobs, round 8: Figma-first (started 2026-10-19 16:40 UTC by the lead on the laptop's word)

Job file: review-notes/CLOUD-JOBS-8.md on origin/review/round-8 (59d2e86). Base for every job: origin/main cf1ec12. Rules: one-line OmarAbed16 commits, fast-forward pushes of the job's own branch only, no PR, nothing to main. The lead verifies every push (author, one line, no trailer, no AI mention, scope) and writes the rows below after each report; the integrators 131 and 132 rewrite this file wholesale at the end.

## Figma tools in the cloud sessions (first report update, 16:25 UTC)

Every image job (110, 111, 112, 113, 114, 115, 116, 124, 125, 126, 127) reports the Figma MCP tools available in its session (get_screenshot, get_design_context, use_figma, get_metadata, get_variable_defs, served under the official Figma server id, not an mcp__Figma__ prefix). The container's egress proxy refuses www.figma.com (CONNECT 403), so the short-lived screenshot URLs cannot be curled; get_design_context saves its screenshot to a local file and get_screenshot with enableBase64Response does too, so the jobs have the frames as PNGs on disk (confirmed by 112, 113, 116), and every job was told to read the laptop's frame PNGs from review-notes/figma-audit/frames/ on origin/review/round-8 (1fc32ed) as well. Read shows PNGs in these sessions (the jobs view the frames inline). 118 to 123 do not need Figma.

Rule call made by the lead (for Omar): a frame that draws a control boundary with the low-contrast `line` colour at rest (Input 135:531 and the other fields; the same may hold for checkbox, radio, switch, slider, date cells, the upload zone) is followed in everything but that border: the library keeps `line-strong` at rest because R-5.6-4 / WCAG 1.4.11 needs 3:1 on a control boundary and the loop fixes "inside the rules"; each such border is listed as a remaining non-whitelisted difference. Omar decides whether the frame or the rule changes.

| Job | Branch | Base | Tip | Commits | Gates | Composites and what is left for Omar |
|---|---|---|---|---|---|---|
| 110 Overlays: Dialog, Drawer, Command palette, Dropdown menu, Popover, Tooltip | figma/overlays | main cf1ec12 | running | - | - | - |
| 111 Table, Toast, Alert, Banner | figma/data-feedback-1 | main cf1ec12 | running | - | - | - |
| 112 Stepper, Timeline, TreeView, EmptyState, Progress, Spinner | figma/data-feedback-2 | main cf1ec12 | running | - | - | - |
| 113 Pagination, Tabs, Navbar, Sidebar, Breadcrumb, Accordion | figma/navigation | main cf1ec12 | running | - | - | - |
| 114 Input, Textarea, Select, Combobox, Number field, OTP field | figma/forms-1 | main cf1ec12 | running | - | - | - |
| 115 Checkbox, RadioGroup, Switch, Slider, Rating, Date picker, File upload | figma/forms-2 | main cf1ec12 | running | - | - | - |
| 116 Button, Tag, Kbd, SegmentedControl, Badge, Avatar, Avatar group, Card, Separator, Skeleton, CodeBlock | figma/actions-display | main cf1ec12 | running | - | - | - |
| 118 pnpm size | feat/size | main cf1ec12 | running | - | - | - |
| 119 Pagination compact | feat/pagination-compact | main cf1ec12 | running | - | - | - |
| 120 Cursor pointer | feat/cursor-pointer | main cf1ec12 | running | - | - | - |
| 121 Tree-walk tests | fix/tree-walk-tests | main cf1ec12 | running | - | - | - |
| 122 Breadcrumb JSON-LD | fix/breadcrumb-json-ld | main cf1ec12 | running | - | - | - |
| 123 Scrollbars everywhere | fix/scrollbars-everywhere | main cf1ec12 | running | - | - | - |
| 124 Site Home | figma/site-home | main cf1ec12, then the library top | running | - | - | - |
| 125 Site getting started | figma/site-getting-started | main cf1ec12, then the library top | running | - | - | - |
| 126 Site guides | figma/site-guides | main cf1ec12, then the library top | running | - | - | - |
| 127 Site components | figma/site-components | main cf1ec12, then the library top | running | - | - | - |
| 128 Site mobile | feat/site-mobile | after 124 pushes | not started | - | - | - |
| 129 Site motion | feat/site-motion | after 124 pushes | not started | - | - | - |
| 130 Site SEO | feat/site-seo | after 124 pushes | not started | - | - | - |
| 131 Library integrator | the check of 118 → 123 then 110 → 116 | - | not started | - | - | - |
| 132 Site integrator | feat/site-speed-insights c4d7a30 → 124 → 127 → 128 → 129 → 130 on the library top | - | not started | - | - | - |
