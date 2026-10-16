// Loaded into a live page by e2e/drawer.spec.ts: the sheets no demo shows. Sheets with no DrawerHeader, whose first row
// lies under the x; hostile content (an element where text is expected, an empty value); and a trigger inside a real layout.
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Button } from '#components/button/index.js'
import {
  DrawerBody, DrawerClose, DrawerDescription, DrawerFooter, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle,
  DrawerTrigger,
} from '#components/drawer/index.js'
import type { DrawerPlacement } from '#components/drawer/index.js'

const LINE = 'A first line long enough to run the whole width of the sheet and on into the corner where the x is drawn.'
const PLACEMENTS: DrawerPlacement[] = ['end', 'start', 'top', 'bottom']

/** The provider a layout would mount: the direction and the language of the page this module was added to. */
const direction = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'

/** A trigger and a sheet with nothing in it, to stand in a layout. */
const plain = (label: string) => (
  <DrawerRoot>
    <DrawerTrigger render={<Button variant="outline">{label}</Button>} />
    <DrawerPopup aria-label={label} />
  </DrawerRoot>
)

function Fixture() {
  return (
    <TopClassProvider direction={direction} locale={document.documentElement.lang}>
      <div id="shapes" style={{ display: 'grid', gap: 12, padding: 24 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {PLACEMENTS.map((placement) => (
            <DrawerRoot key={placement} placement={placement}>
              <DrawerTrigger render={<Button variant="outline">body {placement}</Button>} />
              <DrawerPopup aria-label="Body only">
                <DrawerBody>{LINE} {LINE}</DrawerBody>
              </DrawerPopup>
            </DrawerRoot>
          ))}
          {PLACEMENTS.map((placement) => (
            <DrawerRoot key={placement} placement={placement}>
              <DrawerTrigger render={<Button variant="outline">title {placement}</Button>} />
              <DrawerPopup>
                <DrawerTitle>{LINE}</DrawerTitle>
                <DrawerBody>{LINE} {LINE}</DrawerBody>
              </DrawerPopup>
            </DrawerRoot>
          ))}
          <DrawerRoot>
            <DrawerTrigger render={<Button variant="outline">empty</Button>} />
            <DrawerPopup aria-label="Nothing in it" />
          </DrawerRoot>
          <DrawerRoot placement="bottom">
            <DrawerTrigger render={<Button variant="outline">hostile</Button>} />
            <DrawerPopup aria-label="Hostile">
              <DrawerHeader>
                <DrawerTitle><Button variant="outline">A button where the title is expected</Button></DrawerTitle>
                <DrawerDescription>{''}</DrawerDescription>
              </DrawerHeader>
              <DrawerBody>{''}</DrawerBody>
              <DrawerFooter>
                <DrawerClose render={<Button>{''}</Button>} aria-label="An action with no label" />
              </DrawerFooter>
            </DrawerPopup>
          </DrawerRoot>
        </div>
        <div id="layouts" style={{ display: 'grid', gap: 12 }}>
          <div data-layout="grid" style={{ display: 'grid', gridTemplateColumns: '8rem 8rem', gap: 8 }}>
            <Button variant="outline">In a layout</Button>
            {plain('In a layout')}
          </div>
          <div data-layout="flex" style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}><Button variant="outline">In a layout</Button></div>
            <div style={{ flex: 1 }}>{plain('In a layout')}</div>
          </div>
          <div data-layout="fit" style={{ width: 'fit-content' }}>
            <Button variant="outline">In a layout</Button>
            {plain('In a layout')}
          </div>
          <table data-layout="table">
            <tbody><tr><td><Button variant="outline">In a layout</Button></td><td>{plain('In a layout')}</td></tr></tbody>
          </table>
        </div>
      </div>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
