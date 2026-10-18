import { Button } from 'topclassui/button'

/** PLAN 19 Phase 7: tsc --noEmit must report the bad variant, so this file fails the moment it stops being an error. */
export function TypeCheck() {
  // @ts-expect-error "nope" is not a ButtonVariant.
  return <Button variant="nope" />
}
