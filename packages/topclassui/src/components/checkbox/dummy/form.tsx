import { Button } from '#components/button/index.js'
import { Checkbox } from '../index.js'

/** A checked box and an unchecked one with uncheckedValue, in a plain form: terms=on and news=no, before any script runs and after. */
export default function Demo() {
  return (
    <form className="grid justify-items-start gap-3">
      <div className="flex items-center gap-2">
        <Checkbox id="checkbox-form-terms" name="terms" defaultChecked />
        <label htmlFor="checkbox-form-terms" className="text-sm text-body">I accept the terms</label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="checkbox-form-news" name="news" value="yes" uncheckedValue="no" />
        <label htmlFor="checkbox-form-news" className="text-sm text-body">Send me product news</label>
      </div>
      <Button type="submit">Save</Button>
    </form>
  )
}
