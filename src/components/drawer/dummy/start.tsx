import { Button } from '#components/button/index.js'
import { DrawerBody, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle, DrawerTrigger } from '../index.js'

const LINKS = [['Documentation', '/docs'], ['Components', '/components'], ['Changelog', '/changelog']] as const

/** placement="start": the navigation of a phone. It opens from the left in LTR and from the
 * right in RTL, and a swipe toward that edge closes it. Each link is a real anchor. */
export default function Demo() {
  return (
    <DrawerRoot placement="start">
      <DrawerTrigger render={<Button variant="ghost">Menu</Button>} />
      <DrawerPopup>
        <DrawerHeader>
          <DrawerTitle>Browse</DrawerTitle>
        </DrawerHeader>
        <DrawerBody className="grid content-start gap-1">
          {LINKS.map(([label, href]) => (
            <Button key={href} variant="ghost" tone="neutral" fullWidth className="justify-start" render={<a href={href} />}>
              {label}
            </Button>
          ))}
        </DrawerBody>
      </DrawerPopup>
    </DrawerRoot>
  )
}
