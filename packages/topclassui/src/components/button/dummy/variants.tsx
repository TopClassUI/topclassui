import { Button } from '../index.js'

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Save</Button>
      <Button variant="soft">Draft</Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="ghost">Skip</Button>
      <Button variant="link">Learn more</Button>
    </div>
  )
}
