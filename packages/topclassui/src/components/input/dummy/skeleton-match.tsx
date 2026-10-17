import { Input, InputSkeleton } from '../index.js'

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const

/** Each field above the skeleton that holds its place, in a wrapper each: the same box. */
export default function Demo() {
  return (
    <div className="grid gap-4">
      {SIZES.map((size) => (
        <div key={size} data-pair={size} className="grid gap-2">
          <div><Input size={size} placeholder="Email" aria-label={`Email, ${size}`} /></div>
          <div><InputSkeleton size={size} /></div>
        </div>
      ))}
      <div data-pair="full" className="grid gap-2">
        <div><Input fullWidth placeholder="Fills its container" aria-label="Full width" /></div>
        <div><InputSkeleton fullWidth /></div>
      </div>
      <div data-pair="custom" className="grid gap-2">
        <div><Input size="custom" className="h-14 px-5 text-lg" placeholder="Your own size" aria-label="Your own size" /></div>
        <div><InputSkeleton size="custom" className="h-14 px-5 text-lg" /></div>
      </div>
      {/* On one baseline with its label, which a box with no line of text could not share. */}
      <div data-pair="label" className="grid gap-2">
        <div className="flex items-baseline gap-2">
          <span id="demo-email">Email</span>
          <Input type="email" aria-labelledby="demo-email" />
        </div>
        <div className="flex items-baseline gap-2">
          <span>Email</span>
          <InputSkeleton />
        </div>
      </div>
      {/* In a row too narrow for both, the label is cut and the field shrinks, by the same share. */}
      <div data-pair="narrow" className="grid gap-2">
        <div className="flex w-48 items-center gap-2">
          <span id="demo-notify" className="min-w-0 truncate">Notification email address</span>
          <Input type="email" aria-labelledby="demo-notify" />
        </div>
        <div className="flex w-48 items-center gap-2">
          <span className="min-w-0 truncate">Notification email address</span>
          <InputSkeleton />
        </div>
      </div>
    </div>
  )
}
