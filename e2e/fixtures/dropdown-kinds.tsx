// Loaded into a live page by e2e/dropdown.spec.ts: what the demos cannot hold. The three kinds of a data-driven
// row with a counter each, since a demo is a server file and passes no handler; each value of modal beside a
// page button; and the layers one Escape must tell apart: a tooltip in a menu, and a menu opened by hover in a dialog.
import { type CSSProperties, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { info } from '#icons/data/info.js'
import { TopClassProvider } from '#shared/provider/provider.js'
import { Button } from '#components/button/index.js'
import { DialogBody, DialogHeader, DialogPopup, DialogRoot, DialogTitle, DialogTrigger } from '#components/dialog/index.js'
import {
  DropdownItem, DropdownMenu, DropdownPopup, DropdownRoot, DropdownTrigger,
} from '#components/dropdown/index.js'
import { Svg } from '#components/svg/index.js'
import { TooltipPopup, TooltipRoot, TooltipTrigger } from '#components/tooltip/index.js'

const ROW: CSSProperties = { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, padding: 24 }

function Kinds() {
  const [selected, setSelected] = useState(0)
  const [acted, setActed] = useState(0)
  const [forms, setForms] = useState(0)
  return (
    <div id="kinds" style={ROW}>
      <DropdownMenu
        trigger={<Button variant="outline">Kinds</Button>}
        title="Three kinds"
        link={<a data-link="app" rel="next" href="" />}
        items={[
          { id: 'link', label: 'A link', href: '#linked' },
          { id: 'select', label: 'A handler', onSelect: () => { setSelected((count) => count + 1) } },
          {
            id: 'action',
            label: 'An action',
            separatorBefore: true,
            action: async (formData) => {
              await Promise.resolve()
              setForms((count) => count + (formData instanceof FormData ? 1 : 0))
              setActed((count) => count + 1)
            },
          },
          { id: 'off-select', label: 'Disabled handler', disabled: true, onSelect: () => { setSelected((count) => count + 100) } },
          { id: 'off-action', label: 'Disabled action', disabled: true, action: () => { setActed((count) => count + 100) } },
          { id: 'off-link', label: 'Disabled link', disabled: true, href: '#never' },
        ]}
      />
      <DropdownMenu
        trigger={<Button variant="outline">Plain links</Button>}
        title="No link element"
        items={[{ id: 'plain', label: 'A plain anchor', href: '#plain' }]}
      />
      <output id="selected">{selected}</output>
      <output id="acted">{acted}</output>
      <output id="forms">{forms}</output>
    </div>
  )
}

function ModalValues() {
  const [presses, setPresses] = useState(0)
  return (
    <div id="modal-values" style={ROW}>
      <DropdownRoot>
        <DropdownTrigger render={<Button variant="outline">modal</Button>} />
        <DropdownPopup><DropdownItem>Rename</DropdownItem><DropdownItem>Duplicate</DropdownItem></DropdownPopup>
      </DropdownRoot>
      <DropdownRoot modal={false}>
        <DropdownTrigger render={<Button variant="outline">not modal</Button>} />
        <DropdownPopup><DropdownItem>Rename</DropdownItem><DropdownItem>Duplicate</DropdownItem></DropdownPopup>
      </DropdownRoot>
      <Button variant="ghost" onClick={() => { setPresses((count) => count + 1) }}>After</Button>
      <output id="presses">{presses}</output>
    </div>
  )
}

function Nested() {
  return (
    <div id="nested" style={ROW}>
      <DropdownRoot>
        <DropdownTrigger render={<Button variant="outline">Tooltip inside</Button>} />
        <DropdownPopup>
          <DropdownItem>Rename</DropdownItem>
          <TooltipRoot>
            <TooltipTrigger delay={0} render={<DropdownItem icon={<Svg icon={info} />}>Transfer</DropdownItem>} />
            <TooltipPopup>Only the owner can transfer it</TooltipPopup>
          </TooltipRoot>
        </DropdownPopup>
      </DropdownRoot>

      <DialogRoot>
        <DialogTrigger render={<Button variant="outline">Dialog</Button>} />
        <DialogPopup>
          <DialogHeader><DialogTitle>Project settings</DialogTitle></DialogHeader>
          <DialogBody>
            <div style={ROW}>
              <DropdownRoot>
                <DropdownTrigger render={<Button variant="outline" size="sm">By a press</Button>} />
                <DropdownPopup><DropdownItem>Viewer</DropdownItem><DropdownItem>Editor</DropdownItem></DropdownPopup>
              </DropdownRoot>
              <DropdownRoot>
                <DropdownTrigger openOnHover delay={0} render={<Button variant="outline" size="sm">By hover</Button>} />
                <DropdownPopup><DropdownItem>Weekly</DropdownItem><DropdownItem>Monthly</DropdownItem></DropdownPopup>
              </DropdownRoot>
            </div>
          </DialogBody>
        </DialogPopup>
      </DialogRoot>
    </div>
  )
}

function Fixture() {
  return (
    <TopClassProvider direction="ltr" locale="en">
      <Kinds />
      <ModalValues />
      <Nested />
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
