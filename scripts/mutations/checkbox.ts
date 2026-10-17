// The mutations of src/components/checkbox. Found by scripts/mutations/index.ts; every label says "checkbox".
import type { Mutation } from '../lib/mutate.js'

const CLIENT = 'src/components/checkbox/client.tsx'
const HOOK = 'src/components/checkbox/hook.ts'
const CLASSES = 'src/components/checkbox/classes.ts'
const SKELETON = 'src/components/checkbox/skeleton.tsx'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the checkbox mark ignores indeterminate, so a parent box draws a tick',
    file: CLIENT,
    from: '<Svg icon={indeterminate ? minus : check} size="80%" />',
    to: '<Svg icon={check} size="80%" />',
  },
  {
    label: 'the checkbox stops handing Base UI indeterminate, so a mixed box says false and draws nothing',
    file: CLIENT,
    from: '      indeterminate={indeterminate}\n',
    to: '',
  },
  {
    label: 'the checkbox hands Base UI defaultChecked again, so a form reset leaves it as it was while the form sends the default',
    file: CLIENT,
    from: '      checked={value.checked}\n      onCheckedChange={value.onCheckedChange}\n',
    to: '      defaultChecked={defaultChecked}\n      onCheckedChange={onCheckedChange}\n',
  },
  {
    label: 'the checkbox root is Base UI span again, so a label htmlFor names nothing in the server HTML',
    file: CLIENT,
    from: '      nativeButton\n      render={<button />}\n',
    to: '',
  },
  {
    label: 'the checkbox ignores details.cancel(), so a handler that cancels still flips it',
    file: HOOK,
    from: '    if (!details.isCanceled) state.setValue(next)',
    to: '    state.setValue(next)',
  },
  {
    label: 'the checkbox never calls the caller handler, so onCheckedChange hears nothing',
    file: HOOK,
    from: '    onCheckedChange?.(next, details)\n',
    to: '',
  },
  {
    label: 'the checkbox drops the caller inputRef, which then never holds the hidden input',
    file: HOOK,
    from: '  useImperativeHandle(inputRef, () => state.inputRef.current as HTMLInputElement, [state.inputRef])\n',
    to: '  void inputRef\n',
  },
  {
    label: 'the checkbox stops writing its hidden checkbox after a reset, so a controlled one sends the first default',
    file: HOOK,
    from: 'defaultValue: defaultChecked, sync })',
    to: 'defaultValue: defaultChecked })',
  },
  {
    label: 'the checkbox drops invalid, so aria-invalid and the danger line never appear',
    file: CLIENT,
    from: 'aria-invalid={invalid ? true : ariaInvalid}',
    to: 'aria-invalid={ariaInvalid}',
  },
  {
    label: 'the checkbox box loses its size, so every size draws the same box',
    file: CLIENT,
    from: 'cn(CHECKBOX_BOX, CHECKBOX_SIZE[size])',
    to: 'cn(CHECKBOX_BOX)',
  },
  {
    label: 'the checkbox mark fills the whole box, so the tick touches the line instead of the drawn 72 percent',
    file: CLIENT,
    from: 'size="80%"',
    to: 'size="100%"',
  },
  {
    label: 'the checkbox puts the caller className first, so its own target width wins a conflict',
    file: CLIENT,
    from: 'cn(CHECKBOX_ROOT, className)',
    to: 'cn(className, CHECKBOX_ROOT)',
  },
  {
    label: 'the checkbox indeterminate box loses its fill, so a mixed box is told by a dash alone',
    file: CLASSES,
    from: "export const CHECKBOX_MIXED = 'group-data-indeterminate/toggle:border-primary-solid group-data-indeterminate/toggle:bg-primary-solid ",
    to: "export const CHECKBOX_MIXED = 'group-data-indeterminate/toggle:border-primary-solid ",
  },
  {
    label: 'the checkbox indeterminate box loses its forced-colours Highlight, so under forced colours it is erased to Canvas',
    file: CLASSES,
    from: ' forced-colors:group-data-indeterminate/toggle:bg-[Highlight]',
    to: '',
  },
  {
    label: 'the checkbox invalid mixed box loses its danger line, so the fill hides that it is wrong',
    file: CLASSES,
    from: ' group-aria-invalid/toggle:group-data-indeterminate/toggle:border-danger-solid ',
    to: ' ',
  },
  {
    label: 'the checkbox box is round, so it looks like a radio in every mode',
    file: CLASSES,
    from: 'export const CHECKBOX_BOX = `rounded-chip ',
    to: 'export const CHECKBOX_BOX = `rounded-full ',
  },
  {
    label: 'the checkbox mark is no longer centred, so the tick sits at the inline start of the box',
    file: CLASSES,
    from: "export const CHECKBOX_MARK = 'flex size-full items-center justify-center'",
    to: "export const CHECKBOX_MARK = 'flex size-full items-center'",
  },
  {
    label: 'the checkbox paints a disabled mixed box Highlight under forced colours, told from an enabled one by opacity alone',
    file: CLASSES,
    from: ' forced-colors:group-disabled/toggle:group-data-indeterminate/toggle:border-[GrayText] forced-colors:group-disabled/toggle:group-data-indeterminate/toggle:bg-[GrayText]',
    to: '',
  },
  {
    label: 'the checkbox hands Base UI its value while mixed, so a pressed mixed box sends name=on behind the dash',
    file: HOOK,
    from: '    checked: indeterminate ? false : state.value,',
    to: '    checked: state.value,',
  },
  {
    label: 'the checkbox keeps uncheckedValue while mixed, so a mixed box sends its unchecked string',
    file: HOOK,
    from: '    uncheckedValue: indeterminate ? undefined : uncheckedValue,',
    to: '    uncheckedValue,',
  },
  {
    label: 'the checkbox reset writes the default into the hidden input of a mixed box, so after a reset it sends name=on',
    file: HOOK,
    from: 'syncChecked(value && !indeterminate, input)',
    to: 'syncChecked(value, input)',
  },
  {
    label: 'the checkbox skeleton draws an md box at every size, so an xl checkbox jumps when it arrives',
    file: SKELETON,
    from: 'CHECKBOX_SIZE[size]',
    to: 'CHECKBOX_SIZE.md',
  },
  {
    label: 'the checkbox skeleton loses the target floor, so under a finger it is 20 px shorter than its checkbox',
    file: CLASSES,
    from: 'items-center justify-center ${TOUCH_TARGET}`',
    to: 'items-center justify-center`',
  },
  {
    label: 'the checkbox skeleton is round, so it stands in for a radio rather than a checkbox',
    file: CLASSES,
    from: 'block rounded-chip bg-neutral-soft',
    to: 'block rounded-full bg-neutral-soft',
  },
  {
    label: 'the checkbox skeleton takes aria-hidden from the caller, so a placeholder can be read out',
    file: SKELETON,
    from: '{...rest} aria-hidden>',
    to: 'aria-hidden {...rest}>',
  },
]
