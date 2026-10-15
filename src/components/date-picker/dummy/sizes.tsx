import { DatePicker } from '../index.js'

const SIZES = [
  { size: 'xs', label: 'Extra small' },
  { size: 'sm', label: 'Small' },
  { size: 'md', label: 'Medium' },
  { size: 'lg', label: 'Large' },
  { size: 'xl', label: 'Extra large' },
] as const

/** The five sizes of the trigger: the height, the padding and the type step change, and the width follows the type step. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-3">
      {SIZES.map(({ size, label }) => (
        <DatePicker key={size} aria-label={label} size={size} defaultValue="2026-09-22" />
      ))}
    </div>
  )
}
