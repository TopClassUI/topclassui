import { Stepper } from '../index.js'

/** Every state the frame draws, one bare marker each, captioned by its name: todo, current, done, error and disabled.
 * The step's title is still its name for a screen reader, but not drawn, as the frame draws the marker alone; w-auto
 * lets each one hug its marker, so it sits in the middle of its cell. */
export default function Demo() {
  const title = (text: string) => <span className="sr-only">{text}</span>
  return (
    <div className="flex flex-wrap items-start gap-6">
      <Stepper aria-label="todo" className="w-auto *:gap-0" items={[{ id: 'team', title: title('Team'), status: 'todo' }]} />
      <Stepper aria-label="current" className="w-auto *:gap-0" items={[{ id: 'profile', title: title('Profile'), status: 'current' }]} />
      <Stepper aria-label="done" className="w-auto *:gap-0" items={[{ id: 'account', title: title('Account'), status: 'done' }]} />
      <Stepper aria-label="error" className="w-auto *:gap-0" items={[{ id: 'payment', title: title('Payment'), status: 'error' }]} />
      <Stepper aria-label="disabled" className="w-auto *:gap-0" items={[{ id: 'review', title: title('Review'), status: 'todo', disabled: true }]} />
    </div>
  )
}
