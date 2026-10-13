import { AccordionItem, AccordionRoot } from '../index.js'

/** multiple: opening one item leaves the others as they are. Two start open. */
export default function Demo() {
  return (
    <AccordionRoot multiple defaultValue={['plan', 'seats']} className="max-w-105">
      <AccordionItem value="plan" title="Plan" headingLevel={2}>
        <p>Team, billed every month.</p>
      </AccordionItem>
      <AccordionItem value="seats" title="Seats" headingLevel={2}>
        <p>Twelve of twenty are in use.</p>
      </AccordionItem>
      <AccordionItem value="invoices" title="Invoices" headingLevel={2}>
        <p>The last one was paid on 2 March.</p>
      </AccordionItem>
    </AccordionRoot>
  )
}
