// The mutations of src/components/button. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'a loading button can be re-enabled with disabled={false}',
    file: 'src/components/button/index.tsx',
    from: '  const inactive = disabled || loading',
    to: '  const inactive = disabled ?? loading',
  },
  {
    label: 'a rendered anchor keeps its tab stop while disabled',
    file: 'src/components/button/index.tsx',
    from: '    tabIndex: !nativeButton && inactive ? -1 : undefined,\n',
    to: '',
  },
  {
    label: 'the consumer className stops winning the merge',
    file: 'src/components/button/index.tsx',
    from: '    className: cn(buttonVariants({ variant, tone, size, fullWidth }), className),',
    to: '    className: cn(className, buttonVariants({ variant, tone, size, fullWidth })),',
  },
  {
    label: 'the button stops being a centred flex row',
    file: 'src/components/button/variants.ts',
    from: "    'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium rounded-control',",
    to: "    'whitespace-nowrap font-medium rounded-control',",
  },
  {
    label: 'the link variant emits nothing at all',
    file: 'src/components/button/variants.ts',
    from: '        link: `border-transparent underline-offset-4 ${HOVER.link}`,',
    to: "        link: '',",
  },
  {
    label: 'the border width leaves the base, so outline paints nothing',
    file: 'src/components/button/variants.ts',
    from: '    BORDER_WIDTH,\n',
    to: '',
  },
  {
    label: 'two tones share one fill',
    file: 'src/components/button/classes.ts',
    from: "  danger: 'bg-danger-solid text-danger-on-solid',",
    to: "  danger: 'bg-success-solid text-success-on-solid',",
  },
  {
    label: 'the skeleton stops pulsing',
    file: 'src/components/button/skeleton.tsx',
    from: "        'block animate-pulse rounded-control bg-surface motion-reduce:animate-none',",
    to: "        'block rounded-control bg-surface motion-reduce:animate-none',",
  },
  {
    label: 'the skeleton reserves one width at every size',
    file: 'src/components/button/classes.ts',
    from: "  xs: 'w-16', sm: 'w-20', md: 'w-24', lg: 'w-28', xl: 'w-32', custom: '',",
    to: "  xs: 'w-24', sm: 'w-24', md: 'w-24', lg: 'w-24', xl: 'w-24', custom: '',",
  },
  {
    label: 'the skeleton stops reading the real control height',
    file: 'src/components/button/skeleton.tsx',
    from: '        CONTROL_HEIGHT[size],',
    to: "        'h-control-lg',",
  },
  {
    label: 'the catalog row claims a status PLAN 20 does not support',
    file: 'src/components/button/meta.ts',
    from: "  status: 'beta',",
    to: "  status: 'stable',",
  },
  {
    label: 'a schema field loses its description',
    file: 'src/components/button/schema.ts',
    from: "    .meta({ description: 'Stretches the button to the width of its container.' }),",
    to: '',
  },
  { label: 'a demo is deleted', file: 'src/components/button/dummy/rtl.tsx', from: '', to: null },
  {
    label: 'a demo stops rendering the component',
    file: 'src/components/button/dummy/tones.tsx',
    from: 'export default function Demo() {',
    to: 'export default function Demo() {\n  return <div />\n}\nfunction Unused() {',
  },
  {
    label: 'a disabled anchor keeps the href it can still be followed by',
    file: 'src/components/button/index.tsx',
    from: "  const deadLink = inactive && render?.type === 'a'",
    to: '  const deadLink = false',
  },
]
