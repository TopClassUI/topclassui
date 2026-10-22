import { Spinner } from '../index.js'
import type { SpinnerDesignProps } from '../index.js'

/** The docs stage once Try it changes a prop: the drawn sm to xl row, 22 px apart; size sets the second spinner and tone
 * every one. */
export default function Demo({ tone, ...props }: SpinnerDesignProps = {}) {
  return (
    <div className="flex items-center gap-5.5">
      <Spinner size="sm" tone={tone} />
      <Spinner {...props} tone={tone} />
      <Spinner size="lg" tone={tone} />
      <Spinner size="xl" tone={tone} />
    </div>
  )
}
