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
    label: 'R-5.3-4 stops following a local const, so side={s} with s = "left" passes',
    file: 'eslint-rules/index.ts',
    from: "if (node.type === 'Identifier') return recur(constInit(ctx, node))",
    to: "if (node.type === 'Identifier') return []",
  },
  {
    label: 'R-5.3-4 skips every computed key again, so { ["side"]: "left" } passes',
    file: 'eslint-rules/index.ts',
    from: "if (node.computed && node.key?.type !== 'Literal') return",
    to: 'if (node.computed) return',
  },
  {
    label: 'R-5.3-4 is switched off for every test again, so a dom test may name a physical side',
    file: 'eslint.config.ts',
    from: "files: ['src/**/*.schema.test.ts', 'src/shared/contracts/toast.test.ts'],",
    to: "files: ['src/**/*.test.{ts,tsx}', 'src/**/test/**/*.{ts,tsx}'],",
  },
]
