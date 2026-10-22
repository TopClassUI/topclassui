import { check } from '#icons/data/check.js'
import { LABEL, OVERLAY_SURFACE, ROW, ROW_SELECTED } from '#shared/classes.js'
import { Svg } from '#components/svg/index.js'
import { Combobox } from '../index.js'
import type { ComboboxDesignProps } from '../types.js'

// The open list's look at rest, from the shared classes the popup is built on: a demo the site shows imports public paths only.
const popup = `flex flex-col ${OVERLAY_SURFACE}`
const list = 'flex flex-col gap-0.5 p-1.5'
const item = `${ROW} ${ROW_SELECTED}`
const text = `${LABEL} flex-1`
const tick = 'ms-auto flex shrink-0'

const FRAMEWORKS = [
  { value: 'next', label: 'Next.js' },
  { value: 'astro', label: 'Astro' },
  { value: 'remix', label: 'Remix' },
  { value: 'sveltekit', label: 'SvelteKit' },
  { value: 'nuxt', label: 'Nuxt' },
  { value: 'gatsby', label: 'Gatsby' },
  { value: 'vite', label: 'Vite' },
  { value: 'qwik', label: 'Qwik City' },
  { value: 'solid', label: 'SolidStart' },
  { value: 'angular', label: 'Angular' },
]

const PLACES = [{ value: 'jo', label: 'Jordan' }, { value: 'jv', label: 'Jordan Valley' }]

/** The frame's stage: the live input, closed, with "jor" typed, over a picture of its open list drawn from the popup's
 * shared classes. The picture is hidden from a reader and inert, so the page keeps its focus order and nothing is marked aria-hidden. */
function Stage(props: ComboboxDesignProps) {
  return (
    <div data-stage="" className="grid w-56 max-w-full gap-1.5">
      <Combobox aria-label="Country" items={PLACES} defaultValue="jo" defaultInputValue="jor" fullWidth {...props} />
      <div aria-hidden inert className={popup}>
        <div className={list}>
          {PLACES.map(({ value, label }) => (
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
export default function Demo({ stage = false, ...props }: ComboboxDesignProps & { stage?: boolean } = {}) {
  if (stage) return <Stage {...props} />
  return (
    <div className="grid justify-items-start gap-1">
      <label htmlFor="combobox-playground" className="text-sm font-medium text-body">Framework</label>
      <Combobox id="combobox-playground" items={FRAMEWORKS} placeholder="Search frameworks" {...props} />
    </div>
  )
}
