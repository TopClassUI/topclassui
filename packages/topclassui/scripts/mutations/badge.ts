// The mutations of src/components/badge. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the badge loses its border width, so outline draws no line at all',
    file: 'src/components/badge/variants.ts',
    from: '    BORDER_WIDTH,\n',
    to: '',
  },
  {
    label: 'the badge skeleton loses its border width, so it is 2 px shorter than the badge',
    file: 'src/components/badge/skeleton.tsx',
    from: '        BORDER_WIDTH,\n',
    to: '',
  },
  {
    label: 'the badge skeleton lets a caller un-hide it',
    file: 'src/components/badge/skeleton.tsx',
    from: '      {...rest}\n      aria-hidden\n',
    to: '      aria-hidden\n      {...rest}\n',
  },
  {
    label: 'a badge tone loses its transparent border, so it draws a ring in its label colour',
    file: 'src/components/badge/classes.ts',
    from: "  danger: 'bg-danger-solid text-danger-on-solid border-transparent',",
    to: "  danger: 'bg-danger-solid text-danger-on-solid',",
  },
  {
    label: 'the badge skeleton passes className first, so the consumer loses every conflict',
    file: 'src/components/badge/skeleton.tsx',
    from: "      className={cn(\n        'inline-flex animate-pulse rounded-chip border-transparent bg-neutral-soft motion-reduce:animate-none',\n        BORDER_WIDTH,\n        BADGE_SIZE[size],\n        SKELETON_WIDTH[size],\n        className,\n      )}",
    to: "      className={cn(\n        className,\n        'inline-flex animate-pulse rounded-chip border-transparent bg-neutral-soft motion-reduce:animate-none',\n        BORDER_WIDTH,\n        BADGE_SIZE[size],\n        SKELETON_WIDTH[size],\n      )}",
  },
  {
    label: 'a badge className replaces its classes instead of merging, so the look disappears',
    file: 'src/components/badge/index.tsx',
    from: 'cn(badgeVariants({ variant, tone, size }), className)',
    to: 'cn(className ?? badgeVariants({ variant, tone, size }))',
  },
  {
    label: 'a badge skeleton className replaces its classes instead of merging, so the box disappears',
    file: 'src/components/badge/skeleton.tsx',
    from: "      className={cn(\n        'inline-flex",
    to: "      className={className ?? cn(\n        'inline-flex",
  },
  {
    label: 'the md badge goes back to the 20 px line the frame does not draw',
    file: 'src/components/badge/classes.ts',
    from: "  md: 'px-3 py-pad-y-md gap-2 text-sm/4',",
    to: "  md: 'px-3 py-pad-y-md gap-2 text-sm',",
  },
]
