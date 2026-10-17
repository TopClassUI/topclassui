// The mutations of src/components/kbd. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the key renders a span instead of a kbd, so it stops meaning keyboard input',
    file: 'src/components/kbd/index.tsx',
    from: '<kbd className={classes} {...rest}>{children}</kbd>',
    to: '<span className={classes} {...rest}>{children}</span>',
  },
  {
    label: 'the key passes className first, so the consumer loses every conflict',
    file: 'src/components/kbd/index.tsx',
    from: "  const classes = cn(\n    'inline-flex items-center justify-center rounded-chip bg-surface px-1.5 py-0.5 font-mono text-xs text-body',\n    BORDER_STRONG,\n    className,\n  )",
    to: "  const classes = cn(\n    className,\n    'inline-flex items-center justify-center rounded-chip bg-surface px-1.5 py-0.5 font-mono text-xs text-body',\n    BORDER_STRONG,\n  )",
  },
  {
    label: 'the key loses its stroke, so it reads as plain monospace text',
    file: 'src/components/kbd/index.tsx',
    from: '    BORDER_STRONG,\n',
    to: '',
  },
  {
    label: 'the key drops the rest props, so ref, id, data-* and style never reach it',
    file: 'src/components/kbd/index.tsx',
    from: ' {...rest}>',
    to: '>',
  },
  {
    label: 'the key passes className before its stroke, so a consumer border colour or width is lost',
    file: 'src/components/kbd/index.tsx',
    from: '    BORDER_STRONG,\n    className,\n',
    to: '    className,\n    BORDER_STRONG,\n',
  },
]
