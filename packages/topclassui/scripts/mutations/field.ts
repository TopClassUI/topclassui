// The mutations of src/components/field. Found by scripts/mutations/index.ts; every label starts with "field:", which no
// other row holds, so `pnpm test:mutation field:` runs these alone.
import type { Mutation } from '../lib/mutate.js'

const INDEX = 'src/components/field/index.tsx'
const HOOK = 'src/components/field/hook.ts'
const LIB = 'src/components/field/lib.ts'
const FRAME = 'src/components/field/parts/field-frame.tsx'
const CLASSES = 'src/components/field/classes.ts'
const FORM_DEMO = 'src/components/field/dummy/form.tsx'

export const MUTATIONS: Mutation[] = [
  {
    label: "field: describedByOf leaves the error's id out of aria-describedby, so the control never reads its error",
    file: LIB,
    from: "[hint ? ids.hint : '', error ? ids.error : '']",
    to: "[hint ? ids.hint : '', '']",
  },
  {
    label: 'field: the description reads the error before the hint',
    file: LIB,
    from: "[hint ? ids.hint : '', error ? ids.error : '']",
    to: "[error ? ids.error : '', hint ? ids.hint : '']",
  },
  {
    label: 'field: the ids are built from the name again, so two Fields of one name write one id twice',
    file: INDEX,
    from: 'ids={toFieldIds(id ?? generated)}',
    to: 'ids={toFieldIds(id ?? name)}',
  },
  {
    label: "field: the label loses its for, so a click on it no longer focuses or toggles the control",
    file: FRAME,
    from: '<label id={ids.label} htmlFor={ids.control}',
    to: '<label id={ids.label}',
  },
  {
    label: 'field: the control object loses aria-labelledby, so a RadioGroup, a SegmentedControl and a Slider have no name',
    file: FRAME,
    from: "    'aria-labelledby': ids.label,\n",
    to: '',
  },
  {
    label: 'field: an error no longer makes the control invalid by default',
    file: INDEX,
    from: 'invalid={invalid ?? messages.length > 0}',
    to: 'invalid={invalid ?? false}',
  },
  {
    label: 'field: empty messages are kept, so error="" draws an empty error and marks the control invalid',
    file: LIB,
    from: "return all.filter((message) => typeof message === 'string' && message.trim() !== '')",
    to: 'return [...all]',
  },
  {
    label: 'field: the asterisk is no longer hidden, so a screen reader reads "star" after every required label',
    file: FRAME,
    from: '<span aria-hidden="true" className={FIELD_REQUIRED}>',
    to: '<span className={FIELD_REQUIRED}>',
  },
  {
    label: "field: FieldLive's error no longer goes after a change of the field's value",
    file: HOOK,
    from: '    if (before === null || sameEntries(before, entriesOf(rootRef.current, name))) return false\n    setAnswered(errors)\n',
    to: '    if (before === null || sameEntries(before, entriesOf(rootRef.current, name))) return false\n',
  },
  {
    label: "field: FieldLive's error goes after any click, one that changes nothing included",
    file: HOOK,
    from: 'if (before === null || sameEntries(before, entriesOf(rootRef.current, name))) return false',
    to: 'if (before === null) return false',
  },
  {
    label: 'field: a change tells no other FieldLive of the form, so a second box of the same name stays invalid after the answer',
    file: HOOK,
    from: 'if (answer() && root) formOf(root)?.dispatchEvent(new Event(FIELD_CHANGE_EVENT))',
    to: 'if (answer() && root) void formOf(root)',
  },
  {
    label: "field: a FieldLive told of a change drops its error without reading its own entries, so a field of another name clears too",
    file: HOOK,
    from: 'const recheck = () => { answer() }',
    to: 'const recheck = () => { setAnswered(errors) }',
  },
  {
    label: "field: FieldLive keys the answered error on nothing, so the action's next answer does not bring it back",
    file: HOOK,
    from: 'const fromForm = own || answered === errors ? undefined : errors?.[name]',
    to: 'const fromForm = own || answered !== undefined ? undefined : errors?.[name]',
  },
  {
    label: "field: FieldLive drops the caller's own click listener for its own",
    file: HOOK,
    from: 'onClick: (event: FieldClickEvent) => { onClick?.(event); check() },',
    to: 'onClick: () => { check() },',
  },
  {
    label: 'field: the root loses min-w-0, so a long label widens the grid track it sits in',
    file: CLASSES,
    from: "export const FIELD_ROOT = 'grid min-w-0 content-start'",
    to: "export const FIELD_ROOT = 'grid content-start'",
  },
  {
    label: 'field: an inline label is no longer placed beside the control, so it drops under the box',
    file: CLASSES,
    from: "export const FIELD_LABEL_INLINE = 'col-start-2 row-start-1 font-normal'",
    to: "export const FIELD_LABEL_INLINE = 'font-normal'",
  },
  {
    label: 'field: the button row of field--form no longer wraps, so at a 32 px root it widens every field past a 320 px screen',
    file: FORM_DEMO,
    from: '<div className="flex flex-wrap gap-2">',
    to: '<div className="flex gap-2">',
  },
]
