// Loaded into a live page by e2e/popover.spec.ts: one popover for each value of modal, with and without a
// PopoverClose inside, between two page buttons. Base UI holds the focus of a modal popover only when it has one.
import type { CSSProperties, ReactNode } from 'react'
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Button } from '#components/button/index.js'
import {
  PopoverClose, PopoverDescription, PopoverPopup, PopoverRoot, PopoverTitle, PopoverTrigger,
} from '#components/popover/index.js'
import type { PopoverRootProps } from '#components/popover/index.js'

const ROW: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 12, padding: 24 }

interface Case { name: string, modal: NonNullable<PopoverRootProps['modal']>, close: boolean }

const CASES: Case[] = [
  { name: 'false', modal: false, close: false },
  { name: 'trap-focus with a close', modal: 'trap-focus', close: true },
  { name: 'trap-focus with no close', modal: 'trap-focus', close: false },
  { name: 'true with a close', modal: true, close: true },
  { name: 'true with no close', modal: true, close: false },
]

function One({ name, modal, close }: Case): ReactNode {
  return (
    <PopoverRoot modal={modal}>
      <PopoverTrigger render={<Button variant="outline">{name}</Button>} />
      <PopoverPopup>
        <PopoverTitle>{name}</PopoverTitle>
        <PopoverDescription>One action, and a close only where the name says so.</PopoverDescription>
        <Button size="sm">Apply</Button>
        {close ? <PopoverClose render={<Button variant="outline" size="sm">Done</Button>} /> : null}
      </PopoverPopup>
    </PopoverRoot>
  )
}

function Fixture() {
  return (
    <TopClassProvider direction="ltr" locale="en">
      <div id="modal-values" style={ROW}>
        <Button variant="ghost">Before</Button>
        {CASES.map((item) => <One key={item.name} {...item} />)}
        <Button variant="ghost">After</Button>
      </div>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
