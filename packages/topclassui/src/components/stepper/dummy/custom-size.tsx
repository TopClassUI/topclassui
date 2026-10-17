import { Stepper } from '../index.js'

const STEPS = [
  { id: 'upload', title: 'Upload' },
  { id: 'check', title: 'Check', status: 'error' },
  { id: 'publish', title: 'Publish' },
  { id: 'share', title: 'Share' },
] as const

/** custom sets no circle size: the circle reads --tc-stepper-mark, 32 px unless the caller sets it. */
export default function Demo() {
  return (
    <div className="grid gap-8">
      <Stepper size="custom" items={STEPS} value="publish" aria-label="The default circle" />
      <Stepper size="custom" items={STEPS} value="publish" className="text-lg" style={{ '--tc-stepper-mark': '3.5rem' }} aria-label="Your own circle" />
    </div>
  )
}
