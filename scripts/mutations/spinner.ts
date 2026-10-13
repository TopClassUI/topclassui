// The mutations of src/components/spinner. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'a hidden spinner still passes its label, so it is announced beside its own text',
    file: 'src/components/spinner/index.tsx',
    from: 'label={decorative ? undefined : name}',
    to: 'label={name}',
  },
  {
    label: 'the spinner reads aria-hidden="true" as named, so the string form is announced',
    file: 'src/components/spinner/index.tsx',
    from: "const decorative = ariaHidden === true || ariaHidden === 'true'",
    to: 'const decorative = ariaHidden === true',
  },
  {
    label: 'the spinner ignores the labels prop, so an Arabic page announces it in English',
    file: 'src/components/spinner/index.tsx',
    from: '? labels.common.loading : ariaLabel',
    to: '? en.common.loading : ariaLabel',
  },
  {
    label: 'the spinner drops the caller aria-label for the built-in one',
    file: 'src/components/spinner/index.tsx',
    from: "const name = ariaLabel === undefined || ariaLabel === '' ?",
    to: 'const name = true ?',
  },
  {
    label: 'a custom spinner passes the word custom to Svg, so its width is not 1em',
    file: 'src/components/spinner/index.tsx',
    from: "const length = size === 'custom' ? undefined : size",
    to: 'const length = size',
  },
  {
    label: 'the spinner keeps spinning for a reader who asked for less motion',
    file: 'src/components/spinner/index.tsx',
    from: "cn('animate-spin motion-reduce:animate-none',",
    to: "cn('animate-spin',",
  },
  {
    label: 'the spinner passes className first, so text-current loses to the tone',
    file: 'src/components/spinner/index.tsx',
    from: "cn('animate-spin motion-reduce:animate-none', SPINNER_TONE[tone], 'forced-colors:text-current', className)",
    to: "cn(className, 'animate-spin motion-reduce:animate-none', SPINNER_TONE[tone], 'forced-colors:text-current')",
  },
  {
    label: 'the spinner stops pinning flipRtl, so a smuggled flipRtl mirrors the ring',
    file: 'src/components/spinner/index.tsx',
    from: '      flipRtl={false}\n',
    to: '',
  },
  {
    label: 'the spinner spreads the rest after its glyph, so a smuggled icon replaces the ring',
    file: 'src/components/spinner/index.tsx',
    from: '      {...rest}\n      icon={circleNotch}\n',
    to: '      icon={circleNotch}\n      {...rest}\n',
  },
  {
    label: 'the danger spinner paints in primary, so two tones look the same',
    file: 'src/components/spinner/classes.ts',
    from: "  danger: 'text-danger-on-soft',",
    to: "  danger: 'text-primary-on-soft',",
  },
  {
    label: 'the spinner lets a smuggled label win, so a hidden spinner is named',
    file: 'src/components/spinner/index.tsx',
    from: '      {...rest}\n      icon={circleNotch}\n      size={length}\n      label={decorative ? undefined : name}\n',
    to: '      label={decorative ? undefined : name}\n      {...rest}\n      icon={circleNotch}\n      size={length}\n',
  },
  {
    label: 'the spinner keeps its tone colour under forced colors, so the ring fades into the system canvas',
    file: 'src/components/spinner/index.tsx',
    from: ", 'forced-colors:text-current', className)",
    to: ', className)',
  },
  {
    label: 'the spinner forwards locale to its svg again, so a spread of getLabels writes an attribute SVG does not have',
    file: 'src/components/spinner/index.tsx',
    from: '  locale: _locale,\n',
    to: '',
  },
]
