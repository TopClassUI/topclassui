import { AccordionItem, AccordionRoot } from '../index.js'

/** A disabled item between two that work: its trigger keeps its place in the tab order, says
 * that it is disabled, and does nothing. Its panel stays closed. */
export default function Demo() {
  return (
    <AccordionRoot className="max-w-105">
      <AccordionItem value="profile" title="Profile" headingLevel={2}>
        <p>Your name and your picture.</p>
      </AccordionItem>
      <AccordionItem value="billing" title="Billing" headingLevel={2} disabled>
        <p>Only the owner of the workspace can change the plan.</p>
      </AccordionItem>
      <AccordionItem value="members" title="Members" headingLevel={2}>
        <p>Invite people and choose what each one can do.</p>
      </AccordionItem>
    </AccordionRoot>
  )
}
