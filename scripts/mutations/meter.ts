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
    from: ' forced-color-adjust-none forced-colors:bg-[Canvas]',
    to: ' forced-colors:bg-[Canvas]',
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
    from: 'const high = Math.max(bound(max, METER_DEFAULTS.max), low)',
    to: 'const high = bound(max, METER_DEFAULTS.max)',
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
    from: 'const low = bound(min, METER_DEFAULTS.min)',
    to: 'const low = Number.isNaN(min) ? METER_DEFAULTS.min : min',
  },
  {
    label: 'the meter clamps a NaN min or max to the guard rail, so a NaN max draws a full bar and reads 0 of 0',
    file: 'src/components/meter/lib.ts',
    from: 'return clamp(Number.isNaN(end) ? fallback : end,',
    to: 'return clamp(end,',
  },
  {
    label: 'the meter gives a NaN max the default min, so the range collapses to one point',
    file: 'src/components/meter/lib.ts',
    from: 'bound(max, METER_DEFAULTS.max)',
    to: 'bound(max, METER_DEFAULTS.min)',
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
    from: "warning: 'bg-warning-on-soft',",
    to: "warning: 'bg-primary-on-soft',",
  },
  {
    label: 'the meter warning bar goes back to the solid fill, 1.77:1 on its track',
    file: 'src/components/meter/classes.ts',
    from: "warning: 'bg-warning-on-soft',",
    to: "warning: 'bg-warning-solid',",
  },
  {
    label: 'the meter track loses its line-strong outline, so the end of the range is 1.2:1 on the page',
    file: 'src/components/meter/classes.ts',
    from: ' outline-solid outline-(length:--tc-line-width) outline-line-strong',
    to: '',
  },
  {
    label: 'the meter track keeps its theme fill under forced colours, 1.2:1 on a canvas of the same polarity',
    file: 'src/components/meter/classes.ts',
    from: ' forced-colors:bg-[Canvas] ',
    to: ' ',
  },
  {
    label: 'the meter track edge keeps its theme colour under forced colours',
    file: 'src/components/meter/classes.ts',
    from: ' forced-colors:outline-[CanvasText]',
    to: '',
  },
  {
    label: 'the meter bar keeps its theme fill under forced colours, 1.77:1 on its track in a matching palette',
    file: 'src/components/meter/classes.ts',
    from: "rounded-control forced-colors:bg-[CanvasText]'",
    to: "rounded-control'",
  },
  {
    label: 'check-contrast stops measuring the bar of Meter and Progress on its neutral track',
    file: 'scripts/lib/contrast-checks.ts',
    from: 'worst(onSoft, track), 3)',
    to: 'worst(onSoft, track), 1)',
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
