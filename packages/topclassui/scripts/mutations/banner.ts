// The mutations of src/components/banner. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the banner writes its role before the rest props, so a caller can turn the landmark into something else',
    file: 'src/components/banner/index.tsx',
    from: '      {...rest}\n      role="region"\n',
    to: '      role="region"\n      {...rest}\n',
  },
  {
    label: 'the banner loses wrap-anywhere, so a long URL runs out of the row',
    file: 'src/components/banner/variants.ts',
    from: "text-sm font-medium wrap-anywhere'",
    to: "text-sm font-medium'",
  },
  {
    label: 'the banner message loses min-w-0, so it cannot shrink below its longest word beside an action',
    file: 'src/components/banner/classes.ts',
    from: "'min-w-0 grow basis-40'",
    to: "'grow basis-40'",
  },
  {
    label: 'an empty banner message renders an empty element, so it opens a gap',
    file: 'src/components/banner/index.tsx',
    from: '{isEmpty(children) ? null : <div className={MESSAGE}>{children}</div>}',
    to: '<div className={MESSAGE}>{children}</div>',
  },
  {
    label: 'the banner passes className first, so the consumer loses every conflict',
    file: 'src/components/banner/index.tsx',
    from: 'className={cn(bannerVariants({ tone }), className)}',
    to: 'className={cn(className, bannerVariants({ tone }))}',
  },
  {
    label: 'the danger banner paints the solid fill under the on-soft text, so the pair is no longer the soft one',
    file: 'src/components/banner/classes.ts',
    from: "danger: 'bg-danger-soft text-danger-on-soft'",
    to: "danger: 'bg-danger-solid text-danger-on-soft'",
  },
  {
    label: 'the banner row stops wrapping, so a long action squeezes the message to nothing instead of dropping under it',
    file: 'src/components/banner/variants.ts',
    from: "'flex w-full min-w-0 flex-wrap items-center",
    to: "'flex w-full min-w-0 items-center",
  },
  {
    label: 'the banner root loses min-w-0, so in a grid or flex track it widens the track to its action and the page scrolls sideways',
    file: 'src/components/banner/variants.ts',
    from: "'flex w-full min-w-0 flex-wrap",
    to: "'flex w-full flex-wrap",
  },
  {
    label: 'the banner message loses its basis, so beside a long action it is one letter wide',
    file: 'src/components/banner/classes.ts',
    from: "'min-w-0 grow basis-40'",
    to: "'min-w-0 flex-1'",
  },
  {
    label: 'the banner loses its forced-colours edge, so nothing marks the row once the fill is gone',
    file: 'src/components/banner/classes.ts',
    from: "FORCED_EDGE = 'forced-colors:border-b-(length:--tc-line-width)'",
    to: "FORCED_EDGE = ''",
  },
]
