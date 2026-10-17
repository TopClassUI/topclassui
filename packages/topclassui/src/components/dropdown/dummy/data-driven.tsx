import { gear } from '#icons/data/gear.js'
import { signOut } from '#icons/data/sign-out.js'
import { user } from '#icons/data/user.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import { DropdownMenu } from '../index.js'

/** A Server Action, the one function a server page may pass. In an app it ends the session. */
async function endSession() {
  'use server'
  await Promise.resolve()
}

/** The same menu from data, as a server page writes it: two links and a Server Action. The
 * anchor in link stands in for the Link of a framework, and each href row is cloned from it. */
export default function Demo() {
  return (
    <DropdownMenu
      trigger={<Button variant="outline">Account</Button>}
      title="Account"
      link={<a data-link="app" href="" />}
      items={[
        { id: 'profile', label: 'Profile', icon: <Svg icon={user} />, shortcut: 'Ctrl P', href: '#profile' },
        { id: 'settings', label: 'Settings', icon: <Svg icon={gear} />, href: '#settings' },
        { id: 'billing', label: 'Billing', href: '#billing', disabled: true },
        { id: 'signout', label: 'Sign out', icon: <Svg icon={signOut} />, tone: 'danger', separatorBefore: true, action: endSession },
      ]}
    />
  )
}
