// The mutations of src/components/segmented-control. Found by scripts/mutations/index.ts; every label says "segmented control".
import type { Mutation } from '../lib/mutate.js'

const CLIENT = 'src/components/segmented-control/client.tsx'
const HOOK = 'src/components/segmented-control/hook.ts'
const CLASSES = 'src/components/segmented-control/classes.ts'
const BOUNDARIES = 'src/components/segmented-control/boundaries.ts'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the segmented control selected segment loses its heavier weight, so only a fill tells it from the others',
    file: CLASSES,
    from: ' data-checked:font-semibold',
    to: '',
  },
  {
    label: 'the segmented control holder loses grid-cols-1, so a long track widens a table cell or a shrinking parent',
    file: CLASSES,
    from: "export const SEGMENTED_HOLDER = 'grid grid-cols-1'",
    to: "export const SEGMENTED_HOLDER = 'grid'",
  },
  {
    label: 'the segmented control item drops the server tab stop, so the track cannot be reached by Tab until the page hydrates',
    file: CLIENT,
    from: '      {...stop}\n',
    to: '',
  },
  {
    label: 'the segmented control puts its server tab stop on the default alone, so a controlled track serves it on the wrong segment',
    file: HOOK,
    from: 'useState(() => value ?? defaultValue ?? null)',
    to: 'useState(() => defaultValue ?? null)',
  },
  {
    label: 'the segmented control hands Base UI defaultValue again, so a form reset leaves it as it was while the form sends the default',
    file: CLIENT,
    from: '          value={track.value}\n          onValueChange={track.onValueChange}\n',
    to: '          defaultValue={defaultValue}\n          onValueChange={onValueChange}\n',
  },
  {
    label: 'the segmented control item is Base UI span again, so it is no button and no native label can press it',
    file: CLIENT,
    from: '      nativeButton\n      render={<button />}\n',
    to: '',
  },
  {
    label: 'the segmented control ignores details.cancel(), so a handler that cancels still moves the selection',
    file: HOOK,
    from: '    if (details.isCanceled) return\n',
    to: '',
  },
  {
    label: 'the segmented control never calls the caller handler, so onValueChange hears nothing',
    file: HOOK,
    from: '    onValueChange?.(next, details)\n',
    to: '',
  },
  {
    label: 'the segmented control drops the caller ref, which then never holds the radiogroup',
    file: HOOK,
    from: '  useImperativeHandle(ref, () => state.rootRef.current as HTMLDivElement, [state.rootRef, resetKey])\n',
    to: '  void ref\n',
  },
  {
    label: 'the segmented control stops writing its radio inputs after a reset, so a controlled one sends the first default',
    file: HOOK,
    from: '    syncRadios(next, input, root)\n',
    to: '',
  },
  {
    label: 'the segmented control checks every radio input after a reset, so the form sends the last segment and not the value',
    file: HOOK,
    from: 'input.checked = input.value === value',
    to: 'input.checked = true',
  },
  {
    label: 'the segmented control drops invalid, so aria-invalid and the danger line never appear',
    file: CLIENT,
    from: 'aria-invalid={invalid ? true : ariaInvalid}',
    to: 'aria-invalid={ariaInvalid}',
  },
  {
    label: 'the segmented control shares the default size with its segments, so size changes no segment',
    file: HOOK,
    from: 'useMemo(() => ({ size, opensOn })',
    to: 'useMemo(() => ({ size: SEGMENTED_CONTROL_DEFAULTS.size, opensOn })',
  },
  {
    label: 'the segmented control puts the caller className first on the track, so its own gap wins a conflict',
    file: CLIENT,
    from: 'cn(SEGMENTED_ROOT, SEGMENTED_ROOT_SIZE[size], fullWidth && SEGMENTED_FULL, className)',
    to: 'cn(className, SEGMENTED_ROOT, SEGMENTED_ROOT_SIZE[size], fullWidth && SEGMENTED_FULL)',
  },
  {
    label: 'the segmented control puts the caller className first on a segment, so its own padding wins a conflict',
    file: CLIENT,
    from: 'cn(SEGMENTED_ITEM, SEGMENTED_ITEM_SIZE[size], className)',
    to: 'cn(className, SEGMENTED_ITEM, SEGMENTED_ITEM_SIZE[size])',
  },
  {
    label: 'the segmented control track loses its height, so every size draws the same track',
    file: CLIENT,
    from: 'cn(SEGMENTED_ROOT, SEGMENTED_ROOT_SIZE[size], ',
    to: 'cn(SEGMENTED_ROOT, ',
  },
  {
    label: 'the segmented control segment loses its padding and type step, so a large track has small text',
    file: CLIENT,
    from: 'cn(SEGMENTED_ITEM, SEGMENTED_ITEM_SIZE[size], className)',
    to: 'cn(SEGMENTED_ITEM, className)',
  },
  {
    label: 'the segmented control ignores fullWidth on the track, so it never fills its parent',
    file: CLIENT,
    from: ', fullWidth && SEGMENTED_FULL, className)',
    to: ', className)',
  },
  {
    label: 'the segmented control full width no longer shares the track, so the segments bunch at its start',
    file: CLASSES,
    from: "export const SEGMENTED_FULL = 'w-full *:flex-1'",
    to: "export const SEGMENTED_FULL = 'w-full'",
  },
  {
    label: 'the segmented control track loses w-fit, so laid straight into a grid it fills the whole track',
    file: CLASSES,
    from: '`relative flex w-fit max-w-full ',
    to: '`relative flex max-w-full ',
  },
  {
    label: 'the segmented control track no longer scrolls inside itself, so seven long segments scroll the page sideways',
    file: CLASSES,
    from: ' ${SCROLL_X} ${FIELD_INVALID}`',
    to: ' ${FIELD_INVALID}`',
  },
  {
    label: 'the segmented control track is no offset parent and keeps no scroll padding, so an arrow in RTL leaves a segment cut',
    file: CLASSES,
    from: '`relative flex w-fit max-w-full items-stretch gap-0.5 rounded-control bg-surface p-0.75 scroll-px-px ',
    to: '`flex w-fit max-w-full items-stretch gap-0.5 rounded-control bg-surface p-0.75 ',
  },
  {
    label: 'the segmented control track drops the invalid look, so invalid is told to a screen reader alone',
    file: CLASSES,
    from: ' ${SCROLL_X} ${FIELD_INVALID}`',
    to: ' ${SCROLL_X}`',
  },
  {
    label: 'the segmented control segment loses its inset ring, so a focused segment shows nothing',
    file: CLASSES,
    from: 'CONTAIN, FOCUS_RING_INSET, TOUCH_TARGET,',
    to: 'CONTAIN, TOUCH_TARGET,',
  },
  {
    label: 'the segmented control segment loses its target floor, so a segment is under 24 px, and under 44 to a finger',
    file: CLASSES,
    from: 'FOCUS_RING_INSET, TOUCH_TARGET, TRANSITION,',
    to: 'FOCUS_RING_INSET, TRANSITION,',
  },
  {
    label: 'the segmented control selected segment loses the system highlight, so forced colours draw it as any other',
    file: CLASSES,
    from: ' forced-colors:data-checked:bg-[Highlight]',
    to: '',
  },
  {
    label: 'the segmented control centres a label that does not fit, so its start is the part that is cut',
    file: CLASSES,
    from: 'items-center justify-center-safe gap-1.5',
    to: 'items-center justify-center gap-1.5',
  },
  {
    label: 'the segmented control label is no longer a span of its own, so a long label is clipped with no ellipsis',
    file: CLIENT,
    from: '{truncateLabel(children, SEGMENTED_CONTROL_BOUNDARIES.labelMaxLength)}',
    to: '{children}',
  },
  {
    label: 'the segmented control bounds a label at 1000, so a pasted text reaches the page whole',
    file: BOUNDARIES,
    from: 'labelMaxLength: 100,',
    to: 'labelMaxLength: 1000,',
  },
  {
    label: 'the segmented control no longer remounts Base UI after a reset, so Tab enters on the segment the user last picked, now unchecked',
    file: CLIENT,
    from: '          key={track.resetKey}\n',
    to: '',
  },
  {
    label: 'the segmented control remounts after a reset with the focus inside it, so the focus falls to the page',
    file: HOOK,
    from: '    if (!root?.contains(document.activeElement)) setResetKey',
    to: '    setResetKey',
  },
  {
    label: 'the segmented control keeps the caller ref on the element a reset removed',
    file: HOOK,
    from: '[state.rootRef, resetKey])',
    to: '[state.rootRef])',
  },
  {
    label: 'the segmented control ignores a controlled value its owner set, so Tab enters on the segment the user last picked',
    file: HOOK,
    from: '    if (value === picked.current) return\n',
    to: '    return\n',
  },
  {
    label: 'the segmented control forgets the value it picked itself, so a controlled pick remounts it and every child under it',
    file: HOOK,
    from: '    picked.current = next\n',
    to: '',
  },
  {
    label: 'the segmented control disabled selected segment keeps the live highlight under forced colours, told apart by a fainter fill only',
    file: CLASSES,
    from: "  'forced-colors:data-checked:data-disabled:bg-[GrayText] forced-colors:data-checked:data-disabled:text-[Canvas]',\n",
    to: '',
  },
  {
    label: 'the segmented control lets an element label sit in the segment as it is, cut with no ellipsis and past the segment in rtl',
    file: CLASSES,
    from: "  '*:min-w-0 *:truncate',\n",
    to: '',
  },
  {
    label: 'the segmented control reads no children for its server tab stop, so with nothing checked the server HTML has none',
    file: HOOK,
    from: 'useState(() => serveTabStopOn(children, value ?? defaultValue ?? null, disabled))',
    to: 'useState(() => value ?? defaultValue ?? null)',
  },
]
