import { Button } from '#components/button/index.js'
import { Input } from '../index.js'

/** A grid form sizes its track to the content, so only an input that can shrink fits a phone. */
export default function Demo() {
  return (
    <form className="grid gap-4">
      <div data-row="own" className="flex gap-2">
        <Input name="first" placeholder="First name" aria-label="First name" />
        <Input name="last" placeholder="Last name" aria-label="Last name" />
      </div>
      <div data-row="grow" className="flex gap-2">
        <Input name="city" className="flex-1" placeholder="City" aria-label="City" />
        <Input name="postcode" className="flex-1" placeholder="Postcode" aria-label="Postcode" />
      </div>
      <div data-row="alone">
        <Input name="phone" type="tel" placeholder="+962 7 9000 0000" aria-label="Phone" />
      </div>
      {/* flex-1 makes the field the one that gives way, so the Button keeps its whole label. */}
      <div data-row="action" className="flex gap-2">
        <Input name="invite" type="email" className="flex-1" placeholder="name@company.com" aria-label="Invite by email" />
        <Button>Send invite</Button>
      </div>
    </form>
  )
}
