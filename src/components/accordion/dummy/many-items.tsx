import { AccordionItem, AccordionRoot } from '../index.js'

const QUESTIONS = Array.from({ length: 60 }, (_, index) => index + 1)

/** Sixty items. None is windowed: every answer is in the HTML, which is the point of the
 * component, and the page scrolls as any long page does. */
export default function Demo() {
  return (
    <AccordionRoot className="max-w-105">
      {QUESTIONS.map((number) => (
        <AccordionItem key={number} value={`question-${String(number)}`} title={`Question ${String(number)}`} headingLevel={2}>
          <p>The answer to question {number}.</p>
        </AccordionItem>
      ))}
    </AccordionRoot>
  )
}
