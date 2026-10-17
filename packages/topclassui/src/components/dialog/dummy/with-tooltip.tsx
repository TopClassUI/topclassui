import { copy } from '#icons/data/copy.js'
import { Button } from '#components/button/index.js'
import { Input } from '#components/input/index.js'
import { Svg } from '#components/svg/index.js'
import { TooltipPopup, TooltipRoot, TooltipTrigger } from '#components/tooltip/index.js'
import {
  DialogBody, DialogClose, DialogFooter, DialogHeader, DialogPopup, DialogRoot, DialogTitle, DialogTrigger,
} from '../index.js'

/** A tooltip inside a dialog. One Escape closes one thing: while the tooltip is open, by
 * hover or by focus, the key closes it and the dialog stays; the next one closes the dialog. */
export default function Demo() {
  return (
    <DialogRoot>
      <DialogTrigger render={<Button variant="outline">Share</Button>} />
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>Share this project</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex items-center gap-2">
          <Input aria-label="Link" defaultValue="https://example.com/p/website-redesign" readOnly fullWidth />
          <TooltipRoot>
            <TooltipTrigger
              render={
                <Button variant="outline" aria-label="Copy link">
                  <Svg icon={copy} />
                </Button>
              }
            />
            <TooltipPopup>Copy link</TooltipPopup>
          </TooltipRoot>
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button>Done</Button>} />
        </DialogFooter>
      </DialogPopup>
    </DialogRoot>
  )
}
