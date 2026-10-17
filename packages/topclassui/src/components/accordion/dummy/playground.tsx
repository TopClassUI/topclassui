import { ACCORDION_DEFAULTS } from '../constants.js'
import type { AccordionDesignProps } from '../types.js'
import { AccordionItem, AccordionRoot } from '../index.js'

/** The accordion the docs' Try it drives: hiddenUntilFound goes to the root, headingLevel to every
 * item. The stage opens on h2, not the schema's h3, because the page's own title is the h1. */
export default function Demo({ hiddenUntilFound = ACCORDION_DEFAULTS.hiddenUntilFound, headingLevel = 2 }: AccordionDesignProps = {}) {
  return (
    <AccordionRoot hiddenUntilFound={hiddenUntilFound} className="max-w-105">
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
