import { TabsList, TabsRoot, TabsTab } from '../index.js'

/** The stage Figma 138:809 draws: a line list and an enclosed one side by side, with no panel, so both looks show at once. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-12">
      <TabsRoot defaultValue="overview">
        <TabsList aria-label="Line">
          <TabsTab value="overview">Overview</TabsTab>
          <TabsTab value="props">Props</TabsTab>
          <TabsTab value="a11y">A11y</TabsTab>
        </TabsList>
      </TabsRoot>
      <TabsRoot variant="enclosed" defaultValue="overview">
        <TabsList aria-label="Enclosed">
          <TabsTab value="overview">Overview</TabsTab>
          <TabsTab value="props">Props</TabsTab>
          <TabsTab value="a11y">A11y</TabsTab>
        </TabsList>
      </TabsRoot>
    </div>
  )
}
