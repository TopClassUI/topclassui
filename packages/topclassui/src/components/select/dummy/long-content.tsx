import { Select } from '../index.js'

const LONG = 'Department of Regional Planning, Infrastructure and Sustainable Urban Development, Northern Governorates Office, with responsibility for the coordination of transport, housing, water and energy projects across every municipality of the region, reporting to the minister'

const OFFICES = [
  { value: 'hq', label: 'Head office' },
  { value: 'north', label: LONG },
  { value: 'south', label: 'Southern office' },
]

/** A label far longer than the trigger: it ends in an ellipsis there and in its row, and the list is never wider than
 * the screen. The value is never cut: the form still sends north. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-1.5">
      <label htmlFor="select-long" className="text-sm text-body">Office</label>
      <Select id="select-long" name="office" items={OFFICES} defaultValue="north" />
    </div>
  )
}
