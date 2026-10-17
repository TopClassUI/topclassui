import { AccordionItem, AccordionRoot } from '../index.js'

/** The drawn sample: three questions, all closed, one open at a time. Each answer is in the
 * HTML from the start, hidden until the reader opens it or the browser finds a word in it. */
export default function Demo() {
  return (
    <AccordionRoot className="max-w-105">
      <AccordionItem value="server" title="What is a server component?" headingLevel={2}>
        <p>A component that renders on the server and sends HTML, with no JavaScript of its own.</p>
      </AccordionItem>
      <AccordionItem value="arabic" title="Does it work in Arabic?" headingLevel={2}>
        <p>Yes. The caret moves to the left edge and the text starts at the right one.</p>
      </AccordionItem>
      <AccordionItem value="bundle" title="How big is the bundle?" headingLevel={2}>
        <p>About one kilobyte in the browser. The answers cost nothing: they are plain HTML.</p>
      </AccordionItem>
    </AccordionRoot>
  )
}
