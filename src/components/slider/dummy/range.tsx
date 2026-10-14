import { Slider } from '../index.js'

/** A pair gives two thumbs, named Minimum and Maximum, that cannot cross. The form receives the name twice. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-2">
      <span id="slider-range-label" className="text-sm text-body">Price</span>
      <Slider aria-labelledby="slider-range-label" name="price" defaultValue={[20, 80]} step={5} />
    </div>
  )
}
