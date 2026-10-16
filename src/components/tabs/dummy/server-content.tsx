import { Button } from '#components/button/index.js'
import { Input } from '#components/input/index.js'
import { TabsList, TabsPanel, TabsRoot, TabsTab } from '../index.js'

const MEMBERS = ['Amal Haddad', 'Omar Abed', 'Lina Saleh', 'Yousef Nasser']

/** What a panel holds is rendered on the server and handed to the client part as children:
 * a list read from data, and a form whose field and button are Server Components too.
 * It opens on the form; the list waits in the HTML, hidden, until its tab is opened. */
export default function Demo() {
  return (
    <TabsRoot defaultValue="invite">
      <TabsList aria-label="Team">
        <TabsTab value="members">Members</TabsTab>
        <TabsTab value="invite">Invite</TabsTab>
      </TabsList>
      <TabsPanel value="members">
        <ul className="grid gap-2 text-sm">
          {MEMBERS.map((member) => <li key={member}>{member}</li>)}
        </ul>
      </TabsPanel>
      <TabsPanel value="invite">
        <form className="grid max-w-sm gap-2">
          <label htmlFor="demo-invite" className="text-sm font-medium text-body">Email</label>
          <Input id="demo-invite" name="email" type="email" autoComplete="email" required fullWidth />
          <Button type="submit" className="justify-self-start">Send the invite</Button>
        </form>
      </TabsPanel>
    </TabsRoot>
  )
}
