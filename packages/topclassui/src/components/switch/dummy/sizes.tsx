import { Switch } from '../index.js'

/** The five sizes, on. Each target stays 24 px, and 44 px under a finger, whatever the track. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Switch size="xs" defaultChecked aria-label="Extra small" />
      <Switch size="sm" defaultChecked aria-label="Small" />
      <Switch size="md" defaultChecked aria-label="Medium" />
      <Switch size="lg" defaultChecked aria-label="Large" />
      <Switch size="xl" defaultChecked aria-label="Extra large" />
    </div>
  )
}
