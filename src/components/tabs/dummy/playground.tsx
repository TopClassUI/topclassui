import type { TabsDesignProps } from '../types.js'
import { TabsList, TabsPanel, TabsRoot, TabsTab } from '../index.js'

/** The tabs the docs' Try it drives: variant and size go to the root, keepMounted to every panel. */
export default function Demo({ variant, size, keepMounted }: TabsDesignProps = {}) {
  return (
    <TabsRoot variant={variant} size={size} defaultValue="overview">
      <TabsList aria-label="Project">
        <TabsTab value="overview">Overview</TabsTab>
        <TabsTab value="activity">Activity</TabsTab>
        <TabsTab value="settings">Settings</TabsTab>
      </TabsList>
      <TabsPanel value="overview" keepMounted={keepMounted}>Revenue is up 12% against last quarter.</TabsPanel>
      <TabsPanel value="activity" keepMounted={keepMounted}>Three people edited this project today.</TabsPanel>
      <TabsPanel value="settings" keepMounted={keepMounted}>Only an owner can rename or delete this project.</TabsPanel>
    </TabsRoot>
  )
}
