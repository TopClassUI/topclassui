import { AccordionItem, AccordionRoot } from '../index.js'

/** The drawn state: the first item starts open. defaultValue names it by its value, and is
 * plain data, so a server page can pass it. */
export default function Demo() {
  return (
    <AccordionRoot defaultValue={['install']} className="max-w-105">
      <AccordionItem value="install" title="How do I install a component?" headingLevel={2}>
        <p>Run npx topclassui add accordion. The files land in your own repository.</p>
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
