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
]
