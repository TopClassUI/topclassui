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
    from: '    className: cn(buttonVariants({ variant, tone, size, fullWidth }), deadComponent && UNPRESSABLE, className),',
    to: '    className: cn(className, buttonVariants({ variant, tone, size, fullWidth }), deadComponent && UNPRESSABLE),',
  },
  {
    label: 'the button stops being a centred flex row',
    file: 'src/components/button/variants.ts',
    from: "    'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap font-medium rounded-control',",
    to: "    'cursor-pointer whitespace-nowrap font-medium rounded-control',",
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
    label: 'the button loses its pointer cursor',
    file: 'src/components/button/variants.ts',
    from: "    'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap font-medium rounded-control',",
    to: "    'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium rounded-control',",
  },
  {
    label: 'outline and ghost wear the tone text again instead of the body text Figma draws',
    file: 'src/components/button/variants.ts',
    from: "      { variant: [...BUTTON_BODY_TEXT], class: 'text-body' },",
    to: "      ...BUTTON_TONES.map((tone) => ({ variant: [...BUTTON_BODY_TEXT], tone, class: TONE_TEXT[tone] })),",
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
  { label: 'a demo is deleted', file: 'src/components/button/dummy/rtl.tsx', from: 'export default function Demo() {', to: null },
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
  {
    label: 'the button skeleton loses its line, so it paints nothing in forced colours',
    file: 'src/components/button/skeleton.tsx',
    from: '        FORCED_EDGE,\n',
    to: '',
  },
  {
    label: 'a button that is not disabled writes disabled: false again, a key that crosses Flight and outranks the disabled of a part rendered as it',
    file: 'src/components/button/index.tsx',
    from: '    disabled: nativeButton && inactive ? true : undefined,',
    to: '    disabled: nativeButton ? inactive : undefined,',
  },
  {
    label: 'a loading button writes no disabled key, so a busy button takes a second press',
    file: 'src/components/button/index.tsx',
    from: '    disabled: nativeButton && inactive ? true : undefined,',
    to: '    disabled: nativeButton && disabled ? true : undefined,',
  },
  {
    label: 'the button writes disabled on an anchor it renders, an attribute an anchor does not have',
    file: 'src/components/button/index.tsx',
    from: '    disabled: nativeButton && inactive ? true : undefined,',
    to: '    disabled: inactive ? true : undefined,',
  },
  {
    label: 'a disabled next/link button takes the pointer again, so a press follows the href it keeps',
    file: 'src/components/button/index.tsx',
    from: 'deadComponent && UNPRESSABLE, className',
    to: 'className',
  },
]
