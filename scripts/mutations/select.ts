// The mutations of src/components/select. Found by scripts/mutations/index.ts; every label says "select".
import type { Mutation } from '../lib/mutate.js'

const CLIENT = 'src/components/select/client.tsx'
const HOOK = 'src/components/select/hook.ts'
const CLASSES = 'src/components/select/classes.ts'
const LIB = 'src/components/select/lib.ts'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the select positioner stops taking the side and the align of placement, so top-start opens under the trigger',
    file: CLIENT,
    from: '          side={side}\n          align={align}\n',
    to: '',
  },
  {
    label: 'the select box loses FIELD_HOLDER, so the trigger is as wide as its label',
    file: CLASSES,
    from: 'inline-grid align-middle ${FIELD_HOLDER}',
    to: 'inline-grid align-middle',
  },
  {
    label: 'the select hands Base UI defaultValue again, so a form reset leaves it as it was while the form sends the default',
    file: CLIENT,
    from: '      value={select.value}\n',
    to: '      defaultValue={defaultValue}\n',
  },
  {
    label: 'the select ignores details.cancel(), so a handler that cancels still changes the value',
    file: HOOK,
    from: '    if (!details.isCanceled) state.setValue(next)',
    to: '    state.setValue(next)',
  },
  {
    label: 'the select never calls the caller handler, so onValueChange hears nothing',
    file: HOOK,
    from: '    onValueChange?.(next, details)\n',
    to: '',
  },
  {
    label: 'the select drops the caller inputRef, which then never holds the hidden input',
    file: HOOK,
    from: '  useImperativeHandle(inputRef, () => state.inputRef.current as HTMLInputElement, [state.inputRef])\n',
    to: '  void inputRef\n',
  },
  {
    label: 'the select lets Base UI align the chosen item over the trigger, so placement and the 6 px offset are ignored',
    file: CLIENT,
    from: '          alignItemWithTrigger={false}\n',
    to: '',
  },
  {
    label: 'the select stops clamping visibleRows, so 99 rows run the list past the screen',
    file: HOOK,
    from: 'clamp(visibleRows, visibleRowsMin, visibleRowsMax)',
    to: 'visibleRows',
  },
  {
    label: 'the select positioner loses the dir and the lang of the provider, so an Arabic island opens its list left to right',
    file: CLIENT,
    from: '          dir={select.dir}\n          lang={select.lang}\n',
    to: '',
  },
  {
    label: 'the select ignores invalid, so a wrong choice has no aria-invalid and no red line',
    file: CLIENT,
    from: 'aria-invalid={invalid ? true : ariaInvalid}',
    to: 'aria-invalid={ariaInvalid}',
  },
  {
    label: 'the select loses its placeholder fallback, so an empty trigger prints nothing',
    file: HOOK,
    from: 'placeholder: placeholder ?? labels.select.placeholder,',
    to: 'placeholder,',
  },
  {
    label: 'the select ignores fullWidth, so the box never fills its parent',
    file: CLIENT,
    from: ', fullWidth && FIELD_HOLDER_FULL)',
    to: ')',
  },
  {
    label: 'the select row loses ROW_TOUCH, so a row is 40 px under a finger',
    file: CLASSES,
    from: ' ${ROW_TOUCH}',
    to: '',
  },
  {
    label: 'the select popup loses max-h-(--available-height), so its line puts it 6 px from the screen edge, not 8',
    file: CLASSES,
    from: ' max-h-(--available-height)',
    to: '',
  },
  {
    label: 'the select list loses SCROLL_AREA, so sixty options do not scroll inside the list',
    file: CLASSES,
    from: ' ${LIST_CAP} ${SCROLL_AREA}',
    to: ' ${LIST_CAP}',
  },
  {
    label: 'the select popup takes the trigger width as its floor again, so beside a trigger on a phone it runs off the screen',
    file: CLASSES,
    from: 'min-w-[min(var(--anchor-width),round(down,var(--available-width),1px))]',
    to: 'min-w-(--anchor-width)',
  },
  {
    label: 'the select popup caps its width at the room unrounded, so a list placed on a whole pixel ends 0.2 px past the 8 px',
    file: CLASSES,
    from: 'max-w-[round(down,var(--available-width),1px)]',
    to: 'max-w-(--available-width)',
  },
  {
    label: 'the select list loses the name of its field, so a reader hears the options with no name',
    file: CLIENT,
    from: '              aria-label={select.listLabel}\n',
    to: '',
  },
  {
    label: 'the select list loses the aria-labelledby of its caller, so a heading names the trigger only',
    file: CLIENT,
    from: '              aria-labelledby={select.listLabelledBy}\n',
    to: '',
  },
  {
    label: 'the select reads a wrapping label whole, so the value it shows joins the name of the list',
    file: LIB,
    from: "  if (node === skip) return ''\n",
    to: '',
  },
  {
    label: 'the select reads its label only once, so a label changed later is not the name of the list',
    file: HOOK,
    from: '    if (next && !named) setSpoken(readNameFromLabels(trigger.current))\n',
    to: '',
  },
]
