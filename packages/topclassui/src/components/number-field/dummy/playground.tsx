import { NumberField } from '../index.js'
import type { NumberFieldDesignProps } from '../types.js'

/** The site's Try it stage: each schema prop arrives from a control, and an absent one keeps its default. */
export default function Demo(props: NumberFieldDesignProps) {
  return (
    <div className="grid justify-items-start gap-2">
      <label htmlFor="number-field-playground-guests" className="text-sm text-body">Guests</label>
      <NumberField id="number-field-playground-guests" defaultValue={2} {...props} />
    </div>
  )
}
