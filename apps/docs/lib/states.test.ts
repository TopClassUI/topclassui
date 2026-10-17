import { describe, expect, it } from 'vitest'

import { countStates } from './states'

describe('countStates', () => {
  it('counts the elements directly inside the returned root', () => {
    expect(countStates(`export default function Demo() {
  return (
    <div className="flex gap-3">
      <Button>Idle</Button>
      <Button loading>Saving</Button>
      <Button disabled>Disabled</Button>
    </div>
  )
}`)).toBe(3)
  })

  it('does not count what is nested deeper, nor a > inside an attribute', () => {
    expect(countStates(`export default function Demo() {
  return (
    <div>
      <Tag>Plain</Tag>
      <Tag onRemove={() => undefined}>Removable <b>x</b></Tag>
      <Separator />
    </div>
  )
}`)).toBe(3)
  })

  it('is 0 for a file with no return', () => {
    expect(countStates('export const x = 1')).toBe(0)
  })
})
