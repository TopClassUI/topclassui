import { CardBody, CardHeader, CardRoot } from '../index.js'

/** The ring an interactive card wears on focus-visible, drawn at rest so the strip can show it. */
const RING = 'outline-solid outline-(length:--tc-ring-width) outline-offset-(length:--tc-ring-offset) outline-ring'

function Sample({ className }: { className?: string }) {
  return (
    <CardRoot render={<a href="/reports/may" />} className={className}>
      <CardHeader>
        <h2>Monthly report</h2>
      </CardHeader>
      <CardBody>Revenue rose 12% against April.</CardBody>
    </CardRoot>
  )
}

/** One cell per state of a card rendered as a link, named by its aria-label, as Previewer: Card draws them. */
export default function Demo() {
  return (
    <div className="grid max-w-xs gap-6">
      <div role="group" aria-label="idle"><Sample /></div>
      <div role="group" aria-label="hover"><Sample className="bg-surface" /></div>
      <div role="group" aria-label="focus-visible"><Sample className={RING} /></div>
    </div>
  )
}
