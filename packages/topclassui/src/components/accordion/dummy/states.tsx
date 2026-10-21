import { AccordionItem, AccordionRoot } from '../index.js'

/** The ring the frame draws round a focused question, drawn at rest on the box; not under forced colours, where a ring at rest would read as focus. */
const RING = 'not-forced-colors:outline-solid not-forced-colors:outline-(length:--tc-ring-width) not-forced-colors:outline-offset-(length:--tc-ring-offset) not-forced-colors:outline-ring'

/** One accordion per state Figma 138:994 draws, in its order: closed, open, hover (drawn as closed, as the frame draws it),
 * focus-visible and disabled, each asking a question with a name of its own, so two open panels never share a region name. Each sits in a section named by its state. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-start gap-6">
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
      <section aria-label="hover">
        <AccordionRoot className="max-w-105">
          <AccordionItem value="hover" title="Hovered question" headingLevel={2}>
            <p>Under the pointer the question looks as it does at rest.</p>
          </AccordionItem>
        </AccordionRoot>
      </section>
      <section aria-label="focus-visible">
        <AccordionRoot className={`max-w-105 ${RING}`}>
          <AccordionItem value="focus" title="Focused question" headingLevel={2}>
            <p>A focused question wears the ring.</p>
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
