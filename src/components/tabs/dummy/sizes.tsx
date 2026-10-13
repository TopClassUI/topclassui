import { TabsList, TabsPanel, TabsRoot, TabsTab } from '../index.js'

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const
const LOOKS = ['line', 'enclosed'] as const

/** size goes on the root and reaches every tab. custom emits no height, padding or type
 * step, so each tab takes them from its own className. */
export default function Demo() {
  return (
    <div className="grid gap-8">
      {LOOKS.map((variant) => (
        <div key={variant} className="grid gap-4">
          {SIZES.map((size) => (
            <TabsRoot key={size} variant={variant} size={size} defaultValue="one">
              <TabsList aria-label={`${variant} ${size}`}>
                <TabsTab value="one">Size {size}</TabsTab>
                <TabsTab value="two">Props</TabsTab>
              </TabsList>
              <TabsPanel value="one">The {size} tabs of the {variant} look.</TabsPanel>
              <TabsPanel value="two">Props of {size}.</TabsPanel>
            </TabsRoot>
          ))}
          <TabsRoot variant={variant} size="custom" defaultValue="one">
            <TabsList aria-label={`${variant} custom`}>
              <TabsTab value="one" className="h-14 px-5 text-lg">Your own size</TabsTab>
              <TabsTab value="two" className="h-14 px-5 text-lg">Props</TabsTab>
            </TabsList>
            <TabsPanel value="one">Tabs sized by their own classes.</TabsPanel>
            <TabsPanel value="two">Props of your own size.</TabsPanel>
          </TabsRoot>
        </div>
      ))}
    </div>
  )
}
