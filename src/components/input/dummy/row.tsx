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
    </form>
  )
}
