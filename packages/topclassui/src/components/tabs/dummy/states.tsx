import { TabsList, TabsRoot, TabsTab } from '../index.js'

/** The ring a focused line tab wears, inset past its bar as the live one is, drawn at rest so the strip can show it; not under
 * forced colours, where a ring at rest would read as focus. */
const RING = 'not-forced-colors:outline-solid not-forced-colors:outline-(length:--tc-ring-width) not-forced-colors:-outline-offset-[calc(var(--tc-ring-width)+var(--tc-ring-offset)+2px)] not-forced-colors:outline-ring'

/** The four states the frame draws, a list each at md with no panel and room around it, captioned by the title: line, enclosed, the
 * focus ring on the active tab, and a list whose every tab is disabled. Each list is named on its own. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-8">
      <TabsRoot title="line" className="mx-2 w-max" defaultValue="overview">
        <TabsList aria-label="Line">
          <TabsTab value="overview">Overview</TabsTab>
          <TabsTab value="props">Props</TabsTab>
          <TabsTab value="a11y">A11y</TabsTab>
        </TabsList>
      </TabsRoot>
      <TabsRoot title="enclosed" className="mx-2 w-max" variant="enclosed" defaultValue="overview">
        <TabsList aria-label="Enclosed">
          <TabsTab value="overview">Overview</TabsTab>
          <TabsTab value="props">Props</TabsTab>
          <TabsTab value="a11y">A11y</TabsTab>
        </TabsList>
      </TabsRoot>
      <TabsRoot title="focus-visible" className="mx-2 w-max" defaultValue="overview">
        <TabsList aria-label="Focused">
          <TabsTab value="overview" className={RING}>Overview</TabsTab>
          <TabsTab value="props">Props</TabsTab>
          <TabsTab value="a11y">A11y</TabsTab>
        </TabsList>
      </TabsRoot>
      <TabsRoot title="disabled" className="mx-2 w-max" defaultValue="overview">
        <TabsList aria-label="Every tab disabled">
          <TabsTab value="overview" disabled>Overview</TabsTab>
          <TabsTab value="props" disabled>Props</TabsTab>
          <TabsTab value="a11y" disabled>A11y</TabsTab>
        </TabsList>
      </TabsRoot>
    </div>
  )
}
