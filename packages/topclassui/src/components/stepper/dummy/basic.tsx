import { Stepper } from '../index.js'

const STEPS = [
  { id: 'account', title: 'Account' },
  { id: 'profile', title: 'Profile' },
  { id: 'team', title: 'Team' },
  { id: 'done', title: 'Done' },
]

/** Four steps, the second one current, as drawn: a tick, a number with a fill, two with a line. */
export default function Demo() {
  return <Stepper items={STEPS} value="profile" aria-label="Sign-up" />
}
