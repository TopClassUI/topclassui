import { Field } from '#components/field/index.js'
import { DatePicker } from '../index.js'

/** The card's sample: the Field's control object spreads onto the DatePicker as it is, so the label names the trigger
 * and the hint describes it after the day. */
export default function Demo() {
  return (
    <Field name="checkIn" label="Check-in" hint="Rooms are ready from 15:00">
      {(control) => (
        <DatePicker
          {...control}
          defaultValue="2026-10-02"
          minDate="2026-09-25"
          maxDate="2027-03-31"
        />
      )}
    </Field>
  )
}
