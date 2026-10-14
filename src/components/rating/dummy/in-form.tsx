import { Button } from '#components/button/index.js'
import { Rating } from '../index.js'

/** Each radio submits its step under name, so the form works before any script runs. Reset puts
 * the stars back where the server drew them. */
export default function Demo() {
  return (
    <form className="flex flex-col items-start gap-3">
      <h2 id="rating-form-title" className="text-sm font-medium">How was your stay?</h2>
      <Rating readOnly={false} name="stay" defaultValue={4} aria-labelledby="rating-form-title" />
      <div className="flex flex-wrap gap-2">
        <Button type="submit">Send</Button>
        <Button type="reset" variant="outline">Reset</Button>
      </div>
    </form>
  )
}
