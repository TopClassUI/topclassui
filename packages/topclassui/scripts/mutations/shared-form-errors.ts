// The mutations of src/shared/form-errors.ts. Found by scripts/mutations/index.ts.
import type { Mutation } from '../lib/mutate.js'

export const MUTATIONS: Mutation[] = [
  {
    label: 'shared form errors: the hook always returns undefined, so a field never shows what its form action returned',
    file: 'src/shared/form-errors.ts',
    from: '  return useContext(FormErrorsContext)',
    to: '  return undefined',
  },
  {
    label: 'shared form errors: the context defaults to an empty record, not the undefined the plan writes for a reader with no provider',
    file: 'src/shared/form-errors.ts',
    from: 'createContext<FormErrors | undefined>(undefined)',
    to: 'createContext<FormErrors | undefined>({})',
  },
]
