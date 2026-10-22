import { AccordionItem, AccordionRoot } from '../index.js'

/** The ring a focused trigger wears, drawn at rest outside the one-item box, as the frame draws it and the strip does not clip;
 * not under forced colours, where a ring at rest would read as focus. */
const RING = 'not-forced-colors:outline-solid not-forced-colors:outline-(length:--tc-ring-width) not-forced-colors:outline-offset-(length:--tc-ring-offset) not-forced-colors:outline-ring'

/** The five states Figma 138:994 draws, one accordion each asking the drawn Question, in a section named by its state.
 * The open one has a title of its own, so its region and the one a reader opens next are not two landmarks of one name.
 * Hover is drawn as the frame draws it, the box on the darker surface. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-6">
      <section aria-label="closed">
        <AccordionRoot>
          <AccordionItem value="closed" title="Question" headingLevel={2}>
            <p>A closed panel stays in the HTML, hidden until it is found.</p>
          </AccordionItem>
        </AccordionRoot>
      </section>
      <section aria-label="open">
        <AccordionRoot defaultValue={['open']}>
          <AccordionItem value="open" title="Open question" headingLevel={2}>
            <p className="text-xs">Answer.</p>
          </AccordionItem>
        </AccordionRoot>
      </section>
      <section aria-label="hover">
        <AccordionRoot className="bg-surface">
          <AccordionItem value="hover" title="Question" headingLevel={2}>
            <p>A closed panel stays in the HTML, hidden until it is found.</p>
          </AccordionItem>
        </AccordionRoot>
      </section>
      <section aria-label="focus-visible">
        <AccordionRoot className={RING}>
          <AccordionItem value="focus" title="Question" headingLevel={2}>
            <p>A closed panel stays in the HTML, hidden until it is found.</p>
          </AccordionItem>
        </AccordionRoot>
      </section>
      <section aria-label="disabled">
        <AccordionRoot disabled>
          <AccordionItem value="disabled" title="Question" headingLevel={2}>
            <p>A disabled accordion cannot be opened.</p>
          </AccordionItem>
        </AccordionRoot>
      </section>
    </div>
  )
}
