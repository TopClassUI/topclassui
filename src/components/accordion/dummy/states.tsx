import { AccordionItem, AccordionRoot } from '../index.js'

/** The states a server can render: a whole accordion disabled, then an open item, a disabled one
 * and a closed one. The open one is named by defaultValue, which is plain data. */
export default function Demo() {
  return (
    <div className="grid gap-6">
      <AccordionRoot disabled className="max-w-105">
        <AccordionItem value="all" title="Every item disabled" headingLevel={2}>
          <p>The whole accordion is disabled.</p>
        </AccordionItem>
      </AccordionRoot>
      <AccordionRoot defaultValue={['open']} className="max-w-105">
        <AccordionItem value="open" title="Open" headingLevel={2}>
          <p>The panel of an open item is shown under its trigger.</p>
        </AccordionItem>
        <AccordionItem value="disabled" title="Disabled" headingLevel={2} disabled>
          <p>A disabled item cannot be opened.</p>
        </AccordionItem>
        <AccordionItem value="closed" title="Closed" headingLevel={2}>
          <p>A closed panel stays in the HTML, hidden until it is found.</p>
        </AccordionItem>
      </AccordionRoot>
    </div>
  )
}
