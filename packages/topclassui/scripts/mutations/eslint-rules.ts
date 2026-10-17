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
    label: 'R-5.3-2 lets an addition sit beside the --tc-dir product, so calc(100%*var(--tc-dir)+4px) passes',
    file: 'eslint-rules/dir-aware.ts',
    from: "    else if (ch === '+') return false",
    to: "    else if (ch === '+') continue",
  },
  {
    label: 'R-5.3-2 pairs a position with an rtl: mirror under other variants, so md:object-left rtl:object-right passes',
    file: 'eslint-rules/dir-aware.ts',
    from: '!mirrors.has(`${position.family}|${rest}|',
    to: '!mirrors.has(`${position.family}||',
  },
  {
    label: 'R-5.3-2 takes any origin variable as measured, so origin-(--my-origin) passes',
    file: 'eslint-rules/dir-aware.ts',
    from: "if (v === 'var(--transform-origin)') return false",
    to: "if (v.startsWith('var(')) return false",
  },
  {
    label: 'R-5.3-2 forgets the compound direction variants, so not-ltr:-scale-x-100 brings the icon mirror back',
    file: 'eslint-rules/dir-aware.ts',
    from: 'const DIR_VARIANT = /^(not-|group-|peer-|in-|has-)?(rtl|ltr)',
    to: 'const DIR_VARIANT = /^(rtl|ltr)',
  },
  {
    label: 'R-5.3-2 stops reading --tc-* style values',
    file: 'eslint-rules/index.ts',
    from: 'const hint = value === undefined ? undefined : findPhysicalValue(value)',
    to: 'const hint = value === undefined ? undefined : undefined',
  },
  {
    label: 'R-5.3-2 check-css stops reporting stylesheets',
    file: 'scripts/lib/css-direction.ts',
    from: 'if (hint) out.push(',
    to: 'if (hint && !hint) out.push(',
  },
]
