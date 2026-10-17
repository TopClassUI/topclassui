import { Button } from '#components/button/index.js'
import {
  PopoverClose, PopoverDescription, PopoverPopup, PopoverRoot, PopoverTitle, PopoverTrigger,
} from '../index.js'

/** modal: the page behind takes no press and does not scroll, and no scrim is drawn. Tab stays
 * in the popup because a PopoverClose is inside it: without one Base UI does not hold the focus. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <PopoverRoot modal>
        <PopoverTrigger render={<Button variant="outline">Delete draft</Button>} />
        <PopoverPopup>
          <div className="flex items-start justify-between gap-2">
            <PopoverTitle>Delete this draft?</PopoverTitle>
            <PopoverClose />
          </div>
          <PopoverDescription>The draft and its comments are removed. This cannot be undone.</PopoverDescription>
          <div className="flex flex-wrap justify-end gap-2">
            <PopoverClose render={<Button variant="outline" size="sm">Keep it</Button>} />
            <PopoverClose render={<Button tone="danger" size="sm">Delete</Button>} />
          </div>
        </PopoverPopup>
      </PopoverRoot>
      <Button variant="ghost">Behind the panel</Button>
    </div>
  )
}
