import { arrowSquareOut } from '#icons/data/arrow-square-out.js'
import { bookOpen } from '#icons/data/book-open.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import { DropdownLinkItem, DropdownPopup, DropdownRoot, DropdownTrigger } from '../index.js'

/** Rows that navigate are real anchors, so open in a new tab and middle-click work. A press
 * closes the menu. One row is another element through render: its own href is the one used. */
export default function Demo() {
  return (
    <DropdownRoot>
      <DropdownTrigger render={<Button variant="outline">Help</Button>} />
      <DropdownPopup>
        <DropdownLinkItem href="#docs" icon={<Svg icon={bookOpen} />}>Documentation</DropdownLinkItem>
        <DropdownLinkItem href="#changelog">Changelog</DropdownLinkItem>
        <DropdownLinkItem render={<a data-link="app" href="#support" />}>Contact support</DropdownLinkItem>
        <DropdownLinkItem href="https://example.com/status" target="_blank" rel="noreferrer" icon={<Svg icon={arrowSquareOut} />}>
          Status page
        </DropdownLinkItem>
      </DropdownPopup>
    </DropdownRoot>
  )
}
