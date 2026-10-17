import { Combobox } from '../index.js'

const WORD = 'Supercalifragilistic'.repeat(15)

const LONG = [
  { value: 'word', label: WORD },
  { value: 'sentence', label: 'A label long enough to run past the width of the input and end in an ellipsis' },
  { value: 'short', label: 'Short' },
]

/** One 300-character word chosen: the input scrolls its text, each row ends in an ellipsis, and nothing widens. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-3">
      <Combobox aria-label="Long, own width" items={LONG} defaultValue="word" />
      <Combobox aria-label="Long, full width" fullWidth items={LONG} defaultValue="sentence" />
    </div>
  )
}
