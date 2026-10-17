import { Button } from '#components/button/index.js'
import { DrawerBody, DrawerClose, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle, DrawerTrigger } from '../index.js'

const COUNTRIES = [
  'Jordan', 'Egypt', 'Morocco', 'Tunisia', 'Algeria', 'Lebanon', 'Iraq', 'Kuwait', 'Qatar', 'Bahrain', 'Oman', 'Yemen',
  'Sudan', 'Libya', 'Palestine', 'Syria', 'Mauritania', 'Somalia', 'Djibouti', 'Comoros', 'Turkey', 'Cyprus', 'Greece',
  'Italy',
]

/** placement="bottom": the sheet of a phone. It starts with a grabber, grows to nine tenths of
 * the screen and no further, and its list scrolls inside it. A swipe down closes it; so does the x. */
export default function Demo() {
  return (
    <DrawerRoot placement="bottom">
      <DrawerTrigger render={<Button variant="outline">Country</Button>} />
      <DrawerPopup>
        <DrawerHeader>
          <DrawerTitle>Choose a country</DrawerTitle>
        </DrawerHeader>
        <DrawerBody className="grid content-start gap-1">
          {COUNTRIES.map((country) => (
            <DrawerClose
              key={country}
              render={<Button variant="ghost" tone="neutral" fullWidth className="justify-start">{country}</Button>}
            />
          ))}
        </DrawerBody>
      </DrawerPopup>
    </DrawerRoot>
  )
}
