import { Button } from '#components/button/index.js'
import {
  DialogBody, DialogClose, DialogFooter, DialogHeader, DialogPopup, DialogRoot, DialogTitle, DialogTrigger,
} from '../index.js'
import type { DialogPopupProps } from '../types.js'

const WIDTHS: Array<[NonNullable<DialogPopupProps['size']>, string]> = [
  ['xs', '320 px'],
  ['sm', '360 px'],
  ['md', '400 px'],
  ['lg', '512 px'],
  ['xl', '640 px'],
]

/** The five widths, and custom, which sets none: its className gives the popup one.
 * Each is the widest the popup grows; on a narrower screen every one fills the viewport. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {WIDTHS.map(([size, width]) => (
        <DialogRoot key={size}>
          <DialogTrigger render={<Button variant="outline">{size}</Button>} />
          <DialogPopup size={size}>
            <DialogHeader>
              <DialogTitle>Size {size}</DialogTitle>
            </DialogHeader>
            <DialogBody>This dialog grows to {width} and no wider.</DialogBody>
            <DialogFooter>
              <DialogClose render={<Button>Done</Button>} />
            </DialogFooter>
          </DialogPopup>
        </DialogRoot>
      ))}
      <DialogRoot>
        <DialogTrigger render={<Button variant="outline">custom</Button>} />
        <DialogPopup size="custom" className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Size custom</DialogTitle>
          </DialogHeader>
          <DialogBody>This dialog takes its width from the className it was given.</DialogBody>
          <DialogFooter>
            <DialogClose render={<Button>Done</Button>} />
          </DialogFooter>
        </DialogPopup>
      </DialogRoot>
    </div>
  )
}
