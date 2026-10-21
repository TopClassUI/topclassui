import { AccordionItem, AccordionRoot } from '../index.js'

/** The ring a focused trigger wears, inset as the live one is, drawn at rest on the one-item box so the strip can show
 * it; not under forced colours, where a ring at rest would read as focus. */
const RING = 'not-forced-colors:outline-solid not-forced-colors:outline-(length:--tc-ring-width) not-forced-colors:-outline-offset-(length:--tc-ring-width) not-forced-colors:outline-ring'

/** The five states Figma 138:994 draws, one accordion each asking the drawn Question, in a section named by its state.
 * The open one has a title of its own, so its region and the one a reader opens next are not two landmarks of one name.
 * Hover is the neutral tint a pointer lays on the trigger, which fills the one-item box. */
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
            <p>Answer.</p>
          </AccordionItem>
        </AccordionRoot>
      </section>
      <section aria-label="hover">
        <AccordionRoot className="tone-neutral bg-(--tc-soft)">
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
