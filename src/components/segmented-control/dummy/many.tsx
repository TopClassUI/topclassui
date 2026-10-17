import { SegmentedControlItem, SegmentedControlRoot } from '../index.js'

const SECTIONS = ['Overview', 'Activity log', 'Team members', 'Billing and invoices', 'Integrations', 'Security settings', 'Notifications']

/** Seven long segments, more than a phone is wide: the track scrolls sideways inside itself and the page does not.
 * An arrow key brings the next segment into view. */
export default function Demo() {
  return (
    <SegmentedControlRoot aria-label="Workspace" defaultValue="Overview">
      {SECTIONS.map((section) => <SegmentedControlItem key={section} value={section}>{section}</SegmentedControlItem>)}
    </SegmentedControlRoot>
  )
}
