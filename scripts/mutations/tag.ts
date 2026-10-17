// The mutations of src/components/tag. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the tag default tone goes back to the shared primary, so a row of topics shouts',
    file: 'src/components/tag/constants.ts',
    from: "  tone: 'neutral',",
    to: "  tone: 'primary',",
  },
  {
    label: 'the tag renders its children bare, so a long label has no span to truncate and no bound',
    file: 'src/components/tag/index.tsx',
    from: '>\n      {truncateLabel(children, TAG_BOUNDARIES.labelMaxLength)}',
    to: '>\n      {children}',
  },
  {
    label: 'the tag loses CONTAIN, so a long label pushes it past its container',
    file: 'src/components/tag/variants.ts',
    from: '    BORDER_WIDTH,\n    CONTAIN,\n',
    to: '    BORDER_WIDTH,\n',
  },
  {
    label: 'a tag className replaces its classes instead of merging, so the look disappears',
    file: 'src/components/tag/index.tsx',
    from: 'cn(tagVariants({ tone, size }), className)',
    to: 'cn(className ?? tagVariants({ tone, size }))',
  },
  {
    label: 'the danger tag paints the solid pair, a look the tag does not have',
    file: 'src/components/tag/classes.ts',
    from: "  danger: 'bg-danger-soft text-danger-on-soft border-transparent',",
    to: "  danger: 'bg-danger-solid text-danger-on-solid border-transparent',",
  },
  {
    label: 'the tag label bound is raised to 10000, so a pasted file reaches the DOM',
    file: 'src/components/tag/boundaries.ts',
    from: 'labelMaxLength: 100,',
    to: 'labelMaxLength: 10_000,',
  },
  {
    label: 'the tag loses CLIP, so an element label widens the page or grows the tag to many lines',
    file: 'src/components/tag/variants.ts',
    from: '    CONTAIN,\n    CLIP,\n',
    to: '    CONTAIN,\n',
  },
  {
    label: 'the tag clip loses overflow-hidden, so an unbroken element label runs out of the chip',
    file: 'src/components/tag/classes.ts',
    from: "export const CLIP = 'overflow-hidden whitespace-nowrap shrink-0'",
    to: "export const CLIP = 'whitespace-nowrap shrink-0'",
  },
  {
    label: 'the tag clip loses whitespace-nowrap, so an element label wraps the tag to many lines',
    file: 'src/components/tag/classes.ts',
    from: "export const CLIP = 'overflow-hidden whitespace-nowrap shrink-0'",
    to: "export const CLIP = 'overflow-hidden shrink-0'",
  },
  {
    label: 'the tag clip loses shrink-0, so a flex row crushes a short tag and a column squashes it',
    file: 'src/components/tag/classes.ts',
    from: "export const CLIP = 'overflow-hidden whitespace-nowrap shrink-0'",
    to: "export const CLIP = 'overflow-hidden whitespace-nowrap'",
  },
  {
    label: 'the tag link demo wraps its link in a Tag, the form whose focus ring the clip cuts',
    file: 'src/components/tag/dummy/link.tsx',
    from: '<a href="#platform" className={chip}>{LONG}</a>',
    to: '<span data-tone="info" className={chip}><a href="#platform">{LONG}</a></span>',
  },
  {
    label: 'the tag long-label demo drops the class that lets two tags share a row, so the second leaves the box',
    file: 'src/components/tag/dummy/long-label.tsx',
    from: '<Tag className="shrink" tone="success">{LONG}</Tag>',
    to: '<Tag tone="success">{LONG}</Tag>',
  },
  {
    label: 'the tag README promises again that a plain Tag ships no JavaScript, though index.tsx still imports the x',
    file: 'src/components/tag/README.md',
    from: 'Tag renders on the server, with no client part.',
    to: 'Tag renders on the server and ships no JavaScript.',
  },
  {
    label: 'the tag skeleton loses its border width, so it is 2 px shorter than the tag',
    file: 'src/components/tag/skeleton.tsx',
    from: '        BORDER_WIDTH,\n',
    to: '',
  },
  {
    label: 'the tag skeleton lets a caller un-hide it',
    file: 'src/components/tag/skeleton.tsx',
    from: '      {...rest}\n      aria-hidden\n',
    to: '      aria-hidden\n      {...rest}\n',
  },
  {
    label: 'the tag skeleton passes className first, so the consumer loses every conflict',
    file: 'src/components/tag/skeleton.tsx',
    from: "      className={cn(\n        'inline-flex animate-pulse rounded-chip border-transparent bg-neutral-soft motion-reduce:animate-none',\n        BORDER_WIDTH,\n        TAG_SIZE[size],\n        SKELETON_WIDTH[size],\n        className,\n      )}",
    to: "      className={cn(\n        className,\n        'inline-flex animate-pulse rounded-chip border-transparent bg-neutral-soft motion-reduce:animate-none',\n        BORDER_WIDTH,\n        TAG_SIZE[size],\n        SKELETON_WIDTH[size],\n      )}",
  },
  {
    label: 'a tag skeleton className replaces its classes instead of merging, so the box disappears',
    file: 'src/components/tag/skeleton.tsx',
    from: "      className={cn(\n        'inline-flex",
    to: "      className={className ?? cn(\n        'inline-flex",
  },
]
