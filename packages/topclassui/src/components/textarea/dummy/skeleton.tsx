import { Textarea, TextareaSkeleton } from '../index.js'

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const

/** Each field above the skeleton that holds its place, in a wrapper each: the same box. */
export default function Demo() {
  return (
    <div className="grid gap-4">
      {SIZES.map((size) => (
        <div key={size} data-pair={size} className="grid gap-2">
          <div><Textarea size={size} placeholder="Message" aria-label={`Message, ${size}`} /></div>
          <div><TextareaSkeleton size={size} /></div>
        </div>
      ))}
      <div data-pair="one-row" className="grid gap-2">
        <div><Textarea size="xs" rows={1} placeholder="One row" aria-label="One row" /></div>
        <div><TextareaSkeleton size="xs" rows={1} /></div>
      </div>
      <div data-pair="full" className="grid gap-2">
        <div><Textarea fullWidth rows={5} placeholder="Fills its container" aria-label="Full width" /></div>
        <div><TextareaSkeleton fullWidth rows={5} /></div>
      </div>
    </div>
  )
}
