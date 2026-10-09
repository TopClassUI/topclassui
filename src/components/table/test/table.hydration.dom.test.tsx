// PLAN section 20: the server render must hydrate with no recoverable error.
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { act, createElement, type ComponentType, type ReactElement } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Table } from '../index.js'
import type { TableColumn } from '../types.js'

// Read from the folder, or a demo added later is never hydrated and nobody notices.
const DUMMY = join(import.meta.dirname, '..', 'dummy')
const names = readdirSync(DUMMY).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)).sort()
const DEMOS = await Promise.all(names.map(async (name) => {
  const loaded = await import(`../dummy/${name}.tsx`) as { default: ComponentType }
  return [name, loaded.default] as const
}))

interface Invoice { id: string; number: string; amount: number }

const invoices: Invoice[] = [
  { id: 'a', number: 'INV-1', amount: 120 },
  { id: 'b', number: 'INV-2', amount: 80 },
]

const columns: TableColumn<Invoice>[] = [
  { key: 'number', header: 'Invoice', sortHref: '?sort=number', cell: (invoice) => invoice.number },
  { key: 'amount', header: 'Amount', align: 'end', cell: (invoice) => invoice.amount },
]

afterEach(() => { vi.restoreAllMocks() })

/** Hydrate the server HTML and report anything React considers a mismatch. */
async function hydrate(element: ReactElement) {
  const errors: unknown[] = []
  const onError = vi.spyOn(console, 'error').mockImplementation((...args) => { errors.push(args[0]) })

  const container = document.createElement('div')
  container.innerHTML = renderToString(element)
  document.body.appendChild(container)

  await act(() => {
    hydrateRoot(container, element, { onRecoverableError: (e) => { errors.push(e) } })
    return Promise.resolve()
  })

  // useId is the one value the two renders could disagree on, so read it after hydration.
  const named = [...container.querySelectorAll('[role="region"]')]
    .every((region) => region.querySelector('caption')?.id === region.getAttribute('aria-labelledby'))

  onError.mockRestore()
  container.remove()
  return { errors, named }
}

describe('a server-rendered Table hydrates cleanly', () => {
  it('reports nothing for rows, a sort link and a sorted column', async () => {
    const element = (
      <Table
        caption="Invoices"
        items={invoices}
        getKey={(invoice) => invoice.id}
        columns={columns}
        sort={{ key: 'number', direction: 'ascending' }}
      />
    )
    expect(await hydrate(element)).toEqual({ errors: [], named: true })
  })

  it('reports nothing for the empty row', async () => {
    const element = <Table caption="Invoices" items={[]} getKey={(invoice: Invoice) => invoice.id} columns={columns} />
    expect(await hydrate(element)).toEqual({ errors: [], named: true })
  })

  it('reports nothing for two tables, whose caption ids come from useId on both sides', async () => {
    const element = (
      <>
        <Table striped stickyFirstColumn caption="First" items={invoices} getKey={(invoice) => invoice.id} columns={columns} />
        <Table captionVisible caption="Second" items={invoices} getKey={(invoice) => invoice.id} columns={columns} />
      </>
    )
    expect(await hydrate(element)).toEqual({ errors: [], named: true })
  })
})

describe('every demo renders and hydrates', () => {
  it('found the demo folder, so an empty list cannot pass', () => {
    expect(DEMOS.length).toBeGreaterThan(5)
  })

  for (const [name, Demo] of DEMOS) {
    it(`${name} renders on the server without throwing`, () => {
      expect(() => renderToString(createElement(Demo))).not.toThrow()
    })

    it(`${name} hydrates with no recoverable error`, async () => {
      expect(await hydrate(createElement(Demo))).toEqual({ errors: [], named: true })
    })
  }
})
