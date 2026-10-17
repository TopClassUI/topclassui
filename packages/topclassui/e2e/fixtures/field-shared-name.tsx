// Loaded into a live page by e2e/field.spec.ts: one name on several FieldLive (choice 33), a checkbox group, under a React
// 19 form action that refuses every submit with one error for the group and hands back what was ticked.
import { useActionState } from 'react'
import { createRoot } from 'react-dom/client'

import { Checkbox } from '#components/checkbox/index.js'
import { FieldLive } from '#components/field/index.js'
import { Input } from '#components/input/index.js'
import { type FormErrors, FormErrorsContext } from '#shared/form-errors.js'
import { TopClassProvider } from '#shared/provider/provider.js'

interface State { errors?: FormErrors, contact: string[], answers: number }

async function answer(previous: State, data: FormData): Promise<State> {
  await Promise.resolve()
  const contact = data.getAll('contact').map(String)
  return { errors: { contact: 'Pick one', note: 'Add a note' }, contact, answers: previous.answers + 1 }
}

const BOXES = [{ value: 'email', label: 'Email me' }, { value: 'sms', label: 'Text me' }]

function Fixture() {
  const [state, action] = useActionState(answer, { contact: [], answers: 0 })
  return (
    <TopClassProvider direction="ltr" locale="en">
      <FormErrorsContext value={state.errors}>
        <form id="field-shared-name" action={action} style={{ display: 'grid', gap: 16, padding: 16, maxWidth: 360 }} data-answers={state.answers}>
          {BOXES.map((box) => (
            <FieldLive key={box.value} name="contact" label={box.label} inline>
              {(control) => <Checkbox {...control} value={box.value} defaultChecked={state.contact.includes(box.value)} />}
            </FieldLive>
          ))}
          <FieldLive name="note" label="Note">{(control) => <Input {...control} fullWidth />}</FieldLive>
          <button type="submit">Send</button>
        </form>
      </FormErrorsContext>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
