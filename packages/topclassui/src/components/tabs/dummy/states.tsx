import { TabsList, TabsPanel, TabsRoot, TabsTab } from '../index.js'

/** The ring a focused tab wears, drawn at rest so the strip can show it; not under forced colours, where a ring at rest would read as focus. */
const RING = 'not-forced-colors:outline-solid not-forced-colors:outline-(length:--tc-ring-width) not-forced-colors:outline-offset-(length:--tc-ring-offset) not-forced-colors:outline-ring'

/** One cell per state the Previewer frame draws, in its order: both looks with the active tab, a tab at rest and a disabled
 * one, the focus-visible ring on the active tab, then a list whose every tab is disabled. Each root is captioned by its title, each list named on its own. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-start gap-8">
      <TabsRoot title="line" defaultValue="active">
        <TabsList aria-label="Line">
          <TabsTab value="active">Active</TabsTab>
          <TabsTab value="rest">At rest</TabsTab>
          <TabsTab value="disabled" disabled>Disabled</TabsTab>
        </TabsList>
        <TabsPanel value="active">The active tab is semibold over a bar of the primary colour.</TabsPanel>
        <TabsPanel value="rest">A tab at rest is muted.</TabsPanel>
        <TabsPanel value="disabled">A disabled tab cannot be made active.</TabsPanel>
      </TabsRoot>
      <TabsRoot title="enclosed" variant="enclosed" defaultValue="active">
        <TabsList aria-label="Enclosed">
          <TabsTab value="active">Active</TabsTab>
          <TabsTab value="rest">At rest</TabsTab>
          <TabsTab value="disabled" disabled>Disabled</TabsTab>
        </TabsList>
        <TabsPanel value="active">The active tab sits on a raised surface.</TabsPanel>
        <TabsPanel value="rest">A tab at rest sits on the tinted box.</TabsPanel>
        <TabsPanel value="disabled">A disabled tab cannot be made active.</TabsPanel>
      </TabsRoot>
      <TabsRoot title="focus-visible" defaultValue="overview">
        <TabsList aria-label="Focused">
          <TabsTab value="overview" className={RING}>Overview</TabsTab>
          <TabsTab value="props">Props</TabsTab>
          <TabsTab value="a11y">A11y</TabsTab>
        </TabsList>
        <TabsPanel value="overview">The focused tab wears the ring.</TabsPanel>
        <TabsPanel value="props">Props.</TabsPanel>
        <TabsPanel value="a11y">Accessibility.</TabsPanel>
      </TabsRoot>
      <TabsRoot title="disabled" defaultValue="overview">
        <TabsList aria-label="Every tab disabled">
          <TabsTab value="overview" disabled>Overview</TabsTab>
          <TabsTab value="props" disabled>Props</TabsTab>
          <TabsTab value="a11y" disabled>A11y</TabsTab>
        </TabsList>
        <TabsPanel value="overview">A list whose every tab is disabled is dimmed whole.</TabsPanel>
        <TabsPanel value="props">Props.</TabsPanel>
        <TabsPanel value="a11y">Accessibility.</TabsPanel>
      </TabsRoot>
    </div>
  )
}
