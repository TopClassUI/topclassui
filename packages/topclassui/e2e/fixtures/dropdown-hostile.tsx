// Loaded into a live page by e2e/dropdown.spec.ts: what a real app ends up passing. A label of 300 characters,
// a row that is an icon alone, a shortcut longer than its label, elements where text is expected, sixty groups,
// and a menu with nothing in it.
import type { CSSProperties } from 'react'
import { createRoot } from 'react-dom/client'

import { gear } from '#icons/data/gear.js'
import { trash } from '#icons/data/trash.js'
import { TopClassProvider } from '#shared/provider/provider.js'
import { Button } from '#components/button/index.js'
import {
  DropdownGroup, DropdownGroupLabel, DropdownItem, DropdownLinkItem, DropdownPopup, DropdownRoot, DropdownSeparator,
  DropdownTrigger,
} from '#components/dropdown/index.js'
import { Svg } from '#components/svg/index.js'

const direction = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'

const ROW: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 12, padding: 24 }

const WORD = 'a'.repeat(300)
const SENTENCE = Array.from({ length: 50 }, () => 'archive').join(' ')
const GROUPS = Array.from({ length: 60 }, (_, index) => index + 1)

function Fixture() {
  return (
    <TopClassProvider direction={direction} locale={direction === 'rtl' ? 'ar' : 'en'}>
      <div id="hostile" style={ROW}>
        <DropdownRoot>
          <DropdownTrigger render={<Button variant="outline">Long labels</Button>} />
          <DropdownPopup>
            <DropdownGroup>
              <DropdownGroupLabel>{WORD}</DropdownGroupLabel>
              <DropdownItem icon={<Svg icon={gear} />} shortcut="Ctrl P">{WORD}</DropdownItem>
              <DropdownItem icon={<Svg icon={gear} />} shortcut="Ctrl S">{SENTENCE}</DropdownItem>
              <DropdownLinkItem href="#long" tone="danger">{WORD}</DropdownLinkItem>
            </DropdownGroup>
          </DropdownPopup>
        </DropdownRoot>

        <DropdownRoot>
          <DropdownTrigger render={<Button variant="outline">Icon only</Button>} />
          <DropdownPopup>
            <DropdownItem icon={<Svg icon={gear} />} aria-label="Settings" />
            <DropdownItem icon={<Svg icon={trash} />} aria-label="Delete" tone="danger" />
          </DropdownPopup>
        </DropdownRoot>

        <DropdownRoot>
          <DropdownTrigger render={<Button variant="outline">Long shortcut</Button>} />
          <DropdownPopup>
            <DropdownItem shortcut="Ctrl Shift Alt Option Command P">Go</DropdownItem>
            <DropdownItem shortcut="Ctrl Shift Alt Option Command Windows Menu Fn F12 Print Screen">Save a copy of this file</DropdownItem>
          </DropdownPopup>
        </DropdownRoot>

        <DropdownRoot>
          <DropdownTrigger render={<Button variant="outline">Elements</Button>} />
          <DropdownPopup>
            <DropdownItem><em>Emphasis</em></DropdownItem>
            <DropdownItem><div id="block">A block where a line of text is expected</div></DropdownItem>
            <DropdownItem>{''}</DropdownItem>
            <DropdownSeparator />
            <DropdownItem>{0}</DropdownItem>
          </DropdownPopup>
        </DropdownRoot>

        <DropdownRoot>
          <DropdownTrigger render={<Button variant="outline">Sixty groups</Button>} />
          <DropdownPopup>
            {GROUPS.map((group) => (
              <DropdownGroup key={group}>
                <DropdownGroupLabel>Group {group}</DropdownGroupLabel>
                <DropdownItem>Row {group}</DropdownItem>
              </DropdownGroup>
            ))}
          </DropdownPopup>
        </DropdownRoot>

        <DropdownRoot>
          <DropdownTrigger render={<Button variant="outline">Empty</Button>} />
          <DropdownPopup />
        </DropdownRoot>
      </div>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
