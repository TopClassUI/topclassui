import { check } from '#icons/data/check.js'
import { LABEL, OVERLAY_SURFACE, ROW, ROW_SELECTED } from '#shared/classes.js'
import { Svg } from '#components/svg/index.js'
import { Select } from '../index.js'
import type { SelectDesignProps } from '../types.js'

// The open list's look at rest, from the shared classes the popup is built on: a demo the site shows imports public paths only.
const popup = `flex flex-col ${OVERLAY_SURFACE}`
const list = 'flex flex-col gap-0.5 p-1.5'
const item = `${ROW} ${ROW_SELECTED}`
const text = `${LABEL} flex-1`
const tick = 'ms-auto flex shrink-0'

const COUNTRIES = [
  { value: 'jo', label: 'Jordan' },
  { value: 'eg', label: 'Egypt' },
  { value: 'ma', label: 'Morocco' },
  { value: 'sa', label: 'Saudi Arabia' },
]

/** The frame's stage: the live trigger, closed, over a picture of its open list drawn from the popup's shared classes.
 * The picture is hidden from a reader and inert, so the page keeps its focus order and nothing is marked aria-hidden. */
function Stage(props: SelectDesignProps) {
  return (
    <div data-stage="" className="grid w-fit gap-1.5">
      <Select aria-label="Country" items={COUNTRIES.slice(0, 3)} defaultValue="jo" fullWidth {...props} />
      <div aria-hidden inert className={popup}>
        <div className={list}>
          {COUNTRIES.slice(0, 3).map(({ value, label }) => (
            <div key={value} data-selected={value === 'jo' ? '' : undefined} className={item}>
              <span className={text}>{label}</span>
              {value === 'jo' ? <span className={tick}><Svg icon={check} size="0.875rem" /></span> : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** The site's Try it stage: each schema prop arrives from a control, and an absent one keeps its default.
 * With stage it is the Stage above; the tree below stays one return, so the docs can write Try it values into it. */
export default function Demo({ stage = false, ...props }: SelectDesignProps & { stage?: boolean } = {}) {
  if (stage) return <Stage {...props} />
  return (
    <div className="grid justify-items-start gap-1.5">
      <label htmlFor="select-playground" className="text-sm text-body">Country</label>
      <Select id="select-playground" items={COUNTRIES} defaultValue="jo" {...props} />
    </div>
  )
}
