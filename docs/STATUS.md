# Where things stand

Read this first in a new session, then `docs/PLAN.md` for the specification and `docs/DECISIONS.md` (newest entries at the top) for what has been decided and why.

Last updated: 2 October 2026.

---

## The one-line version

The whole design system and the whole documentation site exist in Figma. No code has been written. The next real step is Phase 0.

## The product, in the words the site uses

TopClass UI is a component library for **Next.js first, React second**. 46 components. Most render on the server and add no JavaScript to the page; all of them work in Arabic without a code change. Light, dark and a custom mode from one small CSS block. Two ways to install: copy a component into your project, or install the package.

Not supported, decided and recorded: plain JavaScript projects, React 18, Next.js 14 and older.

---

## The Figma file

File key `BxRSdAVOhk9Hj3Tkq4tjcy`, five pages: Foundations, Icons, Components, **Docs pages**, and the archive row.

`Docs pages` holds the finished site: **19 frames at y = 0, left to right in sidebar order**, 1680 px apart.

| x | Frame |
|---|---|
| 0 | Page: Home |
| 1680 | Page: Install the package |
| 3360 | Page: Add with the CLI |
| 5040 | Page: CSS entry |
| 6720 | Page: Provider |
| 8400 | Page: Your first component |
| 10080 | Page: Colours |
| 11760 | Page: Icons |
| 13440 | Page: Theming |
| 15120 | Page: Right to left |
| 16800 | Page: Server first |
| 18480 | Page: Accessibility |
| 20160 | Docs site - LTR (the 46 component cards, ~49 000 px tall) |
| 21840 | Docs site - RTL (the Arabic page, 3 cards) |
| 23520 | Page: Connectors |
| 25200 | Page: Theme builder |
| 26880 | Page: Changelog |
| 28560 | Page: Blog |
| 30240 | Page: Demo preview |

Earlier drafts are parked at y = 64000 under a heading "Earlier drafts". They are superseded; do not edit them.

### The prototype

Press play and the site is clickable. Roughly 1 070 wired elements:

- Every sidebar row, navbar link, footer link, "next" block and on-this-page entry navigates or scrolls.
- The Light / Dark / Ocean switchers use Figma's **set-variable-mode** action, so one page recolours rather than three page copies existing. 47 switchers, 141 segments.
- Six variables (`ui/seg-on-*`, `ui/seg-label-*`) make the active segment follow the mode.
- The LTR / RTL switcher navigates between `Docs site - LTR` and `Docs site - RTL`.
- Flow starting point: `Page: Home`.

### Conventions inside a frame

- `page bg` is a bound rectangle with STRETCH constraints, because a frame's explicit variable mode does not apply to its own fill.
- Content column is **944 px** on docs pages, **1200 px** on the home page; `main` padding is set so every block lines up.
- Layer names that scripts depend on: `Navbar`, `Sidebar`, `main`, `On this page`, `Footer`, `nav` / `nav:current`, `Section: <heading>`, `Previewer: <Component>`, `head`, `stage`, `playground`, `code`, `states`, `block`, `Segmented:global-mode`, `Segmented:global-dir`, `seg:<Mode>`.
- A section frame is named after its heading, which is what the on-this-page scroll links resolve against. Rename a heading, rename the frame.

---

## What is done

- **Foundations**: 36 palette, 11 knob, 35 size, 45 semantic and 18 type variables; 27 text styles; three modes.
- **Icons**: 84 Phosphor icons as components, 16 of them directional.
- **Components page**: 46 cards in one five-part previewer - stage, playground, real JSX, every state, two install paths - grouped into 7 sections, with a proof band, an install block and a legend.
- **All 19 docs pages** written and drawn, with a page renderer that takes structured content and draws code, tabs, tables, callouts, steps, cards, compare and swatch blocks.
- **Copy**: the whole site was reworded for users, not for us. No phase numbers, no tiers, no file names from the plan, no competitor, no unlabelled projections.
- **Reviews applied**: a 46-item review of the seven newest pages (including two code samples that would not have compiled), and a 37-item copy audit of the components page.

## What is not done

- **No code at all.** `pnpm check` cannot run; there is no `package.json`. Phase 0 has not started.
- The **Theme builder** page describes a tool that does not exist. It is labelled as such.
- The **registry CLI** is designed, not built.
- Nothing is on npm.

---

## Open questions, with the recommended default

1. **`zod` required or optional?** The JavaScript decision argued it should become an optional peer by declaring design-prop interfaces in `types.ts` and proving them equal to the schema's input type with a type test. It was never adversarially reviewed and it reverses M1, so the docs still say required. Settle it in Phase 0. Recommended: make it optional by the mechanism in that decision.
2. **The "0 KB" claim has no verification path on the site.** The home page shows a `.size-limit.json` block and the numbers, but never tells a reader how to check them, and the `ignore` list (react, react-dom, @base-ui/react) means 14 KB is the marginal cost, not the total. Add a "check it yourself" line and a footnote.
3. **The Arabic copy** for the RTL page is written, but per-route Arabic for the other 18 pages is still an open scope question.

---

## Before the first publish

From the publishing decision, in order:

1. npm account with 2FA.
2. Create the free npm **organisation** `topclassui` - the org name is the scope. pnpm, yarn and bun need no accounts; they are clients of the same registry.
3. Make the GitHub repository public, or there is no provenance.
4. Publish `0.0.1` of all three packages **by hand** with `npm publish --access public`. A trusted publisher cannot be attached to a package that does not exist.
5. Attach a trusted publisher to each with `--allow-publish`, release from `release.yml` on **Node 24**.
6. Three package READMEs, `license`, `repository` with `directory`, keywords - all before the bootstrap publish.

---

## Known environment problems

- **Figma access.** The MCP connector is authenticated as `oabed@opsheaven.com`, which has a **View** seat and cannot edit the file. It was previously `omarfathiabed@gmail.com`, which owns it. Until that is fixed, no Figma writes are possible. Fix by reconnecting the connector to the owning account, or by sharing the file with the current account as an editor.
- Figma reads are rate limited on the Starter plan; `get_screenshot` counts against it. The write tool is exempt.
- This repository is documentation only, so the commands in `CLAUDE.md` do not exist yet. Say so rather than claiming a check passed.
