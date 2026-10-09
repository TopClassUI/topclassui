// The mutations of src/components/separator. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the decorative separator is announced as a separator',
    file: 'src/components/separator/index.tsx',
    from: "role={decorative ? 'none' : 'separator'}",
    to: 'role="separator"',
  },
  {
    label: 'the decorative separator keeps aria-orientation, which axe rejects on role none',
    file: 'src/components/separator/index.tsx',
    from: 'aria-orientation={decorative ? undefined : orientation}',
    to: 'aria-orientation={orientation}',
  },
  {
    label: 'the separator spreads the rest after its role, so a JS caller can contradict decorative',
    file: 'src/components/separator/index.tsx',
    from: "      {...rest}\n      // After the rest, so a JS caller cannot pass a role that contradicts `decorative`.\n      role={decorative ? 'none' : 'separator'}\n      // axe rejects aria-orientation on role none (aria-allowed-attr).\n      aria-orientation={decorative ? undefined : orientation}\n",
    to: "      role={decorative ? 'none' : 'separator'}\n      aria-orientation={decorative ? undefined : orientation}\n      {...rest}\n",
  },
  {
    label: 'the separator defaults to not decorative, so every plain line is announced',
    file: 'src/components/separator/constants.ts',
    from: '  decorative: true,',
    to: '  decorative: false,',
  },
  {
    label: 'the vertical separator draws on the physical left, so it does not mirror in RTL',
    file: 'src/components/separator/classes.ts',
    from: "vertical: 'self-stretch border-s-(length:--tc-line-width) border-line',",
    to: "vertical: 'self-stretch border-l-(length:--tc-line-width) border-line',",
  },
  {
    label: 'the vertical separator loses self-stretch, so it is 0 px tall in a centred row',
    file: 'src/components/separator/classes.ts',
    from: "vertical: 'self-stretch ",
    to: "vertical: '",
  },
  {
    label: 'the horizontal separator borders every side, so it is a 2 px box instead of a hairline',
    file: 'src/components/separator/classes.ts',
    from: "horizontal: 'w-full border-t-(length:--tc-line-width) border-line',",
    to: "horizontal: 'w-full border-(length:--tc-line-width) border-line',",
  },
  {
    label: 'the separator passes className first, so the consumer loses every conflict',
    file: 'src/components/separator/index.tsx',
    from: 'cn(SEPARATOR_ORIENTATION[orientation], className)',
    to: 'cn(className, SEPARATOR_ORIENTATION[orientation])',
  },
  {
    label: 'a consumer className replaces the separator classes, so the line disappears',
    file: 'src/components/separator/index.tsx',
    from: 'cn(SEPARATOR_ORIENTATION[orientation], className)',
    to: 'cn(className ?? SEPARATOR_ORIENTATION[orientation])',
  },
]
