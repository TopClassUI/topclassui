import { AccordionItem, AccordionRoot } from '../index.js'

/** The states a server can render, one accordion each as Figma 138:994 draws them: closed, open
 * and disabled, each asking the drawn Question. Each sits in a section named by its state. */
export default function Demo() {
  return (
    <div className="grid gap-6">
      <section aria-label="closed">
        <AccordionRoot className="max-w-105">
          <AccordionItem value="closed" title="Question" headingLevel={2}>
            <p>A closed panel stays in the HTML, hidden until it is found.</p>
          </AccordionItem>
        </AccordionRoot>
      </section>
      <section aria-label="open">
        <AccordionRoot defaultValue={['open']} className="max-w-105">
          <AccordionItem value="open" title="Question" headingLevel={2}>
            <p>The panel of an open item is shown under its trigger.</p>
          </AccordionItem>
        </AccordionRoot>
      </section>
      <section aria-label="disabled">
        <AccordionRoot disabled className="max-w-105">
          <AccordionItem value="disabled" title="Question" headingLevel={2}>
            <p>A disabled accordion cannot be opened.</p>
          </AccordionItem>
        </AccordionRoot>
      </section>
    </div>
  )
}
