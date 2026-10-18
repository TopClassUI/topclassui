import { Checkbox } from '../index.js'
import type { CheckboxDesignProps } from '../types.js'

/** The site's Try it stage: each schema prop arrives from a control, and an absent one keeps its default. */
export default function Demo(props: CheckboxDesignProps) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id="checkbox-playground" defaultChecked {...props} />
      <label htmlFor="checkbox-playground" className="text-sm text-body">I accept the terms</label>
    </div>
  )
}
