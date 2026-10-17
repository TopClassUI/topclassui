import { Button } from '#components/button/index.js'
import { PopoverDescription, PopoverPopup, PopoverRoot, PopoverTitle, PopoverTrigger } from '../index.js'

/** The drawing: a title, a line of text and one action, under the trigger. The label sits
 * inside the Button passed to render, so a server render keeps it whole. */
export default function Demo() {
  return (
    <PopoverRoot>
      <PopoverTrigger render={<Button variant="outline">Share</Button>} />
      <PopoverPopup>
        <PopoverTitle>Share this page</PopoverTitle>
        <PopoverDescription>Anyone with the link can read it. Only your team can edit.</PopoverDescription>
        <Button size="sm" className="self-start">Copy link</Button>
      </PopoverPopup>
    </PopoverRoot>
  )
}
