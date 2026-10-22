// The mutations of src/components/skeleton. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the skeleton rows clamp is gone, so rows={1000} writes a thousand spans and rows={0} none',
    file: 'src/components/skeleton/index.tsx',
    from: 'Math.trunc(clamp(rows, SKELETON_BOUNDARIES.rowsMin, SKELETON_BOUNDARIES.rowsMax))',
    to: 'Math.trunc(rows)',
  },
  {
    label: 'the skeleton rows cap is raised to 500, so a runaway count writes ten times the spans',
    file: 'src/components/skeleton/boundaries.ts',
    from: 'rowsMax: 50,',
    to: 'rowsMax: 500,',
  },
  {
    label: 'the skeleton keeps a fractional row count, so rows={2.5} draws two rows and narrows neither',
    file: 'src/components/skeleton/index.tsx',
    from: 'const count = Math.trunc(clamp(',
    to: 'const count = (clamp(',
  },
  {
    label: 'a skeleton shape lets a caller un-hide it',
    file: 'src/components/skeleton/index.tsx',
    from: '        {...rest}\n        aria-hidden\n',
    to: '        aria-hidden\n        {...rest}\n',
  },
  {
    label: 'the text skeleton lets a caller un-hide it',
    file: 'src/components/skeleton/index.tsx',
    from: '{...rest} aria-hidden>',
    to: 'aria-hidden {...rest}>',
  },
  {
    label: 'a skeleton shape passes className first, so the consumer loses every conflict',
    file: 'src/components/skeleton/index.tsx',
    from: 'cn(SKELETON_SHAPE[variant], rounded && SKELETON_RADIUS[variant], fill, className)',
    to: 'cn(className, SKELETON_SHAPE[variant], rounded && SKELETON_RADIUS[variant], fill)',
  },
  {
    label: 'the text skeleton passes className first, so the consumer cannot set its width',
    file: 'src/components/skeleton/index.tsx',
    from: 'cn(SKELETON_SHAPE.text, className)',
    to: 'cn(className, SKELETON_SHAPE.text)',
  },
  {
    label: 'the text skeleton fills its column too, so the space between rows is painted',
    file: 'src/components/skeleton/index.tsx',
    from: 'cn(SKELETON_SHAPE.text, className)',
    to: 'cn(SKELETON_SHAPE.text, SKELETON_FILL, className)',
  },
  {
    label: 'a skeleton row loses its margins, so three rows are shorter than three lines',
    file: 'src/components/skeleton/classes.ts',
    from: ' my-[calc((1lh-0.75em)/2)]',
    to: '',
  },
  {
    label: 'the last skeleton row stops narrowing, so the block ends square',
    file: 'src/components/skeleton/classes.ts',
    from: "SKELETON_LAST_ROW = 'w-2/3'",
    to: "SKELETON_LAST_ROW = ''",
  },
  {
    label: 'reduced motion no longer stops the skeleton pulse',
    file: 'src/components/skeleton/classes.ts',
    from: "'bg-neutral-soft animate-pulse motion-reduce:animate-none'",
    to: "'bg-neutral-soft animate-pulse'",
  },
  {
    label: 'the skeleton circle loses shrink-0, so a flex row squeezes it into an oval',
    file: 'src/components/skeleton/classes.ts',
    from: "'block size-control-md shrink-0 rounded-full'",
    to: "'block size-control-md rounded-full'",
  },
  {
    label: 'the text skeleton spreads the rest onto every row too, so an id is written four times',
    file: 'src/components/skeleton/index.tsx',
    from: '          key={row}\n',
    to: '          key={row}\n          {...rest}\n',
  },
  {
    label: 'the skeleton fill loses its line, so every shape and every row paints nothing in forced colours',
    file: 'src/components/skeleton/classes.ts',
    from: "['bg-neutral-soft animate-pulse motion-reduce:animate-none', FORCED_EDGE].join(' ')",
    to: "'bg-neutral-soft animate-pulse motion-reduce:animate-none'",
  },
  {
    label: 'the row before the last stays full width, so three rows stop stepping down as drawn',
    file: 'src/components/skeleton/index.tsx',
    from: '            count > 2 && row === count - 2 && SKELETON_NEXT_TO_LAST_ROW,\n',
    to: '',
  },
  {
    label: 'animate={false} keeps the pulse, so a still skeleton still pulses',
    file: 'src/components/skeleton/index.tsx',
    from: 'const fill = animate ? SKELETON_FILL : SKELETON_FILL_STILL',
    to: 'const fill = SKELETON_FILL',
  },
  {
    label: 'rounded={false} keeps the corners of a rect and a card',
    file: 'src/components/skeleton/index.tsx',
    from: 'rounded && SKELETON_RADIUS[variant]',
    to: 'SKELETON_RADIUS[variant]',
  },
  {
    label: 'rounded={false} keeps the corners of every row',
    file: 'src/components/skeleton/index.tsx',
    from: 'rounded && SKELETON_ROW_RADIUS,',
    to: 'SKELETON_ROW_RADIUS,',
  },
]
