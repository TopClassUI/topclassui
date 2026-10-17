// The mutations of src/components/radio-group. Found by scripts/mutations/index.ts; every label says "radio group".
import type { Mutation } from '../lib/mutate.js'

const CLIENT = 'src/components/radio-group/client.tsx'
const HOOK = 'src/components/radio-group/hook.ts'
const CLASSES = 'src/components/radio-group/classes.ts'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the radio group item drops the server tab stop, so the group cannot be reached by Tab until the page hydrates',
    file: CLIENT,
    from: '<Radio.Root {...stop} {...rest} ',
    to: '<Radio.Root {...rest} ',
  },
  {
    label: 'the radio group puts its server tab stop on the default alone, so a controlled group serves it on the wrong radio',
    file: HOOK,
    from: 'serveTabStopOn(children, value ?? defaultValue ?? null, disabled)',
    to: 'serveTabStopOn(children, defaultValue ?? null, disabled)',
  },
  {
    label: 'the radio group hands Base UI defaultValue again, so a form reset leaves it as it was while the form sends the default',
    file: CLIENT,
    from: '        value={group.value}\n        onValueChange={group.onValueChange}\n',
    to: '        defaultValue={defaultValue}\n        onValueChange={onValueChange}\n',
  },
  {
    label: 'the radio group item is Base UI span again, so its label names nothing in the server HTML',
    file: CLIENT,
    from: ' nativeButton render={<button />}',
    to: '',
  },
  {
    label: 'the radio group ignores details.cancel(), so a handler that cancels still moves the check',
    file: HOOK,
    from: '    if (details.isCanceled) return\n',
    to: '',
  },
  {
    label: 'the radio group never calls the caller handler, so onValueChange hears nothing',
    file: HOOK,
    from: '    onValueChange?.(next, details)\n',
    to: '',
  },
  {
    label: 'the radio group drops the caller ref, which then never holds the radiogroup',
    file: HOOK,
    from: '  useImperativeHandle(ref, () => state.rootRef.current as HTMLDivElement, [state.rootRef, resetKey])\n',
    to: '  void ref\n',
  },
  {
    label: 'the radio group stops writing its radio inputs after a reset, so a controlled one sends the first default',
    file: HOOK,
    from: '    syncRadios(next, input, root)\n',
    to: '',
  },
  {
    label: 'the radio group checks every radio input after a reset, so the form sends the last radio and not the default',
    file: HOOK,
    from: 'input.checked = input.value === value',
    to: 'input.checked = true',
  },
  {
    label: 'the radio group drops invalid, so aria-invalid and the danger line never appear',
    file: CLIENT,
    from: 'aria-invalid={invalid ? true : ariaInvalid}',
    to: 'aria-invalid={ariaInvalid}',
  },
  {
    label: 'the radio group shares the default size with its radios, so size changes no circle',
    file: HOOK,
    from: 'useMemo(() => ({ size, opensOn })',
    to: 'useMemo(() => ({ size: RADIO_GROUP_DEFAULTS.size, opensOn })',
  },
  {
    label: 'the radio group circle loses its size, so every size draws the same circle',
    file: CLIENT,
    from: 'cn(RADIO_BOX, RADIO_SIZE[size])',
    to: 'cn(RADIO_BOX)',
  },
  {
    label: 'the radio group text loses its type step, so a large group has small text',
    file: CLIENT,
    from: 'cn(RADIO_ITEM, RADIO_ITEM_TEXT[size], className)',
    to: 'cn(RADIO_ITEM, className)',
  },
  {
    label: 'the radio group dot fills the whole circle instead of the drawn half',
    file: CLIENT,
    from: 'size="56%"',
    to: 'size="100%"',
  },
  {
    label: 'the radio group ignores orientation, so a horizontal group is a column',
    file: CLIENT,
    from: 'cn(RADIO_GROUP[orientation], className)',
    to: 'cn(RADIO_GROUP.vertical, className)',
  },
  {
    label: 'the radio group stops writing data-orientation',
    file: CLIENT,
    from: '        data-orientation={orientation}\n',
    to: '',
  },
  {
    label: 'the radio group puts the caller className first, so its own layout wins a conflict',
    file: CLIENT,
    from: 'cn(RADIO_GROUP[orientation], className)',
    to: 'cn(className, RADIO_GROUP[orientation])',
  },
  {
    label: 'the radio group item puts the caller className first, so its own gap wins a conflict',
    file: CLIENT,
    from: 'cn(RADIO_ITEM, RADIO_ITEM_TEXT[size], className)',
    to: 'cn(className, RADIO_ITEM, RADIO_ITEM_TEXT[size])',
  },
  {
    label: 'the radio group checked circle loses its inset ring, so checked is a 1 px line',
    file: CLASSES,
    from: ' group-data-checked/toggle:inset-ring-[calc(var(--tc-ring-width)-var(--tc-line-width))] group-data-checked/toggle:inset-ring-primary-on-soft',
    to: ' group-data-checked/toggle:inset-ring-primary-on-soft',
  },
  {
    label: 'the radio group invalid checked circle loses its danger line, so the primary line hides that it is wrong',
    file: CLASSES,
    from: ' group-aria-invalid/radios:group-data-checked/toggle:border-danger-solid',
    to: '',
  },
  {
    label: 'the radio group invalid line no longer thickens under forced colours, where the inset ring is not painted',
    file: CLASSES,
    from: " forced-colors:group-aria-invalid/radios:border-(length:--tc-ring-width)'",
    to: "'",
  },
  {
    label: 'the radio group circle is a rounded square, so it looks like a checkbox',
    file: CLASSES,
    from: 'export const RADIO_BOX = `rounded-full ',
    to: 'export const RADIO_BOX = `rounded-chip ',
  },
  {
    label: 'the radio group target is no peer, so the text of a disabled radio does not dim',
    file: CLASSES,
    from: 'export const RADIO_TARGET = `peer ${TOGGLE_TARGET}`',
    to: 'export const RADIO_TARGET = TOGGLE_TARGET',
  },
  {
    label: 'the radio group text does not dim beside a disabled radio',
    file: CLASSES,
    from: " peer-disabled:opacity-50'",
    to: "'",
  },
  {
    label: 'the radio group text no longer wraps anywhere, so a long word pushes the page sideways',
    file: CLASSES,
    from: "'min-w-0 wrap-anywhere ",
    to: "'min-w-0 ",
  },
  {
    label: 'the radio group horizontal row no longer wraps, so a row of radios pushes the page sideways',
    file: CLASSES,
    from: 'flex-row flex-wrap',
    to: 'flex-row',
  },
  {
    label: 'the radio group dot is no longer centred, so it sits at the inline start of the circle',
    file: CLASSES,
    from: "export const RADIO_DOT = 'flex size-full items-center justify-center'",
    to: "export const RADIO_DOT = 'flex size-full items-center'",
  },
  {
    label: 'the radio group no longer remounts Base UI after a reset, so Tab enters on the radio the user last picked, now unchecked',
    file: CLIENT,
    from: '        key={group.resetKey}\n',
    to: '',
  },
  {
    label: 'the radio group remounts after a reset with the focus inside it, so the focus falls to the page',
    file: HOOK,
    from: '    if (!root?.contains(document.activeElement)) setResetKey',
    to: '    setResetKey',
  },
  {
    label: 'the radio group keeps the caller ref on the element a reset removed',
    file: HOOK,
    from: '[state.rootRef, resetKey])',
    to: '[state.rootRef])',
  },
  {
    label: 'the radio group ignores a controlled value its owner set, so Tab enters on the radio the user last picked',
    file: HOOK,
    from: '    if (value === picked.current) return\n',
    to: '    return\n',
  },
  {
    label: 'the radio group forgets the value it picked itself, so a controlled pick remounts it and every child under it',
    file: HOOK,
    from: '    picked.current = next\n',
    to: '',
  },
  {
    label: 'the radio group dot is primary-solid again, 2.88:1 on the dark fill, under the 3:1 of R-5.6-4',
    file: CLASSES,
    from: ' text-primary-on-soft ',
    to: ' text-primary-solid ',
  },
  {
    label: 'the radio group checked line is primary-solid again, a colour apart from its dot',
    file: CLASSES,
    from: 'toggle:border-primary-on-soft',
    to: 'toggle:border-primary-solid',
  },
  {
    label: 'the radio group reads no children for its server tab stop, so with nothing checked the server HTML has none',
    file: HOOK,
    from: 'useState(() => serveTabStopOn(children, value ?? defaultValue ?? null, disabled))',
    to: 'useState(() => value ?? defaultValue ?? null)',
  },
]
