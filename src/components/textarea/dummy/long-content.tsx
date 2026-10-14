import { Textarea } from '../index.js'

const WORD = 'Supercalifragilistic'.repeat(15)
const LINES = Array.from({ length: 60 }, (_, line) => `Line ${String(line + 1)}`).join('\n')

/** Hostile text: one word of 300 characters wraps inside the box, and sixty lines scroll inside it. */
export default function Demo() {
  return (
    <div className="grid max-w-sm gap-3">
      <Textarea fullWidth defaultValue={WORD} aria-label="One long word" />
      <Textarea defaultValue={WORD} aria-label="One long word, own width" />
      <Textarea fullWidth autosize defaultValue={LINES} aria-label="Sixty lines" />
    </div>
  )
}
