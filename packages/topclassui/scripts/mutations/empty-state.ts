// The mutations of src/components/empty-state. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the empty state keeps its default description under a caller title',
    file: 'src/components/empty-state/index.tsx',
    from: 'const shownDescription = description === undefined && title === undefined',
    to: 'const shownDescription = description === undefined',
  },
  {
    label: 'the empty state frame loses its dash and draws a solid line',
    file: 'src/components/empty-state/classes.ts',
    from: "text-center wrap-anywhere border-dashed',",
    to: "text-center wrap-anywhere',",
  },
  {
    label: 'the empty state frame loses its border width and colour, so no line is drawn',
    file: 'src/components/empty-state/classes.ts',
    from: '  BORDER_STRONG,\n',
    to: '',
  },
  {
    label: 'the empty state passes className first, so the consumer loses every conflict',
    file: 'src/components/empty-state/index.tsx',
    from: 'cn(ROOT, className)',
    to: 'cn(className, ROOT)',
  },
  {
    label: 'the empty state shows its default icon when the caller passes icon={null}',
    file: 'src/components/empty-state/index.tsx',
    from: 'const shownIcon = icon === undefined ?',
    to: 'const shownIcon = icon == null ?',
  },
  {
    label: 'the empty state title ignores the labels prop, so an Arabic page shows an English title',
    file: 'src/components/empty-state/index.tsx',
    from: 'title === undefined ? labels.state.empty : title',
    to: 'title === undefined ? en.state.empty : title',
  },
  {
    label: 'the empty state wraps false or an empty string, so an empty slot opens a gap',
    file: 'src/components/empty-state/index.tsx',
    from: "node == null || typeof node === 'boolean' || node === ''",
    to: 'node == null',
  },
  {
    label: 'the empty state becomes a status live region, so a screen reader announces page content',
    file: 'src/components/empty-state/index.tsx',
    from: '<div className={cn(ROOT, className)} {...rest}>',
    to: '<div role="status" className={cn(ROOT, className)} {...rest}>',
  },
  {
    label: 'the empty state default icon drops to 1em, so it shrinks to the text size',
    file: 'src/components/empty-state/index.tsx',
    from: '<Svg icon={tray} size="xl" className={ICON} />',
    to: '<Svg icon={tray} className={ICON} />',
  },
  {
    label: 'the empty state passes className to the description too, so a consumer class restyles the text',
    file: 'src/components/empty-state/index.tsx',
    from: '<div className={DESCRIPTION}>',
    to: '<div className={cn(DESCRIPTION, className)}>',
  },
  {
    label: 'the empty state passes className to the default icon too, so a consumer class restyles it',
    file: 'src/components/empty-state/index.tsx',
    from: 'className={ICON} />',
    to: 'className={cn(ICON, className)} />',
  },
  {
    label: 'the empty state spreads the rest onto the title too, so an id is duplicated',
    file: 'src/components/empty-state/index.tsx',
    from: '<p className={TITLE}>',
    to: '<p className={TITLE} {...rest}>',
  },
  {
    label: 'the empty state wraps true, so a boolean slot opens a gap',
    file: 'src/components/empty-state/index.tsx',
    from: "typeof node === 'boolean'",
    to: 'node === false',
  },
  {
    label: 'the empty state forwards locale to its root again, so a spread of getLabels writes an attribute HTML does not have',
    file: 'src/components/empty-state/index.tsx',
    from: '  locale: _locale,\n',
    to: '',
  },
  {
    label: 'the empty state frame draws its dash in the faint decorative line, which the previewer does not',
    file: 'src/components/empty-state/classes.ts',
    from: '  BORDER_STRONG,\n',
    to: "  'border-(length:--tc-line-width) border-line',\n",
  },
]
