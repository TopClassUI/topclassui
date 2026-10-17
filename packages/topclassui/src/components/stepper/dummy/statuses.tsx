import { Stepper } from '../index.js'

const STEPS = [
  { id: 'upload', title: 'Upload' },
  { id: 'check', title: 'Check', status: 'error' },
  { id: 'publish', title: 'Publish' },
  { id: 'share', title: 'Share' },
] as const

/** All four statuses: a step's own status wins over the one worked out from value. */
export default function Demo() {
  return <Stepper items={STEPS} value="publish" aria-label="Publishing" />
}
