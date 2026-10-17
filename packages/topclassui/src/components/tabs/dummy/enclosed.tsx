import { TabsList, TabsPanel, TabsRoot, TabsTab } from '../index.js'

/** The enclosed look: the tabs sit in a tinted box as wide as they are, and the active one
 * is lifted onto a raised surface. */
export default function Demo() {
  return (
    <TabsRoot variant="enclosed" defaultValue="overview">
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
