import { Checkbox } from '../index.js'

/** The five sizes, checked. Each target stays 24 px, and 44 px under a finger, whatever the box. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Checkbox size="xs" defaultChecked aria-label="Extra small" />
      <Checkbox size="sm" defaultChecked aria-label="Small" />
      <Checkbox size="md" defaultChecked aria-label="Medium" />
      <Checkbox size="lg" defaultChecked aria-label="Large" />
      <Checkbox size="xl" defaultChecked aria-label="Extra large" />
    </div>
  )
}
