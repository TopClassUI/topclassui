// The mutations of src/components/card. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'a bare Card export appears beside the card parts',
    file: 'src/components/card/index.tsx',
    from: "export { CardRoot } from './parts/card-root.js'",
    to: "export { CardRoot, CardRoot as Card } from './parts/card-root.js'",
  },
  {
    label: 'a card part becomes a client module, which check-boundaries checks only in index.tsx',
    file: 'src/components/card/parts/card-footer.tsx',
    from: "import { cn } from '#shared/cn.js'\n",
    to: "'use client'\nimport { cn } from '#shared/cn.js'\n",
  },
  {
    label: 'a card part imports a client hook, which check-boundaries checks only in index.tsx',
    file: 'src/components/card/parts/card-header.tsx',
    from: "import { cn } from '#shared/cn.js'\n",
    to: "import { useState } from 'react'\nimport { cn } from '#shared/cn.js'\n",
  },
  {
    label: 'the card root passes className first, so the consumer loses every conflict',
    file: 'src/components/card/parts/card-root.tsx',
    from: 'className={cn(CARD_ROOT, className)}',
    to: 'className={cn(className, CARD_ROOT)}',
  },
  {
    label: 'the card root loses its hairline border',
    file: 'src/components/card/classes.ts',
    from: "'flex flex-col gap-2.5 rounded-box bg-surface-raised p-4.5', BORDER]",
    to: "'flex flex-col gap-2.5 rounded-box bg-surface-raised p-4.5']",
  },
  {
    label: 'the card body becomes a flex column, so a sentence with a link stacks as rows',
    file: 'src/components/card/classes.ts',
    from: "export const CARD_BODY = 'text-sm text-muted'",
    to: "export const CARD_BODY = 'flex flex-col text-sm text-muted'",
  },
  {
    label: 'the card footer drops the rest props, so id, aria-*, style and ref never reach it',
    file: 'src/components/card/parts/card-footer.tsx',
    from: '<div className={cn(CARD_FOOTER, className)} {...rest}>',
    to: '<div className={cn(CARD_FOOTER, className)}>',
  },
  {
    label: 'the card skeleton lets a caller un-hide it',
    file: 'src/components/card/skeleton.tsx',
    from: '{...rest} aria-hidden />',
    to: 'aria-hidden {...rest} />',
  },
  {
    label: 'a type-only Card export appears beside the card prop types',
    file: 'src/components/card/index.tsx',
    from: 'CardRootProps, CardSkeletonProps,',
    to: 'CardRootProps, CardRootProps as Card, CardSkeletonProps,',
  },
  {
    label: 'the card skeleton loses its line, so it paints nothing in forced colours',
    file: 'src/components/card/classes.ts',
    from: "  FORCED_EDGE,\n].join(' ')",
    to: "].join(' ')",
  },
  {
    label: 'a card rendered as a link loses its drawn hover',
    file: 'src/components/card/classes.ts',
    from: "['cursor-pointer text-start', HOVER.surface, FOCUS_RING, TRANSITION]",
    to: "['cursor-pointer text-start', FOCUS_RING, TRANSITION]",
  },
  {
    label: 'a card rendered as a link drops the element it was given',
    file: 'src/components/card/parts/card-root.tsx',
    from: '  if (render) {',
    to: '  if (render && false) {',
  },
  {
    label: 'the card media stops bleeding over the root padding',
    file: 'src/components/card/classes.ts',
    from: "'-mx-4.5 -mt-4.5 mb-2 flex",
    to: "'mb-2 flex",
  },
]
