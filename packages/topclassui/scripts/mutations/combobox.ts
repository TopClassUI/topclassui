// The mutations of src/components/combobox. Found by scripts/mutations/index.ts; every label says "combobox".
import type { Mutation } from '../lib/mutate.js'

const CLIENT = 'src/components/combobox/client.tsx'
const PART = 'src/components/combobox/parts/combobox-list.tsx'
const HOOK = 'src/components/combobox/hook.ts'
const LIB = 'src/components/combobox/lib.ts'
const CLASSES = 'src/components/combobox/classes.ts'

export const MUTATIONS: Mutation[] = [
  {
    label: 'a combobox item loses its index, so the highlight cannot reach a row that is not mounted',
    file: PART,
    from: '          index={row.index}\n',
    to: '',
  },
  {
    label: 'the combobox root stops telling Base UI the list is windowed',
    file: CLIENT,
    from: '        virtualized\n',
    to: '',
  },
  {
    label: 'the combobox hands Base UI defaultValue again, so a form reset leaves it as it was while the form sends the default',
    file: CLIENT,
    from: '        value={combobox.value}\n',
    to: '        defaultValue={defaultValue}\n',
  },
  {
    label: 'the combobox positioner stops taking the side and the align of placement, so top-start opens under the input',
    file: CLIENT,
    from: '            side={side}\n            align={align}\n',
    to: '',
  },
  {
    label: 'the combobox positioner loses the dir and the lang of the provider, so an island opens in the page\'s direction',
    file: CLIENT,
    from: '            dir={combobox.dir}\n            lang={combobox.lang}\n',
    to: '',
  },
  {
    label: 'the combobox ignores details.cancel(), so a handler that cancels still changes the value',
    file: HOOK,
    from: '    if (!details.isCanceled) state.setValue(next)',
    to: '    state.setValue(next)',
  },
  {
    label: 'the combobox input loses its default cap of 256',
    file: HOOK,
    from: "    maxLength: resolveMaxLength(maxLength, 'search'),",
    to: '    maxLength: maxLength ?? undefined,',
  },
  {
    label: 'the combobox hands loadMoreThreshold to useCollection unclamped',
    file: HOOK,
    from: '    loadMoreThreshold: clamp(\n      props.loadMoreThreshold ?? COMBOBOX_DEFAULTS.loadMoreThreshold, loadMoreThresholdMin, loadMoreThresholdMax,\n    ),',
    to: '    loadMoreThreshold: props.loadMoreThreshold ?? COMBOBOX_DEFAULTS.loadMoreThreshold,',
  },
  {
    label: 'the combobox pages while closed, so a list kept mounted asks for one page after another nobody sees',
    file: HOOK,
    from: '    hasMore: hasMore && open,',
    to: '    hasMore,',
  },
  {
    label: 'the combobox counts a page by the matches of the query, so a page with no new match stops the paging and typing asks again',
    file: HOOK,
    from: '    loadedCount: loaded,\n',
    to: '',
  },
  {
    label: 'the combobox stops copying the text of its label onto the input, which then has no name while the list is open',
    file: HOOK,
    from: '  useEffect(() => { setSpoken(open && !named ? nameFromLabels(input.current) : undefined) }, [open, named])',
    to: '',
  },
  {
    label: 'the combobox keeps the copied text of its label while closed, so a label renamed then names the input with its old text',
    file: HOOK,
    from: 'setSpoken(open && !named ? nameFromLabels(input.current) : undefined)',
    to: 'setSpoken(!named ? nameFromLabels(input.current) : undefined)',
  },
  {
    label: 'the combobox says No results while its first page loads',
    file: HOOK,
    from: "    empty: status === 'loading' ? null : (props.emptyFallback ?? labels.collection.noResults),",
    to: '    empty: props.emptyFallback ?? labels.collection.noResults,',
  },
  {
    label: 'the combobox never draws its spinner',
    file: HOOK,
    from: "    spinning: status === 'loading',",
    to: '    spinning: false,',
  },
  {
    label: 'the combobox reads an arriving page as a new query, and throws the list back to its top',
    file: LIB,
    from: '  return after.length > before.length && before.every((option, index) => after[index] === option)',
    to: '  return after.length > before.length && before.length === 0',
  },
  {
    label: 'the combobox brings a mounted row in flush with the edge, not inside the padding of the list',
    file: LIB,
    from: '  if (rowTop - inset < scrollTop) return Math.max(0, rowTop - inset)',
    to: '  if (rowTop < scrollTop) return Math.max(0, rowTop)',
  },
  {
    label: 'a combobox row is no longer exactly one unit tall, so the spacers drift from the rows they stand for',
    file: CLASSES,
    from: "export const COMBOBOX_UNIT = 'h-(--tc-row-height)'",
    to: "export const COMBOBOX_UNIT = ''",
  },
  {
    label: 'the combobox list loses its start spacer',
    file: CLASSES,
    from: 'before:h-(--tc-list-pad-start) ',
    to: '',
  },
  {
    label: 'the combobox popup is no longer capped at the room Base UI measured',
    file: CLASSES,
    from: 'max-w-(--available-width) max-h-(--available-height) flex-col',
    to: 'max-w-(--available-width) flex-col',
  },
  {
    label: 'the combobox box loses the width of an Input',
    file: CLASSES,
    from: 'export const COMBOBOX_WIDTH = { own: FIELD_OWN_WIDTH, full:',
    to: "export const COMBOBOX_WIDTH = { own: '', full:",
  },
  {
    label: 'the active combobox row loses the line inside its edge, and is told by a fill alone',
    file: CLASSES,
    from: "export const COMBOBOX_ACTIVE = 'data-highlighted:outline-solid ",
    to: "export const COMBOBOX_ACTIVE = '",
  },
  {
    label: 'the combobox shows the raw value of an option in no loaded page, so the input reads an internal id',
    file: HOOK,
    from: '    labelOfUnknown,\n',
    to: '    labelOfUnknown: undefined,\n',
  },
  {
    label: 'the combobox scrolls to the chosen row before its unit is measured, so a reopen under a finger or at a 32 px root lands far short of it',
    file: HOOK,
    from: '      setUnit(height)\n      return\n',
    to: '      setUnit(height)\n',
  },
  {
    label: 'the combobox centres the chosen row once, before the popup cuts the list to fit, so at a 32 px root on a phone the row is half hidden',
    file: HOOK,
    from: '    if (node && target?.top === node.scrollTop && target.height !== node.clientHeight) {',
    to: '    if (node && target !== null && target.height < 0) {',
  },
  {
    label: 'the combobox centres the chosen row again after it was scrolled away, so a resize pulls the list back from where the user took it',
    file: HOOK,
    from: '    if (node && target?.top === node.scrollTop && target.height !== node.clientHeight) {',
    to: '    if (node && target && target.height !== node.clientHeight) {',
  },
]
