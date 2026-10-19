import { Stepper } from '../index.js'

/** Every state the strip draws, one cell each, captioned by its name: a single circle in each status, and a disabled one. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-start gap-6">
      <Stepper aria-label="todo" items={[{ id: 'team', title: 'Team', status: 'todo' }]} />
      <Stepper aria-label="current" items={[{ id: 'profile', title: 'Profile', status: 'current' }]} />
      <Stepper aria-label="done" items={[{ id: 'account', title: 'Account', status: 'done' }]} />
      <Stepper aria-label="error" items={[{ id: 'payment', title: 'Payment', status: 'error' }]} />
      <Stepper aria-label="disabled" items={[{ id: 'review', title: 'Review', status: 'todo', disabled: true }]} />
    </div>
  )
}
