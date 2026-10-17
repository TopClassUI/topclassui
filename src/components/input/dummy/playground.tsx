import { Input } from '../index.js'
import type { InputDesignProps } from '../types.js'

/** The site's Try it stage: each schema prop arrives from a control, and an absent one keeps its default. */
export default function Demo(props: InputDesignProps) {
  return (
    <div className="grid max-w-sm gap-1">
      <label htmlFor="input-playground" className="text-sm font-medium text-body">Email</label>
      <Input id="input-playground" name="email" type="email" autoComplete="email" {...props} />
    </div>
  )
}
