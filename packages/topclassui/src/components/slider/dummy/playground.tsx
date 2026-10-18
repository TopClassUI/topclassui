import { Slider } from '../index.js'
import type { SliderDesignProps } from '../types.js'

/** The site's Try it stage: each schema prop arrives from a control, and an absent one keeps its default. */
export default function Demo(props: SliderDesignProps) {
  return (
    <div className="grid justify-items-start gap-2">
      <span id="slider-playground-label" className="text-sm text-body">Volume</span>
      <Slider aria-labelledby="slider-playground-label" defaultValue={60} {...props} />
    </div>
  )
}
