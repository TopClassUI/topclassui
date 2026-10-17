## 48 check/provider-warns (da103da) — R-13-1

| # | Exemption | Where | Verdict | Reason | Fix |
|---|---|---|---|---|---|
| 48.1 | An app that mounts no provider at all gets no warning ("is review"), and the decision says this is because no-provider fixtures and component tests render that way on purpose | docs/DECISIONS.md:9-15; docs/RULES.md:164; src/shared/provider/context.ts:41-43 (silent `?? FALLBACK_CONTEXT`); use-portal-locale.ts:10-13 (silent `undefined`) | fix | PLAN.md:1762 asks for the opposite: "In development every Base UI-backed component warns once if no provider is found". The rule's title (RULES.md:161) is "TopClassProvider is required". Keeping test fixtures quiet is a convenience for the tests, not a constraint, and nothing in Base UI or React stops a hook from noticing a null context. | Add `useProviderPresence()` to context.ts: it reads `useContext(TopClassContext)`, and when that is null it warns once per page in a dev-only `useEffect` (shared `warned` Set, the same NODE_ENV form). Call it from `useTopClass` and `usePortalLocale`, and from every Base UI-backed hook.ts that reads neither: accordion, checkbox, field, radio-group, rating, segmented-control, switch, tabs (and form/avatar/navbar only if they are Base UI-backed). Where client.tsx has no hook, the call is its one allowed `useXxx` (R-5.12-1). The 9 `*.form.dom.test.tsx` files assert no warnings (e.g. select.form.dom.test.tsx:90-98), so wrap them in a provider or a shared `withProvider` test helper. Add dom tests plus a mutant. Change RULES.md:164 and the DECISIONS entry. About 25 lines in src, about 9 small test edits, about 40 test lines. R-5.12-1 holds: the effect lives in a shared hook, not in client.tsx. R-5.1-4 holds: client only. R-5.12-2 holds: context.ts is 68 lines. |
| 48.2 | A layout without `locale` (or with an invalid one) falls back to `en`, and one without `direction` falls back to `ltr` | use-provider-locale.ts:15-16, 33-36 | keep | The props are required by type (provider.tsx:27-28), so only an untyped caller ever reaches the fallback, and that caller is now warned. `ltr` is Base UI's own default (node_modules/@base-ui/react/direction-provider/DirectionProvider.js:19 `direction = 'ltr'`; internals/direction-context/DirectionContext.js:15 `?? 'ltr'`), and PLAN.md:1762 names it "default `'ltr'`". Before this branch an `undefined` locale reached the context, which was worse. | - |
| 48.3 | Warns only in development | use-provider-locale.ts:19 | keep | PLAN.md:1762: "In development every Base UI-backed component warns once…". | - |
| 48.4 | Never warns on the server (the warning sits in an effect) | use-provider-locale.ts:18-31; provider.warning.ssr.test.tsx:13 | keep | React effects run only on the client (react.dev useEffect caveat: "Effects only run on the client. They don't run during server rendering"). A warning during render would break React's purity rule. No coverage is lost: every SSR page hydrates, and the effect fires in the browser. | - |
| 48.5 | Once per page per missing prop (module-level `warned` Set) | use-provider-locale.ts:7, 23-25 | keep | PLAN.md:1762 says "warns once". | - |
| 48.6 | `direction="auto"` and an empty locale count as missing | use-provider-locale.ts:15-16 | keep | Not an exemption. It is stricter than the type, and `Direction` is `'ltr' \| 'rtl'` (context.ts:12). | - |
| 48.7 | Tests cast `TopClassProvider as unknown as Loose` to pass invalid props | provider.warning.dom.test.tsx:8,18; .ssr.test.tsx:7-8 | keep | The case under test is a caller the types do not cover. The cast contains no `any` and no `@ts-ignore` (R-5.12-5). | - |
| 48.8 | `no-process-in-browser.test` expected readers list gains the new file | src/shared/no-process-in-browser.test.ts:29 | keep | This is a positive `arrayContaining` floor, not an allowlist. Each file is still checked for the inlinable `process.env.NODE_ENV` form (lines 32-33). | - |
| 48.9 | The "never read from `document.dir` in an effect" half has no check | RULES.md:164 cites only the warning tests | fix | Grep at the tip finds no reader: no `document.dir`, `documentElement.dir`, `getAttribute('dir')` or computed `direction` anywhere in src outside the provider.tsx:26 comment. So the code already follows the rule, but nothing would catch a future regression. | Add a src walk test like no-process-in-browser.test.ts: it fails on `document.dir`, `documentElement.dir`, `getAttribute('dir')`, `.getAttribute("dir")` and `.direction` read off `getComputedStyle`, with comments stripped, plus a negative fixture string. If 48.10 lands, its one comparison read is the single allowed site, cited to PLAN.md:1762. About 35 lines. Update the RULES.md:164 "Enforced by" text. |
| 48.10 | The promised mismatch warning ("or if `direction` disagrees with `document.documentElement.dir`") is not built | PLAN.md:1762; absent from use-provider-locale.ts | fix | PLAN puts this in the same dev warning. Comparing inside an effect only warns and never feeds the render, so it does not conflict with R-13-1's ban on sourcing the direction from document.dir. | In the outermost provider's effect (`nested === false`), when `document.documentElement.dir` is non-empty and differs from `direction`, warn once. Add a dom test plus a mutant. About 10 src lines and 20 test lines. |

**Check.**

**Negative test.** These prove the warning fires on a violating input:
- provider.warning.dom.test.tsx:32 (no direction), :41 (no locale) and :49 (both invalid).
- :57 and :65 (warns once per prop).
- :73 (silent in production).
- provider.warning.ssr.test.tsx:13 (silent on the server).

All seven mutants in scripts/mutations/shared-provider-warning.ts map onto these tests: removed, no memory, production, bracket env, runs in render, accepts any direction, undefined locale.

**Scope.** This is a runtime check inside `TopClassProvider`, so it covers every mount of the provider and nothing else. Nothing walks src for the document.dir half.

**Misses:**
- No provider at all (48.1). This contradicts PLAN.md:1762.
- The direction-vs-`<html dir>` mismatch warning (48.10).
- No guard against a future `document.dir` or `getAttribute('dir')` read in an effect (48.9).
- "At the root layout" cannot be checked from the library. Only the presence of the provider and its props can be checked, which is acceptable.

**Component changes.**
- provider.tsx:53 now routes direction and locale through the hook. This is correct, and the file is 102 lines.
- Small bug in the warning text (use-provider-locale.ts:27-29). It always says it "falls back to direction="ltr" locale="en"" even when only one prop is missing. With `direction="rtl"` and no locale it actually runs `rtl en`, which is the value asserted at provider.warning.dom.test.tsx:46. The message should name the value actually used for each missing prop, for example `locale="en"` alone. Then pin the full text in the :41 test.
- `use-provider-locale.ts` has `'use client'` and lives in shared/, so R-8.1-1 and R-5.12-1 are fine.
