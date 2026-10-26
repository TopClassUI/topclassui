import { Button } from '../index.js'

/** The render prop makes a real anchor that looks like a button and still costs 0 KB. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button render={<a href="#" />}>Read the docs</Button>
      <Button render={<a href="#" />} variant="outline">Outlined link</Button>
    </div>
  )
}
