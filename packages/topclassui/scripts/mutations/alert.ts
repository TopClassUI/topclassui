// The mutations of src/components/alert. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the success alert shows the info icon, so its tone reads by colour alone',
    file: 'src/components/alert/constants.ts',
    from: '  success: checkCircle,\n',
    to: '  success: info,\n',
  },
  {
    label: 'icon={null} stops hiding the alert icon, so the tone default comes back',
    file: 'src/components/alert/index.tsx',
    from: '{icon === undefined ? <Svg',
    to: '{icon == null ? <Svg',
  },
  {
    label: 'the default alert icon loses size xs, so it follows the surrounding font size instead of a fixed 16 px',
    file: 'src/components/alert/index.tsx',
    from: ' size="xs" className="mt-0.5" />',
    to: ' className="mt-0.5" />',
  },
  {
    label: 'a tone no list holds crashes the alert render instead of taking the default icon',
    file: 'src/components/alert/index.tsx',
    from: 'Object.hasOwn(ALERT_ICONS, tone) ? ALERT_ICONS[tone] : ALERT_ICONS[ALERT_DEFAULTS.tone]',
    to: 'ALERT_ICONS[tone]',
  },
  {
    label: 'a false or empty alert slot renders an empty element, so it opens a gap',
    file: 'src/components/alert/index.tsx',
    from: "node == null || typeof node === 'boolean' || node === ''",
    to: 'node == null',
  },
  {
    label: 'the alert description takes the drawn 0.9 opacity, so white on the danger solid drops under 4.5:1',
    file: 'src/components/alert/index.tsx',
    from: '<div className="text-sm">{children}</div>',
    to: '<div className="text-sm opacity-90">{children}</div>',
  },
  {
    label: 'the alert body loses wrap-anywhere, so a long URL runs out of the box',
    file: 'src/components/alert/index.tsx',
    from: 'flex-col gap-1 wrap-anywhere"',
    to: 'flex-col gap-1"',
  },
  {
    label: 'the alert passes className first, so the consumer loses every conflict',
    file: 'src/components/alert/index.tsx',
    from: 'className={cn(alertVariants({ variant, tone }), className)}',
    to: 'className={cn(className, alertVariants({ variant, tone }))}',
  },
  {
    label: 'the alert loses its border width, so outline draws no line at all',
    file: 'src/components/alert/variants.ts',
    from: '    BORDER_WIDTH,\n',
    to: '',
  },
  {
    label: 'a solid alert tone loses its transparent border, so it draws a ring in its text colour',
    file: 'src/components/alert/classes.ts',
    from: "  danger: 'bg-danger-solid text-danger-on-solid border-transparent',",
    to: "  danger: 'bg-danger-solid text-danger-on-solid',",
  },
  {
    label: 'a danger alert announces itself as a live region on its own',
    file: 'src/components/alert/index.tsx',
    from: '      data-tone={tone}\n',
    to: "      data-tone={tone}\n      role={tone === 'danger' ? 'alert' : undefined}\n",
  },
  {
    label: "a caller's alert icon moves after the text, so it sits at the wrong end in either direction",
    file: 'src/components/alert/index.tsx',
    from: ' : icon}\n' +
      '      <div className="flex min-w-0 flex-1 flex-col gap-1 wrap-anywhere">\n' +
      '        {isEmpty(title) ? null : <p className="text-sm font-semibold">{title}</p>}\n' +
      '        {isEmpty(children) ? null : <div className="text-sm">{children}</div>}\n' +
      '        {isEmpty(actions) ? null : <div className="flex flex-wrap gap-2 pt-1">{actions}</div>}\n' +
      '      </div>\n',
    to: ' : null}\n' +
      '      <div className="flex min-w-0 flex-1 flex-col gap-1 wrap-anywhere">\n' +
      '        {isEmpty(title) ? null : <p className="text-sm font-semibold">{title}</p>}\n' +
      '        {isEmpty(children) ? null : <div className="text-sm">{children}</div>}\n' +
      '        {isEmpty(actions) ? null : <div className="flex flex-wrap gap-2 pt-1">{actions}</div>}\n' +
      '      </div>\n' +
      '      {icon === undefined ? null : icon}\n',
  },
  {
    label: 'an empty list in an alert slot renders an empty element, so it opens a gap',
    file: 'src/components/alert/index.tsx',
    from: ' || (Array.isArray(node) && node.every(isEmpty))',
    to: '',
  },
]
