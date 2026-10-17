// Loaded into a live page by e2e/slider.spec.ts: showValue with the values a real page writes beside a slider, from a
// short number to a currency range far wider than the slider, so a test can read what each leaves of the track.
import { createRoot } from 'react-dom/client'

import { Slider } from '#components/slider/index.js'
import { TopClassProvider } from '#shared/provider/provider.js'

const direction = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'
const USD = { style: 'currency', currency: 'USD', maximumFractionDigits: 0 } as const

function Fixture() {
  return (
    <TopClassProvider direction={direction} locale={direction === 'rtl' ? 'ar' : 'en'}>
      <div id="slider-values" style={{ display: 'grid', gap: 16, padding: 16, justifyItems: 'start' }}>
        <Slider aria-label="Short" defaultValue={40} showValue />
        <Slider aria-label="House price" showValue min={0} max={2000000} step={50000} defaultValue={[250000, 1500000]} format={USD} />
        <Slider aria-label="Salary" showValue min={0} max={200000} step={1000} defaultValue={[45000, 120000]} format={{ style: 'currency', currency: 'EUR' }} />
        <Slider aria-label="Huge" showValue min={0} max={1e15} defaultValue={[123456789012345, 999999999999999]} format={{ style: 'currency', currency: 'USD' }} />
        <Slider aria-label="Huge, full width" fullWidth showValue max={1e15} defaultValue={999999999999999} />
      </div>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
