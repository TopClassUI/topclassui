import { AccordionItem, AccordionRoot, AccordionSkeleton } from '../index.js'

/** Each closed accordion above the skeleton that holds its place, in a wrapper each: the same box. */
export default function Demo() {
  return (
    <div className="grid max-w-105 gap-6">
      <div data-pair="one" className="grid gap-2">
        <AccordionRoot>
          <AccordionItem value="plan" title="Plan" headingLevel={2}><p>The plan you pay for.</p></AccordionItem>
        </AccordionRoot>
        <AccordionSkeleton items={1} />
      </div>
      <div data-pair="three" className="grid gap-2">
        <AccordionRoot>
          <AccordionItem value="plan" title="Plan" headingLevel={2}><p>The plan you pay for.</p></AccordionItem>
          <AccordionItem value="seats" title="Seats" headingLevel={2}><p>Who can sign in.</p></AccordionItem>
          <AccordionItem value="invoices" title="Invoices" headingLevel={2}><p>What you were billed.</p></AccordionItem>
        </AccordionRoot>
        <AccordionSkeleton />
      </div>
    </div>
  )
}
