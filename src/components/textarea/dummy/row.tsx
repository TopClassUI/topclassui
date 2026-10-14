import { Textarea } from '../index.js'

/** Two in a flex row: each keeps an Input's width while there is room, and both give way on a phone. */
export default function Demo() {
  return (
    <div className="grid gap-4">
      <div data-row="plain" className="flex gap-2">
        <Textarea name="pros" placeholder="What went well" aria-label="What went well" />
        <Textarea name="cons" placeholder="What did not" aria-label="What did not" />
      </div>
      <div data-row="held" className="flex gap-2">
        <Textarea name="pros-held" autosize showCount placeholder="What went well" aria-label="What went well, counted" />
        <Textarea name="cons-held" autosize showCount placeholder="What did not" aria-label="What did not, counted" />
      </div>
    </div>
  )
}
