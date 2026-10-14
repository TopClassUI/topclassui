// PLAN section 20: the server render must hydrate with no recoverable error.
import { act } from '@testing-library/react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useServerTabStop } from './use-server-tab-stop.js'

/** Every value the hook returned, render by render. */
const returned: object[] = []

function Item({ isStop }: { isStop: boolean }) {
  const stop = useServerTabStop(isStop)
  returned.push(stop)
  return <button type="button" {...stop}>Pro</button>
}

const containers: HTMLElement[] = []

async function hydrate(isStop: boolean) {
  const errors: unknown[] = []
  const onError = vi.spyOn(console, 'error').mockImplementation((...args) => { errors.push(args[0]) })
  const container = document.createElement('div')
  container.innerHTML = renderToString(<Item isStop={isStop} />)
  const served = container.innerHTML
  document.body.appendChild(container)
  containers.push(container)
  returned.length = 0
  const root = await act(() => Promise.resolve(
    hydrateRoot(container, <Item isStop={isStop} />, { onRecoverableError: (error) => { errors.push(error) } }),
  ))
  onError.mockRestore()
  return { errors, served, container, root }
}

afterEach(() => {
  returned.length = 0
  for (const container of containers.splice(0)) container.remove()
})

describe('a stop the server wrote hydrates cleanly and then leaves', () => {
  it('the first client render agrees with the server, and after hydration the hook returns {}', async () => {
    const { errors, served, container, root } = await hydrate(true)
    expect(served).toBe('<button type="button" tabindex="0">Pro</button>')
    expect(errors).toEqual([])
    expect(returned).toEqual([{ tabIndex: 0 }, {}])
    // Base UI's own tabindex takes over here; with no Base UI under it the attribute is simply gone.
    expect(container.innerHTML).toBe('<button type="button">Pro</button>')
    act(() => { root.unmount() })
  })

  it('an item that is not the stop returns {} before and after hydration', async () => {
    const { errors, served, root } = await hydrate(false)
    expect(served).toBe('<button type="button">Pro</button>')
    expect(errors).toEqual([])
    expect(returned.at(-1)).toEqual({})
    expect(returned).not.toContainEqual({ tabIndex: 0 })
    act(() => { root.unmount() })
  })
})

describe('an item mounted after the page has hydrated', () => {
  it('returns {} from its first render: Base UI already owns the tab stop', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    containers.push(container)
    const root = createRoot(container)
    act(() => { root.render(<Item isStop />) })
    expect(returned).toEqual([{}])
    expect(container.innerHTML).toBe('<button type="button">Pro</button>')
    act(() => { root.unmount() })
  })
})
