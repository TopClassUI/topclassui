import { Button } from '#components/button/index.js'
import { Slider } from '../index.js'

/** The slider carries the name and the default: it sends volume=60, before any script runs and after. */
export default function Demo() {
  return (
    <form className="grid justify-items-start gap-3">
      <span id="slider-form-label" className="text-sm text-body">Volume</span>
      <Slider aria-labelledby="slider-form-label" name="volume" defaultValue={60} step={5} />
      <Button type="submit">Save</Button>
    </form>
  )
}
