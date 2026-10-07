import { Button } from '../index.js'

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="md">The scale</Button>
      <Button size="custom" className="h-control-xl px-pad-x-sm text-xs">Your own row</Button>
    </div>
  )
}
