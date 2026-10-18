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
    label: 'the tooltip rule stops looking inside expressions, so {ok && <a />} passes R-10.5-2',
    file: 'eslint-rules/index.ts',
    from: "if (node.type === 'JSXElement' || node.type === 'JSXFragment') return node",
    to: "if (depth === 0 && (node.type === 'JSXElement' || node.type === 'JSXFragment')) return node",
  },
  {
    label: 'the tooltip rule forgets renamed imports, so <Tip><a /></Tip> passes R-10.5-2',
    file: 'eslint-rules/index.ts',
    from: "if (names.has(String(node.imported?.name ?? ''))) names.add(String(node.local?.name ?? ''))",
    to: "if (false) names.add(String(node.local?.name ?? ''))",
  },
  {
    label: 'the tooltip rule ignores the children prop, so children={<a />} passes R-10.5-2',
    file: 'eslint-rules/index.ts',
    from: "if (attribute.type === 'JSXAttribute' && attribute.name?.name === 'children') flag(attribute.value, name)",
    to: "if (false) flag(attribute.value, name)",
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
