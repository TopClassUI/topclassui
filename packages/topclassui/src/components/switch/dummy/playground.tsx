import { Switch } from '../index.js'
import type { SwitchDesignProps } from '../types.js'

/** The site's Try it stage: each schema prop arrives from a control, and an absent one keeps its default. */
export default function Demo(props: SwitchDesignProps) {
  return (
    <div className="flex items-center gap-2">
      <Switch id="switch-playground" defaultChecked {...props} />
      <label htmlFor="switch-playground" className="text-sm text-body">Weekly digest</label>
    </div>
  )
}
