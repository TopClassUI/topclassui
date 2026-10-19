// The mutations of src/components/kbd. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the key renders a span instead of a kbd, so it stops meaning keyboard input',
    file: 'src/components/kbd/index.tsx',
    from: '<kbd data-pressed={pressed ? \'\' : undefined} data-disabled={disabled ? \'\' : undefined} className={classes} {...rest}>\n      {children}\n    </kbd>',
    to: '<span className={classes} {...rest}>\n      {children}\n    </span>',
  },
  {
    label: 'the key passes className first, so the consumer loses every conflict',
    file: 'src/components/kbd/index.tsx',
    from: "  const classes = cn(\n    'inline-flex items-center justify-center rounded-chip bg-surface-raised px-1.5 py-0.5 font-mono text-xs text-body',\n    // R-5.7-6: presence attributes. A key is not a control, so a disabled one keeps 4.5:1 text and fades its fill and line instead.\n    'data-pressed:bg-surface data-disabled:bg-surface data-disabled:border-line data-disabled:text-muted',\n    BORDER_STRONG,\n    className,\n  )",
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
  {
    label: 'a pressed key writes no attribute, so it never drops to the surface',
    file: 'src/components/kbd/index.tsx',
    from: "data-pressed={pressed ? '' : undefined}",
    to: 'data-pressed={undefined}',
  },
  {
    label: 'the key sits on the surface instead of the raised surface Figma draws',
    file: 'src/components/kbd/index.tsx',
    from: "rounded-chip bg-surface-raised px-1.5",
    to: "rounded-chip bg-surface px-1.5",
  },
]
