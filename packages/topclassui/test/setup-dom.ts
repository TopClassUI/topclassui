import { cleanup, render } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, beforeAll, vi } from 'vitest'

import { useLocale } from '../src/shared/provider/context.js'

// R-13-1 warns once per page with no provider: spend that once here, so no test's silence depends on its order.
beforeAll(() => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  render(createElement(function Probe() { return useLocale() }))
  cleanup()
  warn.mockRestore()
})

// Without this each render stays in the document and getByRole finds several.
afterEach(cleanup)
