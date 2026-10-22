import { check } from '#icons/data/check.js'
import { Svg } from '#components/svg/index.js'
import { COMBOBOX_ITEM, COMBOBOX_ITEM_TEXT, COMBOBOX_ITEM_TICK, COMBOBOX_LIST, COMBOBOX_POPUP } from '../classes.js'
import { Combobox } from '../index.js'
import type { ComboboxDesignProps } from '../types.js'

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

/** The frame's stage: the live input, closed, with "jor" typed, over a picture of its open list drawn with the popup's
 * own classes. The picture is hidden from a reader and inert, so the page keeps its focus order and nothing is marked aria-hidden. */
function Stage(props: ComboboxDesignProps) {
  return (
    <div data-stage="" className="grid w-fit gap-1.5">
      <Combobox aria-label="Country" items={PLACES} defaultValue="jo" defaultInputValue="jor" fullWidth {...props} />
      <div aria-hidden inert className={COMBOBOX_POPUP}>
        <div className={COMBOBOX_LIST}>
          {PLACES.map(({ value, label }) => (
            <div key={value} data-selected={value === 'jo' ? '' : undefined} className={COMBOBOX_ITEM}>
              <span className={COMBOBOX_ITEM_TEXT}>{label}</span>
              {value === 'jo' ? <span className={COMBOBOX_ITEM_TICK}><Svg icon={check} size="0.875rem" /></span> : null}
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
