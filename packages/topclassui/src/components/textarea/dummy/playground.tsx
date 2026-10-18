import { Textarea } from '../index.js'
import type { TextareaDesignProps } from '../types.js'

/** The site's Try it stage: each schema prop arrives from a control, and an absent one keeps its default. */
export default function Demo(props: TextareaDesignProps) {
  return (
    <div className="grid max-w-sm gap-1">
      <label htmlFor="textarea-playground" className="text-sm font-medium text-body">About you</label>
      <Textarea id="textarea-playground" name="bio" placeholder="Write a short paragraph" {...props} />
    </div>
  )
}
