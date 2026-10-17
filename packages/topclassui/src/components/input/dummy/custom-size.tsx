import { Input } from '../index.js'

/** custom emits no height, padding or type step, so the caller's own classes set them. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input placeholder="On the scale" aria-label="On the scale" />
      <Input size="custom" className="h-14 px-5 text-lg" placeholder="Your own size" aria-label="Your own size" />
    </div>
  )
}
