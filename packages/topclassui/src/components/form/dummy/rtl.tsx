import { Button } from '#components/button/index.js'
import { Field } from '#components/field/index.js'
import { Input } from '#components/input/index.js'
import { TopClassProvider } from '#shared/provider/provider.js'
import { Form } from '../index.js'

/** Arabic, inside TopClassProvider as the root layout would mount it: the same subscribe form, read from the right. */
export default function Demo() {
  return (
    <TopClassProvider direction="rtl" locale="ar">
      <div dir="rtl" lang="ar">
        <Form action="?subscribed" method="post" className="flex max-w-sm flex-col gap-4">
          <Field name="name" label="الاسم">
            {(control) => <Input {...control} autoComplete="name" fullWidth />}
          </Field>
          <Field name="email" label="البريد الإلكتروني" hint="لن نشاركه مع أحد" required>
            {(control) => <Input {...control} type="email" autoComplete="email" fullWidth />}
          </Field>
          <Button type="submit">اشترك</Button>
        </Form>
      </div>
    </TopClassProvider>
  )
}
