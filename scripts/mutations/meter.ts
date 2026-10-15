// The mutations of src/components/meter. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the meter percent drops - min, so 150 between 100 and 200 draws 150%',
    file: 'src/components/meter/lib.ts',
    from: 'return ((value - min) / (max - min)) * 100',
    to: 'return (value / (max - min)) * 100',
  },
  {
    label: 'the meter track loses forced-color-adjust-none, so forced colours repaint the bar to nothing',
    file: 'src/components/meter/classes.ts',
    from: "'w-full overflow-hidden rounded-control bg-neutral-soft forced-color-adjust-none'",
    to: "'w-full overflow-hidden rounded-control bg-neutral-soft'",
  },
  {
    label: 'the meter divides by zero when max equals min, instead of drawing a full track',
    file: 'src/components/meter/lib.ts',
    from: 'if (max === min) return 100',
    to: 'if (max === min) return 0',
  },
  {
    label: 'the meter keeps a max below min, so the range runs backwards',
    file: 'src/components/meter/lib.ts',
    from: 'const high = Math.max(clamp(max, METER_BOUNDARIES.limitMin, METER_BOUNDARIES.limitMax), low)',
    to: 'const high = clamp(max, METER_BOUNDARIES.limitMin, METER_BOUNDARIES.limitMax)',
  },
  {
    label: 'the meter announces and draws an unclamped value, past max or NaN',
    file: 'src/components/meter/lib.ts',
    from: 'value: clamp(value, low, high)',
    to: 'value',
  },
  {
    label: 'the meter lets a stray 1e308 min through the guard rail',
    file: 'src/components/meter/lib.ts',
    from: 'const low = clamp(min, METER_BOUNDARIES.limitMin, METER_BOUNDARIES.limitMax)',
    to: 'const low = min',
  },
  {
    label: 'the meter spreads the rest last, so a caller aria-valuenow or role beats the clamp',
    file: 'src/components/meter/index.tsx',
    from: 'className={cn(METER_TRACK, METER_TRACK_HEIGHT[size], className)}\n    >',
    to: 'className={cn(METER_TRACK, METER_TRACK_HEIGHT[size], className)}\n      {...rest}\n    >',
  },
  {
    label: 'the meter lets a caller style override --tc-meter-value and widen the bar past the track',
    file: 'src/components/meter/index.tsx',
    from: "style={{ ...style, '--tc-meter-value': `${String(percent)}%` }}",
    to: "style={{ '--tc-meter-value': `${String(percent)}%`, ...style }}",
  },
  {
    label: 'the meter merges className first, so its own classes beat the consumer',
    file: 'src/components/meter/index.tsx',
    from: 'cn(METER_TRACK, METER_TRACK_HEIGHT[size], className)',
    to: 'cn(className, METER_TRACK, METER_TRACK_HEIGHT[size])',
  },
  {
    label: 'the meter warning bar is painted in primary',
    file: 'src/components/meter/classes.ts',
    from: "warning: 'bg-warning-solid',",
    to: "warning: 'bg-primary-solid',",
  },
  {
    label: 'the meter xs track is as tall as sm',
    file: 'src/components/meter/classes.ts',
    from: "xs: 'h-pad-y-xs',",
    to: "xs: 'h-pad-y-sm',",
  },
  {
    label: 'the meter schema drops the guard rail on value, so the docs table shows no limit',
    file: 'src/components/meter/schema.ts',
    from: 'value: z.number().min(limitMin).max(limitMax)',
    to: 'value: z.number()',
  },
]
