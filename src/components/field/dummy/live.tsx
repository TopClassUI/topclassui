'use client'

import { Input } from '#components/input/index.js'
import { Select } from '#components/select/index.js'
import { FieldLive } from '../index.js'

const SIZES = [{ value: 's', label: 'Small' }, { value: 'm', label: 'Medium' }, { value: 'l', label: 'Large' }]

/** FieldLive in a client file, outside a form: the same server HTML as Field, and an error of its own stays until the caller drops it. */
export default function Demo() {
  return (
    <div className="grid max-w-sm gap-4">
      <FieldLive name="nickname" label="Nickname" hint="Shown to other players">
        {(control) => <Input {...control} autoComplete="nickname" fullWidth />}
      </FieldLive>
      <FieldLive name="size" label="Size" error="Pick the size you ordered" required>
        {(control) => <Select {...control} items={SIZES} defaultValue="m" />}
      </FieldLive>
    </div>
  )
}
