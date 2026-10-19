// The mutations of src/components/avatar. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the avatar image is no longer laid over the fallback, so both sit side by side in the circle',
    file: 'src/components/avatar/classes.ts',
    from: "'absolute inset-0 size-full object-cover text-transparent forced-color-adjust-none'",
    to: "'size-full object-cover text-transparent forced-color-adjust-none'",
  },
  {
    label: 'the avatar root passes className first, so the consumer loses every conflict',
    file: 'src/components/avatar/parts/avatar-root.tsx',
    from: 'cn(AVATAR_ROOT, AVATAR_SIZE[size], className)',
    to: 'cn(className, AVATAR_ROOT, AVATAR_SIZE[size])',
  },
  {
    label: 'the avatar custom size emits the md box, so className can no longer be the only size',
    file: 'src/components/avatar/classes.ts',
    from: "  custom: '',",
    to: "  custom: 'size-control-md text-sm',",
  },
  {
    label: 'the avatar circle becomes the control radius, on the root and its skeleton at once',
    file: 'src/components/avatar/classes.ts',
    from: "export const AVATAR_CIRCLE = 'rounded-full'",
    to: "export const AVATAR_CIRCLE = 'rounded-control'",
  },
  {
    label: 'the avatar skeleton spreads the rest after aria-hidden, so a caller can un-hide a placeholder',
    file: 'src/components/avatar/skeleton.tsx',
    from: '{...rest} aria-hidden>',
    to: 'aria-hidden {...rest}>',
  },
  {
    label: 'the avatar fallback is no longer hidden by default, so the initials are read after the alt',
    file: 'src/components/avatar/parts/avatar-fallback.tsx',
    from: "'aria-hidden': ariaHidden = true,",
    to: "'aria-hidden': ariaHidden,",
  },
  {
    label: 'the avatar fallback ignores the caller, so aria-hidden={false} can never bring the initials back',
    file: 'src/components/avatar/parts/avatar-fallback.tsx',
    from: '<span aria-hidden={ariaHidden} ',
    to: '<span aria-hidden ',
  },
  {
    label: 'an avatar part becomes a client module, which check-boundaries checks only in index.tsx',
    file: 'src/components/avatar/parts/avatar-root.tsx',
    from: "import { cn } from '#shared/cn.js'\n",
    to: "'use client'\nimport { cn } from '#shared/cn.js'\n",
  },
  {
    label: 'a failed avatar image prints its alt again, over the initials, in every mode and under forced colours',
    file: 'src/components/avatar/classes.ts',
    from: " object-cover text-transparent forced-color-adjust-none'",
    to: " object-cover'",
  },
  {
    label: 'a failed avatar image stays quiet only outside forced colours, which repaint its alt with a backplate',
    file: 'src/components/avatar/classes.ts',
    from: " text-transparent forced-color-adjust-none'",
    to: " text-transparent'",
  },
  {
    label: 'the avatar root takes no role when it is labelled, so a span carries a name ARIA prohibits',
    file: 'src/components/avatar/parts/avatar-root.tsx',
    from: "role={role ?? (named ? 'img' : undefined)}",
    to: 'role={role}',
  },
  {
    label: "the avatar root overrides the caller's own role whenever it is labelled",
    file: 'src/components/avatar/parts/avatar-root.tsx',
    from: "role={role ?? (named ? 'img' : undefined)}",
    to: "role={named ? 'img' : role}",
  },
  {
    label: 'the avatar root becomes an image for an empty label, which is an image with no name',
    file: 'src/components/avatar/parts/avatar-root.tsx',
    from: "Boolean(rest['aria-label']) || Boolean(rest['aria-labelledby'])",
    to: "rest['aria-label'] !== undefined || rest['aria-labelledby'] !== undefined",
  },
  {
    label: 'the avatar and its skeleton lose their edge under forced colours, where no fill draws them',
    file: 'src/components/avatar/classes.ts',
    from: "export const AVATAR_FORCED_EDGE = 'forced-colors:outline-(length:--tc-line-width)'",
    to: "export const AVATAR_FORCED_EDGE = ''",
  },
  {
    label: 'the avatar image ignores render, so a framework image is replaced by a plain img',
    file: 'src/components/avatar/client.tsx',
    from: 'renderElement(render ?? <img />, ',
    to: 'renderElement(<img />, ',
  },
  {
    label: 'the md avatar keeps the 14 px initials, smaller than the 0.4 of the circle Figma draws',
    file: 'src/components/avatar/classes.ts',
    from: "  md: 'size-control-md text-base',",
    to: "  md: 'size-control-md text-sm',",
  },
]
