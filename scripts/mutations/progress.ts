// The mutations of src/components/progress. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the progress clamp is gone, so a value of 150 is announced and widens the bar past the track',
    file: 'src/components/progress/index.tsx',
    from: 'const percent = clamp(value, PROGRESS_BOUNDARIES.valueMin, PROGRESS_BOUNDARIES.valueMax)',
    to: 'const percent = value',
  },
  {
    label: 'the progress rest spread moves after the ARIA values, so a caller aria-valuenow={150} skips the clamp',
    file: 'src/components/progress/index.tsx',
    from: '      {...rest}\n      role="progressbar"\n      aria-valuemin={PROGRESS_BOUNDARIES.valueMin}\n      aria-valuemax={PROGRESS_BOUNDARIES.valueMax}\n      aria-valuenow={indeterminate ? undefined : percent}\n',
    to: '      role="progressbar"\n      aria-valuemin={PROGRESS_BOUNDARIES.valueMin}\n      aria-valuemax={PROGRESS_BOUNDARIES.valueMax}\n      aria-valuenow={indeterminate ? undefined : percent}\n      {...rest}\n',
  },
  {
    label: 'the progress caller style spreads after the variable, so a style of 150% widens the bar past the clamp',
    file: 'src/components/progress/index.tsx',
    from: "style={{ ...style, '--tc-progress-value': `${String(percent)}%` }}",
    to: "style={{ '--tc-progress-value': `${String(percent)}%`, ...style }}",
  },
  {
    label: 'the progress className is passed first, so w-16 loses to w-full and a bar in a file row stretches',
    file: 'src/components/progress/index.tsx',
    from: "        'w-full overflow-hidden rounded-control bg-neutral-soft forced-color-adjust-none',\n        TRACK_HEIGHT[size],\n        className,\n",
    to: "        className,\n        'w-full overflow-hidden rounded-control bg-neutral-soft forced-color-adjust-none',\n        TRACK_HEIGHT[size],\n",
  },
  {
    label: 'a progress className replaces the track classes instead of merging, so the track loses its fill and height',
    file: 'src/components/progress/index.tsx',
    from: "      className={cn(\n        'w-full",
    to: "      className={className ?? cn(\n        'w-full",
  },
  {
    label: 'an indeterminate progress still announces a value, so a wait of unknown length reads as 0',
    file: 'src/components/progress/index.tsx',
    from: 'aria-valuenow={indeterminate ? undefined : percent}',
    to: 'aria-valuenow={percent}',
  },
  {
    label: 'the progress track loses forced-color-adjust-none, so forced colours repaint both fills to nothing',
    file: 'src/components/progress/index.tsx',
    from: "bg-neutral-soft forced-color-adjust-none'",
    to: "bg-neutral-soft'",
  },
  {
    label: 'the progress bar stops reading the variable, so every bar draws full whatever its value',
    file: 'src/components/progress/index.tsx',
    from: "'w-(--tc-progress-value)'",
    to: "'w-full'",
  },
  {
    label: 'a warning progress bar paints in primary',
    file: 'src/components/progress/classes.ts',
    from: "  warning: 'bg-warning-solid',",
    to: "  warning: 'bg-primary-solid',",
  },
  {
    label: 'the xs progress track takes the sm height, the drawn 4 px instead of the 2 px token',
    file: 'src/components/progress/classes.ts',
    from: "  xs: 'h-pad-y-xs',",
    to: "  xs: 'h-pad-y-sm',",
  },
  {
    label: 'the progress name stops being required, so a progressbar with no name type-checks',
    file: 'src/components/progress/types.ts',
    from: "    'aria-label': string\n",
    to: "    'aria-label'?: string | undefined\n",
  },
  {
    label: 'progress stops importing the style augmentation, so a program that compiles only Progress rejects its own --tc-* key',
    file: 'src/components/progress/index.tsx',
    from: "import type {} from '#shared/style-tokens.js'\n",
    to: '',
  },
  {
    label: 'the progress schema writes its tone default out by hand, so constants.ts no longer holds the only copy',
    file: 'src/components/progress/schema.ts',
    from: 'z.enum(PROGRESS_TONES).default(PROGRESS_DEFAULTS.tone)',
    to: "z.enum(PROGRESS_TONES).default('primary')",
  },
]
