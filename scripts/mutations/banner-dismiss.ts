// The mutations of the client half of src/components/banner. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

const INDEX = 'src/components/banner/index.tsx'
const CLIENT = 'src/components/banner/client.tsx'
const HOOK = 'src/components/banner/hook.ts'
const LIB = 'src/components/banner/lib.ts'
const CLASSES = 'src/components/banner/classes.ts'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the banner dismiss hook stops reading the stored value, so a dismissed banner comes back on every page',
    file: LIB,
    from: '    return localStorage.getItem(keyOf(id)) !== null',
    to: '    return false',
  },
  {
    label: 'the banner dismiss store writes without a guard, so blocked storage throws from the x',
    file: LIB,
    from: "  try {\n    localStorage.setItem(keyOf(id), '1')\n  } catch {",
    to: "  localStorage.setItem(keyOf(id), '1')\n  try {\n    void 0\n  } catch {",
  },
  {
    label: 'the banner dismiss store keeps no memory, so with blocked storage the x hides nothing',
    file: LIB,
    from: '  memory.add(id)\n',
    to: '',
  },
  {
    label: 'the banner dismiss store ignores the storage event, so a dismissal in another tab never reaches this one',
    file: LIB,
    from: "  addEventListener('storage', listener)\n",
    to: '',
  },
  {
    label: 'the banner dismiss server snapshot says dismissed, so the server renders no banner at all',
    file: HOOK,
    from: 'const onServer = () => false',
    to: 'const onServer = () => true',
  },
  {
    label: 'the banner dismiss x never calls onDismiss',
    file: HOOK,
    from: '      onDismiss?.()\n',
    to: '',
  },
  {
    label: 'the banner dismiss shell renders for a banner that is not dismissible, whenever it has an id',
    file: INDEX,
    from: 'if (dismissible && rest.id !== undefined) {',
    to: 'if (rest.id !== undefined) {',
  },
  {
    label: 'the banner dismiss shell writes its role before the rest props, so a caller can turn the landmark into something else',
    file: INDEX,
    from: '{...rest} id={rest.id} role="region" onDismiss',
    to: 'role="region" {...rest} id={rest.id} onDismiss',
  },
  {
    label: 'the banner dismiss shell passes className first, so the consumer loses every conflict',
    file: INDEX,
    from: 'const look = cn(bannerVariants({ tone }), className)',
    to: 'const look = cn(className, bannerVariants({ tone }))',
  },
  {
    label: 'the banner dismiss x has no name',
    file: CLIENT,
    from: '        aria-label={banner.label}\n',
    to: '',
  },
  {
    label: 'the banner dismiss x is a submit button, so inside a form it posts the form',
    file: CLIENT,
    from: '        type="button"\n',
    to: '',
  },
  {
    label: 'the banner dismiss x hovers in the default tone instead of the banner tone',
    file: CLIENT,
    from: "className={cn(DISMISS, DISMISS_TONE[rest['data-tone']])}",
    to: 'className={DISMISS}',
  },
  {
    label: 'the banner dismiss x loses ms-auto, so on a line of its own it sits at the inline start',
    file: CLASSES,
    from: "  'ms-auto',\n",
    to: '',
  },
  {
    label: 'the banner dismiss x draws no outline on hover under forced colours, where its fill is erased',
    file: CLASSES,
    from: "  'forced-colors:hover:outline-solid forced-colors:hover:outline-(length:--tc-line-width)',\n",
    to: '',
  },
  {
    label: 'the banner dismiss x is no icon button: no 24 px floor, no 44 px on touch, no focus ring',
    file: CLASSES,
    from: '  ICON_BUTTON,\n  HOVER.soft,',
    to: '  HOVER.soft,',
  },
  {
    label: 'the banner dismiss type stops requiring an id with dismissible',
    file: 'src/components/banner/types.ts',
    from: "    /** The key the dismissal is remembered under, and the element's id. Required with `dismissible`. */\n    id: string\n",
    to: "    /** The key the dismissal is remembered under, and the element's id. Required with `dismissible`. */\n    id?: string | undefined\n",
  },
  {
    label: 'the banner dismiss type takes only a literal true, so a boolean decided at runtime is refused even with an id',
    file: 'src/components/banner/types.ts',
    from: '    dismissible: boolean\n',
    to: '    dismissible: true\n',
  },
]
