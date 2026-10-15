'use client'

import { Button } from '#components/button/index.js'
import { FieldLive } from '#components/field/index.js'
import { Input } from '#components/input/index.js'
import { FormAction, type FormActionState } from '../index.js'

interface State extends FormActionState {
  values?: { name: string, email: string }
  message?: string
}

/** A text entry of the form, or '' for a missing one or a file. */
const text = (formData: FormData, name: string) => { const value = formData.get(name); return typeof value === 'string' ? value : '' }

/** Stands in for a Server Action: it answers a moment later, refuses taken@example.com and hands back what was sent. */
async function subscribe(_state: State, formData: FormData): Promise<State> {
  const values = { name: text(formData, 'name'), email: text(formData, 'email') }
  await new Promise((done) => { setTimeout(done, 200) })
  if (values.email === 'taken@example.com') return { errors: { email: 'This email is already subscribed' }, values }
  return { message: `Subscribed ${values.email}` }
}

/** FormAction in a client file: the error lands on its FieldLive, and the function child gives the fields back what was typed. */
export default function Demo() {
  return (
    <FormAction action={subscribe} className="flex max-w-sm flex-col gap-4">
      {(state, pending) => (
        <>
          <FieldLive name="name" label="Name">
            {(control) => <Input {...control} autoComplete="name" defaultValue={state.values?.name} fullWidth />}
          </FieldLive>
          <FieldLive name="email" label="Email" hint="Try taken@example.com" required>
            {(control) => <Input {...control} type="email" autoComplete="email" defaultValue={state.values?.email} fullWidth />}
          </FieldLive>
          <Button type="submit" loading={pending}>Subscribe</Button>
          <p role="status" className="text-sm text-body">{state.message}</p>
        </>
      )}
    </FormAction>
  )
}
