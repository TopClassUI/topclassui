// Loaded into a live page by e2e/slider.spec.ts: a slider mounted with NO TopClassProvider, which R-13-1 forbids, on
// whatever page it lands on. Base UI's keys and pointer then run left to right, so the slider must draw left to right too.
import { createRoot } from 'react-dom/client'

import { Slider } from '#components/slider/index.js'

function Fixture() {
  return (
    <div id="slider-no-provider" style={{ padding: 16, width: 300 }}>
      <Slider aria-label="No provider" defaultValue={30} fullWidth />
    </div>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
