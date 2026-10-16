// Loaded into a live page by e2e/slider.spec.ts: every size at 0 and at 100, one under the other, so a test can read
// how far the knob and its focus ring reach past the slider's own box at either end.
import { createRoot } from 'react-dom/client'

import { Slider } from '#components/slider/index.js'
import { TopClassProvider } from '#shared/provider/provider.js'

const direction = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const

function Fixture() {
  return (
    <TopClassProvider direction={direction} locale={direction === 'rtl' ? 'ar' : 'en'}>
      <div id="slider-edges" style={{ display: 'grid', gap: 8, padding: 16, justifyItems: 'start' }}>
        {SIZES.map((size) => <Slider key={size} aria-label={`Ends ${size}`} size={size} defaultValue={[0, 100]} />)}
      </div>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
