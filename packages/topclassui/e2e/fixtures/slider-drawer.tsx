// Loaded into a live page by e2e/slider.spec.ts: a price slider in the body of an open Drawer, as a filter sheet on a
// phone puts one. A finger dragging its thumb toward the side the sheet closes on must move the thumb, not the sheet.
import { createRoot } from 'react-dom/client'

import { DrawerBody, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle } from '#components/drawer/index.js'
import { Slider } from '#components/slider/index.js'
import { TopClassProvider } from '#shared/provider/provider.js'

declare global { interface Window { sliderDrawer?: string[] } }

const direction = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'

function Fixture() {
  return (
    <TopClassProvider direction={direction} locale={direction === 'rtl' ? 'ar' : 'en'}>
      <DrawerRoot defaultOpen onOpenChange={(open, details) => { (window.sliderDrawer ??= []).push(`${String(open)} ${details.reason}`) }}>
        <DrawerPopup>
          <DrawerHeader><DrawerTitle>Filters</DrawerTitle></DrawerHeader>
          <DrawerBody>
            <Slider aria-label="Price" name="price" defaultValue={20} fullWidth />
          </DrawerBody>
        </DrawerPopup>
      </DrawerRoot>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
container.id = 'slider-drawer'
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
