import { Button } from '#components/button/index.js'
import {
  DrawerBody, DrawerClose, DrawerFooter, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle, DrawerTrigger,
} from '../index.js'
import type { DrawerRootProps } from '../types.js'

const WIDTHS: Array<[NonNullable<DrawerRootProps['size']>, string]> = [
  ['xs', '256 px'],
  ['sm', '288 px'],
  ['md', '320 px'],
  ['lg', '384 px'],
  ['xl', '480 px'],
]

/** The five widths of a sheet at the start or the end, and custom, which sets none: its className
 * gives the sheet one. Each is the widest it grows; on a narrower screen every one fills it. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {WIDTHS.map(([size, width]) => (
        <DrawerRoot key={size} size={size}>
          <DrawerTrigger render={<Button variant="outline">{size}</Button>} />
          <DrawerPopup>
            <DrawerHeader>
              <DrawerTitle>Size {size}</DrawerTitle>
            </DrawerHeader>
            <DrawerBody>This sheet grows to {width} and no wider.</DrawerBody>
            <DrawerFooter>
              <DrawerClose render={<Button>Done</Button>} />
            </DrawerFooter>
          </DrawerPopup>
        </DrawerRoot>
      ))}
      <DrawerRoot size="custom">
        <DrawerTrigger render={<Button variant="outline">custom</Button>} />
        <DrawerPopup className="max-w-xl">
          <DrawerHeader>
            <DrawerTitle>Size custom</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>This sheet takes its width from the className it was given.</DrawerBody>
          <DrawerFooter>
            <DrawerClose render={<Button>Done</Button>} />
          </DrawerFooter>
        </DrawerPopup>
      </DrawerRoot>
    </div>
  )
}
