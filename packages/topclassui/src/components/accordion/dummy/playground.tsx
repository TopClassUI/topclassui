import type { AccordionDesignProps } from '../types.js'
import { AccordionItem, AccordionRoot } from '../index.js'

/** The accordion the docs' Try it drives, opening on its first item as Figma 138:994 draws the stage: hiddenUntilFound
 * goes to the root, headingLevel to every item, which open on h2 under the harness h1 rather than the schema's h3. */
export default function Demo({ headingLevel = 2, ...props }: AccordionDesignProps = {}) {
  return (
    <AccordionRoot defaultValue={['server']} {...props} className="max-w-100">
      <AccordionItem value="server" title="What is a server component?" headingLevel={headingLevel}>
        <p>A component that renders on the server and sends HTML, with no JavaScript of its own.</p>
      </AccordionItem>
      <AccordionItem value="arabic" title="Does it work in Arabic?" headingLevel={headingLevel}>
        <p>Yes. The caret moves to the left edge and the text starts at the right one.</p>
      </AccordionItem>
      <AccordionItem value="bundle" title="How big is the bundle?" headingLevel={headingLevel}>
        <p>About one kilobyte in the browser. The answers cost nothing: they are plain HTML.</p>
      </AccordionItem>
    </AccordionRoot>
  )
}
