import { TabsList, TabsPanel, TabsRoot, TabsTab } from '../index.js'

const LONG = 'Quarterly revenue, costs and forecast for every region the finance team reports on'

/** A label too long for its list ends in an ellipsis: no tab is ever wider than the list it
 * sits in, so the other tabs are still reached by scrolling the list. */
export default function Demo() {
  return (
    <div className="grid max-w-sm gap-8">
      <TabsRoot defaultValue="report">
        <TabsList aria-label="Report">
          <TabsTab value="report">{LONG}</TabsTab>
          <TabsTab value="notes">Notes</TabsTab>
        </TabsList>
        <TabsPanel value="report">{LONG}.</TabsPanel>
        <TabsPanel value="notes">Nobody has written a note yet.</TabsPanel>
      </TabsRoot>
      <TabsRoot variant="enclosed" defaultValue="report">
        <TabsList aria-label="Report, enclosed">
          <TabsTab value="report">{LONG}</TabsTab>
          <TabsTab value="notes">Notes</TabsTab>
        </TabsList>
        <TabsPanel value="report">{LONG}.</TabsPanel>
        <TabsPanel value="notes">Nobody has written a note yet.</TabsPanel>
      </TabsRoot>
    </div>
  )
}
