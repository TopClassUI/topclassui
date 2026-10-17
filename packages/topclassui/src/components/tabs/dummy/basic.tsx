import { TabsList, TabsPanel, TabsRoot, TabsTab } from '../index.js'

/** The drawn sample, in the line look: the active tab is semibold over a bar of the primary
 * colour. Each panel is written here, on the server, and all three are in the HTML. */
export default function Demo() {
  return (
    <TabsRoot defaultValue="overview">
      <TabsList aria-label="Project">
        <TabsTab value="overview">Overview</TabsTab>
        <TabsTab value="activity">Activity</TabsTab>
        <TabsTab value="settings">Settings</TabsTab>
      </TabsList>
      <TabsPanel value="overview">Revenue is up 12% against last quarter.</TabsPanel>
      <TabsPanel value="activity">Three people edited this project today.</TabsPanel>
      <TabsPanel value="settings">Only an owner can rename or delete this project.</TabsPanel>
    </TabsRoot>
  )
}
