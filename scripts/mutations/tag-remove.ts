// The mutations of the removable half of src/components/tag. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

const INDEX = 'src/components/tag/index.tsx'
const CLIENT = 'src/components/tag/client.tsx'
const CLASSES = 'src/components/tag/classes.ts'
const HOOK = 'src/components/tag/hook.ts'

export const MUTATIONS: Mutation[] = [
  {
    label: 'the tag remove button loses aria-labelledby, so it reads "Remove" and not which tag',
    file: CLIENT,
    from: '      aria-labelledby={`${id} ${labelId}`}\n',
    to: '',
  },
  {
    label: 'the tag remove button stops calling onRemove',
    file: CLIENT,
    from: 'onClick={() => { onRemove() }}',
    to: 'onClick={() => undefined}',
  },
  {
    label: 'the tag remove button loses type="button", so inside a form it submits the form',
    file: CLIENT,
    from: '      type="button"\n',
    to: '',
  },
  {
    label: 'the tag remove label takes the id of the button, so the button names itself and no tag',
    file: INDEX,
    from: '  const labelId = useId()',
    to: '  const labelId = id',
  },
  {
    label: 'the tag remove path is taken by a plain tag too, so a tag with no onRemove renders a client button',
    file: INDEX,
    from: '  if (onRemove) {',
    to: '  if (onRemove ?? children !== undefined) {',
  },
  {
    label: 'the tag remove label loses its bound, so a pasted file reaches the DOM',
    file: INDEX,
    from: 'className={TAG_LABEL}>{truncateLabel(children, TAG_BOUNDARIES.labelMaxLength)}</span>',
    to: 'className={TAG_LABEL}>{children}</span>',
  },
  {
    label: 'the tag remove chip keeps its end padding, so the x sits a full padding from the edge',
    file: INDEX,
    from: 'REMOVABLE, REMOVABLE_END[size], className',
    to: 'REMOVABLE, className',
  },
  {
    label: 'the tag remove chip keeps the clip, so the ring of the x is cut at xs and sm',
    file: CLASSES,
    from: " overflow-visible'",
    to: "'",
  },
  {
    label: 'the tag remove chip loses its label column that starts at 0, so a long label widens a flex column and a table',
    file: CLASSES,
    from: "'inline-grid grid-cols-[minmax(0,auto)_auto] overflow-visible'",
    to: "'overflow-visible'",
  },
  {
    label: 'the tag remove label loses LABEL, so an element label is no longer clipped by it',
    file: CLASSES,
    from: 'TAG_LABEL = `${LABEL} flex',
    to: 'TAG_LABEL = `flex',
  },
  {
    label: 'the tag remove button loses the forced-colours hover, so a hover is invisible there',
    file: CLASSES,
    from: '`${ICON_BUTTON} ${HOVER.soft} ${REMOVE_FORCED}`',
    to: '`${ICON_BUTTON} ${HOVER.soft}`',
  },
  {
    label: 'the tag remove button loses the tone class, so its hover takes the primary tint on any tag',
    file: CLIENT,
    from: 'cn(TAG_REMOVE, TONE_CLASS[tone], REMOVE_SIZE[size])',
    to: 'cn(TAG_REMOVE, REMOVE_SIZE[size])',
  },
  {
    label: 'the tag remove button loses its reach over the padding, so an xs tag grows to 30 and md to 38',
    file: CLIENT,
    from: 'cn(TAG_REMOVE, TONE_CLASS[tone], REMOVE_SIZE[size])',
    to: 'cn(TAG_REMOVE, TONE_CLASS[tone])',
  },
  {
    label: 'the tag remove button is named in English whatever the provider says',
    file: HOOK,
    from: 'return { label: useLabels().tag.remove }',
    to: "return { label: useLabels() === undefined ? '' : 'Remove' }",
  },
]
