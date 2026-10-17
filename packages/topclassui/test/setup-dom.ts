import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Without this each render stays in the document and getByRole finds several.
afterEach(cleanup)
