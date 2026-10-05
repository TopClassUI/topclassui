import { Button } from '../index.js'

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Idle</Button>
      <Button loading>Saving</Button>
      <Button disabled>Disabled</Button>
      <Button variant="soft" loading>Loading soft</Button>
      <Button variant="outline" disabled>Disabled outline</Button>
    </div>
  )
}
