import { TabsList, TabsPanel, TabsRoot, TabsTab } from '../index.js'

/** A disabled tab is dimmed and cannot be made active. The arrow keys still stop on it, so
 * a screen reader hears that it is there and that it is unavailable. */
export default function Demo() {
  return (
    <div className="grid gap-8">
      <TabsRoot defaultValue="overview">
        <TabsList aria-label="Release">
          <TabsTab value="overview">Overview</TabsTab>
          <TabsTab value="changelog" disabled>Changelog</TabsTab>
          <TabsTab value="props">Props</TabsTab>
        </TabsList>
        <TabsPanel value="overview">Version 2.4 ships on Monday.</TabsPanel>
        <TabsPanel value="changelog">The changelog is written after the release.</TabsPanel>
        <TabsPanel value="props">Two props changed their default.</TabsPanel>
      </TabsRoot>
      <TabsRoot variant="enclosed" defaultValue="overview">
        <TabsList aria-label="Release, enclosed">
          <TabsTab value="overview">Overview</TabsTab>
          <TabsTab value="changelog" disabled>Changelog</TabsTab>
          <TabsTab value="props">Props</TabsTab>
        </TabsList>
        <TabsPanel value="overview">Version 2.4 ships on Monday.</TabsPanel>
        <TabsPanel value="changelog">The changelog is written after the release.</TabsPanel>
        <TabsPanel value="props">Two props changed their default.</TabsPanel>
      </TabsRoot>
    </div>
  )
}
