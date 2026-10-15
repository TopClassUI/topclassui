// Loaded into a live page by e2e/field.spec.ts: FieldLive under a React 19 form action that answers with errors and the
// values it was sent, as FormAction will (unit-5.md, Form): React resets the form once the action settles, the fields
// take the sent values back as their defaults, and each error goes once its field's value really changes.
import { useActionState } from 'react'
import { createRoot } from 'react-dom/client'

import { Checkbox } from '#components/checkbox/index.js'
import { FieldLive } from '#components/field/index.js'
import { Input } from '#components/input/index.js'
import { Select } from '#components/select/index.js'
import { type FormErrors, FormErrorsContext } from '#shared/form-errors.js'
import { TopClassProvider } from '#shared/provider/provider.js'

type Sent = [string, string][]
interface State { errors?: FormErrors, values?: Record<string, string>, sent: Sent[] }
declare global { interface Window { fieldSent?: Sent[] } }

const COUNTRIES = [{ value: 'jo', label: 'Jordan' }, { value: 'eg', label: 'Egypt' }, { value: 'ma', label: 'Morocco' }]

/** Refuses every submit with one error per field, and hands back what it was sent. */
async function answer(previous: State, data: FormData): Promise<State> {
  await Promise.resolve()
  const sent: Sent = [...data.entries()].map(([key, value]) => [key, typeof value === 'string' ? value : value.name])
  window.fieldSent = [...(window.fieldSent ?? []), sent]
  return {
    errors: { email: 'That email is taken', terms: 'Accept the terms', country: ['We do not ship there', 'Pick another'] },
    values: Object.fromEntries(sent),
    sent: [...previous.sent, sent],
  }
}

function Fixture() {
  const [state, action] = useActionState(answer, { sent: [] })
  return (
    <TopClassProvider direction="ltr" locale="en">
      <FormErrorsContext value={state.errors}>
        <form id="field-live" action={action} style={{ display: 'grid', gap: 16, padding: 16, maxWidth: 360 }} data-answers={state.sent.length}>
          <FieldLive name="email" label="Email">{(control) => <Input {...control} defaultValue={state.values?.['email'] ?? ''} fullWidth />}</FieldLive>
          <FieldLive name="terms" label="Terms" inline>{(control) => <Checkbox {...control} defaultChecked={state.values?.['terms'] === 'on'} />}</FieldLive>
          <FieldLive name="country" label="Country">{(control) => <Select {...control} items={COUNTRIES} defaultValue={state.values?.['country'] ?? 'jo'} />}</FieldLive>
          <button type="submit">Send</button>
        </form>
      </FormErrorsContext>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
