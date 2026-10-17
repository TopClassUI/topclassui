// The mutations of the three tokens src/tokens.css declares for Meter and TreeView. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the unit 5 token of a meter is not declared, so R-4-2 fails the Meter that reads it and its bar fills the track',
    file: 'src/tokens.css',
    from: '  --tc-meter-value: 0%;\n',
    to: '',
  },
  {
    label: 'the unit 5 token of a tree level is a length, which the indent cannot multiply by, so every row loses its indent',
    file: 'src/tokens.css',
    from: '  --tc-tree-level: 0;\n',
    to: '  --tc-tree-level: 0px;\n',
  },
  {
    label: 'the unit 5 token of a tree indent ignores the density knob',
    file: 'src/tokens.css',
    from: '  --tc-tree-indent: calc(1.125rem * var(--tc-density));\n',
    to: '  --tc-tree-indent: 1.125rem;\n',
  },
]
