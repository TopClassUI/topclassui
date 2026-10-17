import { TabsList, TabsPanel, TabsRoot, TabsSkeleton, TabsTab } from '../index.js'

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const
const LOOKS = ['line', 'enclosed'] as const

/** Each tab list above the skeleton that holds its place, in a wrapper each: the same box. */
export default function Demo() {
  return (
    <div className="grid gap-6">
      {LOOKS.flatMap((variant) => SIZES.map((size) => (
        <div key={`${variant}-${size}`} data-pair={`${variant}-${size}`} className="grid gap-2">
          <TabsRoot variant={variant} size={size} defaultValue="one">
            <TabsList aria-label={`${variant} ${size}`}>
              <TabsTab value="one">Overview</TabsTab>
              <TabsTab value="two">Props</TabsTab>
              <TabsTab value="three">A11y</TabsTab>
            </TabsList>
            <TabsPanel value="one">{`Overview of ${size}.`}</TabsPanel>
            <TabsPanel value="two">{`Props of ${size}.`}</TabsPanel>
            <TabsPanel value="three">{`A11y of ${size}.`}</TabsPanel>
          </TabsRoot>
          <TabsSkeleton variant={variant} size={size} />
        </div>
      )))}
    </div>
  )
}
