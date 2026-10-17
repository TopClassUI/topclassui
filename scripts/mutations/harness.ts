// The mutations of the two harnesses: the pages, the routes, the stylesheet read from source and the error trap.
// Found by scripts/mutations/index.ts. What only a browser can see is proven in e2e/live.spec.ts instead.
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the live harness skips strings between backticks, so a class a template builds never reaches its stylesheet',
    file: 'scripts/lib/source-candidates.ts',
    from: `const QUOTES = new Set(["'", '"', '\`'])`,
    to: `const QUOTES = new Set(["'", '"'])`,
  },
  {
    label: 'the live harness takes an escaped quote for the end of a string, so the class around it is cut in two',
    file: 'scripts/lib/source-candidates.ts',
    from: ') i++\n',
    to: ') i += 0\n',
  },
  {
    label: 'the live harness reads a test folder for classes, so a class only a test names reaches its stylesheet',
    file: 'scripts/lib/source-candidates.ts',
    from: "  return !parts.includes('test') && ",
    to: '  return ',
  },
  {
    label: 'the live harness reads a test file that sits beside its source',
    file: 'scripts/lib/source-candidates.ts',
    from: "  return !parts.includes('test') && ",
    to: "  return !parts.includes('test') || ",
  },
  {
    label: 'the live harness judges a file by its absolute path, so a checkout under a folder named test compiles no class at all',
    file: 'scripts/lib/source-candidates.ts',
    from: '    .filter((file) => isShipped(relative(root, file)))\n}',
    to: '    .filter((file) => isShipped(file))\n}',
  },
  {
    label: 'the live harness reads src/components only, so the classes of src/shared are missing from its stylesheet',
    file: 'scripts/lib/source-candidates.ts',
    from: "export const SOURCE_FOLDERS = ['src/components', 'src/shared'] as const",
    to: "export const SOURCE_FOLDERS = ['src/components'] as const",
  },
  {
    label: 'the live harness leaves the JSX runtime out of the bundle it prepares, so the first page rebuilds it',
    file: 'scripts/lib/source-candidates.ts',
    from: 'const found = new Set(JSX_RUNTIMES)',
    to: 'const found = new Set<string>()',
  },
  {
    label: 'the live harness hands Vite a word from the prose of a demo as a package to bundle',
    file: 'scripts/lib/source-candidates.ts',
    from: 'if (installed(specifier)) found.add(specifier)',
    to: 'found.add(specifier)',
  },
  {
    label: 'the live harness ignores TC_HARNESS_PORT, so two worktrees can never run at once',
    file: 'scripts/lib/live-harness.ts',
    from: "  if (raw === undefined || raw === '') return LIVE_PORT\n",
    to: '  if (raw !== null) return LIVE_PORT\n',
  },
  {
    label: 'a misspelt parameter of a live harness page is ignored, so the spec measures a demo nothing pinned',
    file: 'scripts/lib/live-harness.ts',
    from: "if (key !== 'edge' && key !== 'tall' && key !== 'toast') return",
    to: "if (key === '') return",
  },
  {
    label: 'the live harness takes any word for an edge and serves the page unpinned',
    file: 'scripts/lib/live-harness.ts',
    from: 'if (edge !== null && !oneOf(EDGES, edge)) return',
    to: "if (edge === '') return",
  },
  {
    label: 'a live harness page hydrates the basic demo under the markup of the one that was asked for',
    file: 'scripts/lib/live-harness.ts',
    from: 'dummy/${file}.tsx`',
    to: 'dummy/basic.tsx`',
  },
  {
    label: 'the live harness pins start to the end side of the page',
    file: 'scripts/lib/live-harness.ts',
    from: `'body[data-edge="start"] > #demo { align-items: center; justify-content: flex-start; }'`,
    to: `'body[data-edge="start"] > #demo { align-items: center; justify-content: flex-end; }'`,
  },
  {
    label: 'a pinned live harness page keeps its padding, so the demo sits 32 px away from the edge',
    file: 'scripts/lib/live-harness.ts',
    from: 'display: flex; min-height: 100dvh; padding: 0; }',
    to: 'display: flex; min-height: 100dvh; }',
  },
  {
    label: 'the trap of a live harness page records an error but never marks the page failed',
    file: 'scripts/lib/live-harness.ts',
    from: "    html.dataset.harness = 'failed'\n",
    to: '',
  },
  {
    label: 'a live harness page that failed turns hydrated when its tree finishes',
    file: 'scripts/lib/live-harness.ts',
    from: "done() { if (html.dataset.harness === 'pending') html.dataset.harness = 'hydrated' },",
    to: "done() { html.dataset.harness = 'hydrated' },",
  },
  {
    label: 'a console.error on a live harness page is printed and not recorded',
    file: 'scripts/lib/live-harness.ts',
    from: "console.error = (...args) => { fail('console.error', args.map(text).join(' ')); log.apply(console, args) }",
    to: 'console.error = (...args) => { log.apply(console, args) }',
  },
  {
    label: 'a picture that does not load fails a live harness page, though the avatar demo shows one on purpose',
    file: 'scripts/lib/live-harness.ts',
    from: 'else if (event.target instanceof HTMLScriptElement) fail(',
    to: 'else fail(',
  },
  {
    label: 'a path with a < in it closes the script element of a live harness page',
    file: 'scripts/lib/live-harness.ts',
    from: 'JSON.stringify(value).replace(/</g, LESS_THAN)',
    to: 'JSON.stringify(value)',
  },
  {
    label: 'a live harness page is served without its hydration script, as static as the page it replaces',
    file: 'scripts/lib/live-harness.ts',
    from: '${hydrateScript(route)}',
    to: '',
  },
  {
    label: 'a live harness page drops the tall attribute, so the page a spec asked to scroll is one screen high',
    file: 'scripts/lib/live-harness.ts',
    from: "${route.tall ? ' data-tall' : ''}",
    to: '',
  },
  {
    label: 'a live harness page hydrates every demo left to right, whatever direction the page has',
    file: 'scripts/lib/live-tree.tsx',
    from: '<TopClassProvider direction={direction} locale={locale} toast=',
    to: '<TopClassProvider direction="ltr" locale={locale} toast=',
  },
  {
    label: 'a live harness page gives the provider English labels on an Arabic page',
    file: 'scripts/lib/live-tree.tsx',
    from: '<TopClassProvider direction={direction} locale={locale} toast=',
    to: '<TopClassProvider direction={direction} locale="en" toast=',
  },
  {
    label: 'the harness takes the notes in a dummy folder for a demo',
    file: 'scripts/lib/harness.ts',
    from: "readdirSync(dir).filter((f) => f.endsWith('.tsx')).sort()",
    to: 'readdirSync(dir).sort()',
  },
  {
    label: 'the harness page loses the head the live harness adds, so no trap is set before the modules load',
    file: 'scripts/lib/harness.ts',
    from: '${head}</head>',
    to: '</head>',
  },
  {
    label: 'an Arabic harness page declares itself English',
    file: 'scripts/lib/harness.ts',
    from: "export const LANG = { ltr: 'en', rtl: 'ar' }",
    to: "export const LANG = { ltr: 'en', rtl: 'en' }",
  },
  {
    label: 'the target-size spec measures every input again, so the hidden 1 px input Base UI puts beside a toggle fails it',
    file: 'scripts/lib/targets.ts',
    from: `  'input:not([type="hidden"]):not([aria-hidden="true"])',\n  'input:not([type="hidden"]):not([tabindex="-1"])',\n`,
    to: "  'input',\n",
  },
  {
    label: 'the target-size spec loses the three toggle roles, so a toggle drawn by a span is never measured',
    file: 'scripts/lib/targets.ts',
    from: `  '[role="checkbox"]',\n  '[role="radio"]',\n  '[role="switch"]',\n`,
    to: '',
  },
]
