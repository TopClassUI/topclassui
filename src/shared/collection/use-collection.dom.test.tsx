import { act, render, renderHook } from '@testing-library/react'
import type { CSSProperties } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useCollection } from './use-collection.js'

interface Row { id: string; label: string }

const makeItems = (n: number, prefix = 'r'): Row[] =>
  Array.from({ length: n }, (_, i) => ({ id: `${prefix}${String(i)}`, label: `Row ${String(i)}` }))

const getKey = (r: Row) => r.id

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', class {
    observe() { /* happy-dom never resizes */ }
    unobserve() { /* no-op */ }
    disconnect() { /* no-op */ }
  })
})

/** A real scroll container, since the hook measures clientHeight and listens for scroll. */
function List({ items, ...rest }: { items: Row[] } & Partial<Parameters<typeof useCollection<Row>>[0]>) {
  const c = useCollection<Row>({ items, getKey, ...rest })
  return (
    <div data-testid="scroller" ref={c.scrollRef} style={{ height: 360, overflow: 'auto' }}>
      <div style={{ height: c.paddingStart }} />
      {c.rows.map((row) => (
        <div key={row.key} ref={c.rowRef(row.index)} data-index={row.index}>{row.item.label}</div>
      ))}
      <div style={{ height: c.paddingEnd }} />
    </div>
  )
}

const renderedIndexes = (el: HTMLElement) =>
  [...el.querySelectorAll('[data-index]')].map((n) => Number(n.getAttribute('data-index')))

describe('when the list is small', () => {
  it('renders every row and does not virtualize', () => {
    const { result } = renderHook(() => useCollection<Row>({ items: makeItems(20), getKey }))
    expect(result.current.virtualized).toBe(false)
    expect(result.current.rows).toHaveLength(20)
    expect(result.current.paddingStart).toBe(0)
    expect(result.current.paddingEnd).toBe(0)
  })

  it('virtualize true turns it on below the threshold', () => {
    const { result } = renderHook(() =>
      useCollection<Row>({ items: makeItems(20), getKey, virtualize: true }),
    )
    expect(result.current.virtualized).toBe(true)
  })

  it('virtualize false keeps it off above the threshold', () => {
    const { result } = renderHook(() =>
      useCollection<Row>({ items: makeItems(5_000), getKey, virtualize: false }),
    )
    expect(result.current.virtualized).toBe(false)
    expect(result.current.rows).toHaveLength(5_000)
  })
})

describe('when the list is large', () => {
  it('virtualizes above the threshold and keeps the DOM small', () => {
    const { getByTestId } = render(<List items={makeItems(10_000)} />)
    expect(renderedIndexes(getByTestId('scroller')).length).toBeLessThan(100)
  })

  it('reports the full height, so the scrollbar matches the whole list', () => {
    const { result } = renderHook(() => useCollection<Row>({ items: makeItems(10_000), getKey }))
    expect(result.current.totalHeight).toBe(10_000 * 36)
    expect(result.current.totalCount).toBe(10_000)
  })

  it('every rendered row carries its real index', () => {
    const { getByTestId } = render(<List items={makeItems(10_000)} />)
    const indexes = renderedIndexes(getByTestId('scroller'))
    expect(indexes).toEqual([...indexes].sort((a, b) => a - b))
    expect(indexes[0]).toBe(0)
  })
})

describe('duplicate keys', () => {
  it('drops the second occurrence and warns, rather than letting React reuse a row', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const items = [...makeItems(3), { id: 'r1', label: 'Row 1 again' }]
    const { result } = renderHook(() => useCollection<Row>({ items, getKey }))
    expect(result.current.rows).toHaveLength(3)
    expect(warn).toHaveBeenCalledOnce()
    expect(warn.mock.calls[0]?.[0]).toContain('duplicate key')
    warn.mockRestore()
  })
})

describe('loading more', () => {
  // happy-dom lays out nothing: a box of 0 px is at its end, so each length is asked for once it is read.
  it('asks once when the list is at its end', () => {
    const loadMore = vi.fn()
    render(<List items={makeItems(20)} hasMore loadMore={loadMore} />)
    expect(loadMore).toHaveBeenCalledTimes(1)
  })

  it('does not ask again for the same items', () => {
    const loadMore = vi.fn()
    const items = makeItems(20)
    const { rerender } = render(<List items={items} hasMore loadMore={loadMore} />)
    rerender(<List items={items} hasMore loadMore={loadMore} />)
    rerender(<List items={items} hasMore loadMore={loadMore} />)
    expect(loadMore).toHaveBeenCalledTimes(1)
  })

  it('asks again once more items arrive', () => {
    const loadMore = vi.fn()
    const { rerender } = render(<List items={makeItems(20)} hasMore loadMore={loadMore} />)
    rerender(<List items={makeItems(40)} hasMore loadMore={loadMore} />)
    expect(loadMore).toHaveBeenCalledTimes(2)
  })

  it('never asks when there is no more to load', () => {
    const loadMore = vi.fn()
    render(<List items={makeItems(20)} hasMore={false} loadMore={loadMore} />)
    expect(loadMore).not.toHaveBeenCalled()
  })

  it('with no scroll container it asks for nothing: there is no end to be near', () => {
    const loadMore = vi.fn()
    renderHook(() => useCollection<Row>({ items: makeItems(20), getKey, hasMore: true, loadMore }))
    expect(loadMore).not.toHaveBeenCalled()
  })

  it('allows another attempt after a rejection', async () => {
    const loadMore = vi.fn().mockRejectedValue(new Error('offline'))
    const { rerender } = render(<List items={makeItems(20)} hasMore loadMore={loadMore} />)
    await act(async () => { await Promise.resolve() })
    rerender(<List items={makeItems(20)} hasMore={false} loadMore={loadMore} />)
    rerender(<List items={makeItems(20)} hasMore loadMore={loadMore} />)
    expect(loadMore).toHaveBeenCalledTimes(2)
  })
})

describe('scrolling to a row', () => {
  it('scrollToKey finds the row and moves the container', () => {
    const items = makeItems(10_000)
    let api: ReturnType<typeof useCollection<Row>> | null = null
    function Harness() {
      api = useCollection<Row>({ items, getKey })
      return <div data-testid="s" ref={api.scrollRef} style={{ height: 360, overflow: 'auto' }} />
    }
    const { getByTestId } = render(<Harness />)
    act(() => { api?.scrollToKey('r500', 'start') })
    expect(getByTestId('s').scrollTop).toBe(500 * 36)
  })

  // Row 100 spans 3,600 to 3,636 px of 360,000, in a list 360 px tall.
  function scroller(style?: CSSProperties) {
    const items = makeItems(10_000)
    let api: ReturnType<typeof useCollection<Row>> | null = null
    function Harness() {
      api = useCollection<Row>({ items, getKey })
      return <div data-testid="s" ref={api.scrollRef} style={style} />
    }
    const node = render(<Harness />).getByTestId('s')
    return { node, to: (index: number, at: number) => { measure(node, 360, 360_000, at); act(() => { api?.scrollToIndex(index) }) } }
  }

  it('scrollToIndex starts from where the list is: a row above goes to the top edge, one in view stays', () => {
    const { node, to } = scroller()
    to(100, 10_000)
    expect(node.scrollTop).toBe(3_600)
    to(100, 3_500)
    expect(node.scrollTop).toBe(3_500)
    to(100, 0)
    expect(node.scrollTop).toBe(3_276)
  })

  it('scrollToIndex lands a row where scrollIntoView would, past the list padding and inside its scroll padding', () => {
    const { node, to } = scroller({ paddingTop: 6, scrollPaddingTop: 4, scrollPaddingBottom: 4 })
    to(100, 10_000)
    expect(node.scrollTop).toBe(3_602)
    to(100, 0)
    expect(node.scrollTop).toBe(3_286)
    to(100, 3_500)
    expect(node.scrollTop).toBe(3_500)
  })

  it('ignores a key that is not in the list', () => {
    const items = makeItems(100)
    let api: ReturnType<typeof useCollection<Row>> | null = null
    function Harness() {
      api = useCollection<Row>({ items, getKey })
      return <div data-testid="s" ref={api.scrollRef} style={{ height: 360, overflow: 'auto' }} />
    }
    const { getByTestId } = render(<Harness />)
    act(() => { api?.scrollToKey('nope') })
    expect(getByTestId('s').scrollTop).toBe(0)
  })
})

/** happy-dom reports 0 for layout, so the scroll geometry is stubbed per node. */
function measure(node: HTMLElement, clientHeight: number, scrollHeight: number, scrollTop = 0) {
  Object.defineProperty(node, 'clientHeight', { value: clientHeight, configurable: true })
  Object.defineProperty(node, 'scrollHeight', { value: scrollHeight, configurable: true })
  Object.defineProperty(node, 'scrollTop', { value: scrollTop, writable: true, configurable: true })
}

describe('paging an unvirtualized list', () => {
  /** Rows of 40 px in a box of `box` px. Set before the hook sees the node, and never by a scroll
   * event after a rerender: a page that lands has to be read by the hook itself. */
  function Paged({ n, box, loadMore }: { n: number; box: number; loadMore: () => void }) {
    const c = useCollection<Row>({ items: makeItems(n), getKey, hasMore: true, loadMore, estimateRowHeight: 40 })
    const attach = (node: HTMLElement | null) => {
      if (node && !Object.hasOwn(node, 'clientHeight')) {
        Object.defineProperty(node, 'clientHeight', { value: box, configurable: true })
        Object.defineProperty(node, 'scrollHeight', { get: () => node.childElementCount * 40, configurable: true })
        Object.defineProperty(node, 'scrollTop', { value: 0, writable: true, configurable: true })
      }
      c.scrollRef(node)
    }
    return <div data-testid="s" ref={attach}>{c.rows.map((row) => <div key={row.key} />)}</div>
  }

  it('a list longer than its box asks for nothing on mount', () => {
    const loadMore = vi.fn()
    render(<Paged n={50} box={290} loadMore={loadMore} />)
    expect(loadMore).toHaveBeenCalledTimes(0)
  })

  it('a list shorter than its box asks once per page with no scroll, and stops once a page fills it', () => {
    const loadMore = vi.fn()
    const { rerender } = render(<Paged n={3} box={360} loadMore={loadMore} />)
    expect(loadMore).toHaveBeenCalledTimes(1)
    rerender(<Paged n={6} box={360} loadMore={loadMore} />)
    expect(loadMore).toHaveBeenCalledTimes(2)
    // 20 rows are 800 px: 440 px below a 360 px box is more than ten rows of 40 px, so nothing more is asked.
    rerender(<Paged n={20} box={360} loadMore={loadMore} />)
    expect(loadMore).toHaveBeenCalledTimes(2)
  })

  it('scrolled to the end, it asks once; the page that lands below that end is not followed by another', () => {
    const loadMore = vi.fn()
    const { rerender, getByTestId } = render(<Paged n={20} box={360} loadMore={loadMore} />)
    expect(loadMore).toHaveBeenCalledTimes(0)
    const node = getByTestId('s')
    node.scrollTop = 440
    act(() => { node.dispatchEvent(new Event('scroll')) })
    expect(loadMore).toHaveBeenCalledTimes(1)
    rerender(<Paged n={40} box={360} loadMore={loadMore} />)
    expect(loadMore).toHaveBeenCalledTimes(1)
    node.scrollTop = 1240
    act(() => { node.dispatchEvent(new Event('scroll')) })
    expect(loadMore).toHaveBeenCalledTimes(2)
  })
})

describe('a replaced container', () => {
  it('rebinds the scroll listener, so windowing does not freeze on the old node', () => {
    const items = makeItems(10_000)
    let api: ReturnType<typeof useCollection<Row>> | undefined
    const Harness = ({ which }: { which: string }) => {
      api = useCollection<Row>({ items, getKey })
      return <div key={which} data-testid={which} ref={api.scrollRef} />
    }
    const { rerender, getByTestId } = render(<Harness which="first" />)
    const first = getByTestId('first')
    measure(first, 360, 360_000, 0)
    act(() => { first.dispatchEvent(new Event('scroll')) })

    rerender(<Harness which="second" />)
    const second = getByTestId('second')
    expect(second).not.toBe(first)

    measure(second, 360, 360_000, 36_000)
    act(() => { second.dispatchEvent(new Event('scroll')) })
    expect(api?.rows[0]?.index ?? 0).toBeGreaterThan(0)
  })
})
