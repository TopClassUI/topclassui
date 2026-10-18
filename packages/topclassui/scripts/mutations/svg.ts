// The mutations of src/components/svg, which both <Icon>s render through. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the directional icon mirror goes back to rtl:-scale-x-100, the direction variant R-5.3-2 keeps for positions',
    file: 'src/components/svg/index.tsx',
    from: "flip && 'scale-x-(--tc-dir)'",
    to: "flip && 'rtl:-scale-x-100'",
  },
  {
    label: 'a directional icon is never mirrored, so an arrow points against the reading direction in RTL',
    file: 'src/components/svg/index.tsx',
    from: "flip && 'scale-x-(--tc-dir)'",
    to: "flip && ''",
  },
  {
    label: 'the --tc-dir knob stays 1 in RTL, so every directional icon and slide keeps its LTR way',
    file: 'src/tokens.css',
    from: "[dir='rtl'] {\n  --tc-dir: -1;",
    to: "[dir='rtl'] {\n  --tc-dir: 1;",
  },
]
