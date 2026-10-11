import { Button } from '#components/button/index.js'
import { PopoverDescription, PopoverPopup, PopoverRoot, PopoverTitle, PopoverTrigger } from '../index.js'

const LINES = Array.from({ length: 60 }, (_, index) => index + 1)

/** Sixty lines, taller than any screen. The popup shrinks to the room beside its trigger and
 * scrolls inside itself (R-10.5-1). While it scrolls it is a tab stop, so the keyboard reaches
 * the last line of a text that holds no control. */
export default function Demo() {
  return (
    <PopoverRoot>
      <PopoverTrigger render={<Button variant="outline">Change log</Button>} />
      <PopoverPopup>
        <PopoverTitle>Change log</PopoverTitle>
        <PopoverDescription>Sixty changes. Scroll to read them all.</PopoverDescription>
        <ol className="grid gap-1">
          {LINES.map((line) => <li key={line}>Change {line}: a fix that shipped this week.</li>)}
        </ol>
      </PopoverPopup>
    </PopoverRoot>
  )
}
