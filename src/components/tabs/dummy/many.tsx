import { TabsList, TabsPanel, TabsRoot, TabsTab } from '../index.js'

const SECTIONS = ['Overview', 'Activity', 'Members', 'Billing', 'Integrations', 'Security', 'Notifications', 'Changelog']

/** Eight tabs, more than a phone is wide: each list scrolls sideways inside itself, and the
 * page does not. An arrow key brings the next tab into view. */
export default function Demo() {
  return (
    <div className="grid gap-8">
      <TabsRoot defaultValue="Overview">
        <TabsList aria-label="Workspace">
          {SECTIONS.map((section) => <TabsTab key={section} value={section}>{section}</TabsTab>)}
        </TabsList>
        {SECTIONS.map((section) => <TabsPanel key={section} value={section}>Everything under {section}.</TabsPanel>)}
      </TabsRoot>
      <TabsRoot variant="enclosed" defaultValue="Overview">
        <TabsList aria-label="Workspace, enclosed">
          {SECTIONS.map((section) => <TabsTab key={section} value={section}>{section}</TabsTab>)}
        </TabsList>
        {SECTIONS.map((section) => <TabsPanel key={section} value={section}>Everything under {section}.</TabsPanel>)}
      </TabsRoot>
    </div>
  )
}
