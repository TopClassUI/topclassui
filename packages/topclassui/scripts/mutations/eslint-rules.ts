// The mutations of the custom lint rules under eslint-rules/. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the style rule stops caring what the property is called',
    file: 'eslint-rules/index.ts',
    from: "if (!name.startsWith('--tc-')) ctx.report({ node: prop, messageId: 'property', data: { name } })",
    to: "if (false) ctx.report({ node: prop, messageId: 'property', data: { name } })",
  },
  {
    label: 'the label rule stops recognising prose',
    file: 'eslint-rules/index.ts',
    from: 'const isProse = (text: string) => /[A-Za-z]{2,}/.test(text)',
    to: 'const isProse = (text: string) => text === String(Symbol())',
  },
  {
    label: 'data-state stops being reported, so Base UI grammar leaks in',
    file: 'eslint-rules/index.ts',
    from: "if (name === 'data-state') {",
    to: "if (false) {",
  },
  {
    label: 'eslint stops reading the named colours, so bg-[red] passes R-5.2-1',
    file: 'eslint-rules/index.ts',
    from: "if (NAMED_COLORS.has(value) || value.startsWith('#') || COLOR_FUNCTION.test(value)) return 'arbitrary'",
    to: "if (value.startsWith('#') || COLOR_FUNCTION.test(value)) return 'arbitrary'",
  },
  {
    label: 'eslint accepts a system colour with no forced-colors variant, so bg-[CanvasText] passes anywhere',
    file: 'eslint-rules/index.ts',
    from: "if (kind === 'system' && variants.includes('forced-colors')) continue",
    to: "if (kind === 'system') continue",
  },
  {
    label: 'eslint lets forced-colors exempt any colour, so forced-colors:bg-[red] passes',
    file: 'eslint-rules/index.ts',
    from: "if (kind === 'system' && variants.includes('forced-colors')) continue",
    to: "if (variants.includes('forced-colors')) continue",
  },
  {
    label: 'R-5.2-6 reports only the first bracketed name in a string',
    file: 'eslint-rules/index.ts',
    from: 'for (const b of findBracketedNames(value)) ctx.report({ node, messageId: b.kind, data: b })',
    to: 'for (const b of findBracketedNames(value).slice(0, 1)) ctx.report({ node, messageId: b.kind, data: b })',
  },
  {
    label: 'R-5.2-6 skips aria-[busy=true], which is exactly aria-busy',
    file: 'eslint-rules/index.ts',
    from: "if (inner.includes('=') && !(stem === 'aria' && isTrue)) return undefined",
    to: "if (inner.includes('=')) return undefined",
  },
  {
    label: 'R-5.2-6 stops reading arbitrary selectors, so [&[data-open]]: passes',
    file: 'eslint-rules/index.ts',
    from: "const arbitrary = ARBITRARY_VARIANT.map(([re, prefix]) => [re.exec(variant), prefix] as const).find(([a]) => a)",
    to: "const arbitrary = ARBITRARY_VARIANT.map(([re, prefix]) => [re.exec(''), prefix] as const).find(([a]) => a)",
  },
  {
    label: 'R-5.2-6 calls the aria rewrite equivalent again',
    file: 'eslint-rules/index.ts',
    from: "const kindOf = (stem: string) => (stem === 'aria' ? 'aria' : 'bracketed')",
    to: "const kindOf = (stem: string) => (stem === String(Symbol()) ? 'aria' : 'bracketed')",
  },
  {
    label: 'R-5.2-6 stops linting the e2e fixtures and the harness page',
    file: 'eslint.config.ts',
    from: "files: ['e2e/**/*.{ts,tsx}', 'scripts/build-harness.tsx'],",
    to: "files: ['e2e/none'],",
  },
]
