import { Select } from '../index.js'

const PLANS = [{ value: 'free', label: 'Free' }, { value: 'pro', label: 'Pro' }, { value: 'team', label: 'Team' }]

/** The states a server can render, one per child. Invalid points at its message, so its cell is named by a title; read-only looks like idle. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-3">
      <Select aria-label="Nothing chosen" items={PLANS} />
      <div title="Invalid" className="grid justify-items-start gap-1">
        <Select aria-label="Invalid" invalid aria-describedby="select-states-error" items={PLANS} defaultValue="free" />
        <span id="select-states-error" className="text-xs text-danger-on-soft">Pick a paid plan.</span>
      </div>
      <Select aria-label="Disabled" disabled items={PLANS} defaultValue="pro" />
      <Select aria-label="Read-only" readOnly items={PLANS} defaultValue="team" />
    </div>
  )
}
