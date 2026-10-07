import { Button } from '../index.js'

export default function Demo() {
  return (
    <div className="flex max-w-sm flex-col gap-3">
      <Button fullWidth>Continue</Button>
      <Button variant="outline" fullWidth>Back</Button>
    </div>
  )
}
