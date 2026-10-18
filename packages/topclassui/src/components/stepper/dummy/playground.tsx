import { Stepper, type StepperDesignProps } from '../index.js'

const STEPS = [
  { id: 'account', title: 'Account' },
  { id: 'profile', title: 'Profile' },
  { id: 'team', title: 'Team' },
  { id: 'done', title: 'Done' },
]

/** The docs card's stage: the Try it controls pass the schema's props, the steps stay as drawn. */
export default function Demo(props: StepperDesignProps) {
  return <Stepper {...props} items={STEPS} value="profile" aria-label="Sign-up" />
}
