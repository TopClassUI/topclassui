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
    from: "'font-medium wrap-anywhere'",
    to: "'font-medium'",
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
    file: 'src/components/banner/classes.ts',
    from: '`flex w-full min-w-0 flex-wrap items-center',
    to: '`flex w-full min-w-0 items-center',
  },
  {
    label: 'the banner root loses min-w-0, so in a grid or flex track it widens the track to its action and the page scrolls sideways',
    file: 'src/components/banner/classes.ts',
    from: '`flex w-full min-w-0 flex-wrap',
    to: '`flex w-full flex-wrap',
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
  {
    label: 'the banner skeleton lets a caller un-hide it',
    file: 'src/components/banner/skeleton.tsx',
    from: '{...rest} aria-hidden>',
    to: 'aria-hidden {...rest}>',
  },
  {
    label: 'the banner skeleton drops the box of the x, so a dismissible banner arrives taller than its placeholder',
    file: 'src/components/banner/skeleton.tsx',
    from: '{dismissible ? <span className={BANNER_SKELETON_DISMISS} /> : null}',
    to: 'null',
  },
  {
    label: 'the banner skeleton box of the x loses its finger floor, so under a coarse pointer it is 20 px short',
    file: 'src/components/banner/classes.ts',
    from: 'inline-flex shrink-0 ms-auto rounded-control ${TOUCH_TARGET} ${PULSE}',
    to: 'inline-flex shrink-0 ms-auto rounded-control ${PULSE}',
  },
  {
    label: 'the banner skeleton and the banner lose their block padding, so a loading banner is 24 px short',
    file: 'src/components/banner/classes.ts',
    from: 'gap-3 px-5 py-3 text-sm',
    to: 'gap-3 px-5 text-sm',
  },
  {
    label: 'the banner skeleton passes className first, so the consumer loses every conflict',
    file: 'src/components/banner/skeleton.tsx',
    from: 'cn(BANNER_SKELETON, className)',
    to: 'cn(className, BANNER_SKELETON)',
  },
]
