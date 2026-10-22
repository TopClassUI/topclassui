import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { armMotion } from './motion.js'

/** Every box read and every attribute written, in order. */
const log: string[] = []

/** A box around a block, laid out where the browser skips the block's content (content-visibility: auto); top and bottom 0 is a display: contents wrapper. */
class Around {
  readonly measured: string[] = []
  constructor(readonly name: string, readonly top: number, readonly bottom: number, readonly parentElement: Around | null = null) {}
  getBoundingClientRect() {
    this.measured.push(this.name)
    log.push(`measure ${this.name}`)
    const empty = this.top === 0 && this.bottom === 0
    return { top: this.top, bottom: this.bottom, width: empty ? 0 : 1200, height: this.bottom - this.top }
  }
}

/** A [data-motion] block with its [data-count] runs; asking where it is throws, since arming must read no layout. */
class Block {
  readonly attributes = new Set<string>()
  readonly runs: { dataset: Record<string, string>; style: { setProperty: (name: string, value: string) => void }; set: Map<string, string> }[]
  readonly dataset: Record<string, string>
  constructor(motion: string, counts: string[] = [], readonly parentElement: Around | null = null) {
    this.dataset = { motion }
    this.runs = counts.map((count) => {
      const set = new Map<string, string>()
      return { dataset: { count }, style: { setProperty: (name: string, value: string) => { set.set(name, value) } }, set }
    })
  }
  hasAttribute(name: string) { return this.attributes.has(name) }
  setAttribute(name: string) {
    this.attributes.add(name)
    log.push(`${this.dataset['motion'] ?? ''} ${name}`)
  }
  removeAttribute(name: string) { this.attributes.delete(name) }
  querySelectorAll() { return this.runs }
  getBoundingClientRect(): never { throw new Error('a layout read') }
}

/** The observer, fired by hand: each report carries the box the browser measured after its layout. */
class Observer {
  static made: Observer[] = []
  readonly watched = new Set<unknown>()
  constructor(readonly callback: (entries: unknown[]) => void, readonly options: unknown) { Observer.made.push(this) }
  observe(target: unknown) { this.watched.add(target) }
  unobserve(target: unknown) { this.watched.delete(target) }
  disconnect() { this.watched.clear() }
  report(...reports: { target: Block; top: number; isIntersecting: boolean; skipped?: boolean }[]) {
    this.callback(reports.map(({ target, top, isIntersecting, skipped = false }) => ({
      target,
      isIntersecting,
      boundingClientRect: skipped ? { top: 0, width: 0, height: 0 } : { top, width: 320, height: 200 },
    })))
  }
}

let knob = '1'
let viewTimeline = false
const style = vi.fn(() => ({ getPropertyValue: () => ` ${knob}` }))

function arm(...blocks: Block[]) {
  const doc = { defaultView: { innerHeight: 800 }, documentElement: {}, querySelectorAll: () => blocks }
  const release = armMotion(doc as unknown as Document)
  const observer = Observer.made.at(-1)
  if (observer === undefined) throw new Error('no observer')
  return { release, observer }
}

beforeEach(() => {
  knob = '1'
  viewTimeline = false
  log.length = 0
  Observer.made = []
  style.mockClear()
  vi.stubGlobal('IntersectionObserver', Observer)
  vi.stubGlobal('getComputedStyle', style)
  vi.stubGlobal('CSS', { supports: () => viewTimeline })
  vi.stubGlobal('matchMedia', () => ({ matches: true }))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('armMotion', () => {
  it('reads no layout and no style while it arms: every block waits for the first report', () => {
    const numbers = new Block('count', ['46'])
    const chips = new Block('stagger')
    const { observer } = arm(numbers, chips)
    expect(style).not.toHaveBeenCalled()
    expect([...observer.watched]).toEqual([numbers, chips])
    expect(observer.options).toEqual({ rootMargin: '0px 0px -10% 0px' })
    expect([...numbers.attributes, ...chips.attributes]).toEqual([])
  })

  it('on the first report, holds a block that starts below the screen and lets go of one on it', () => {
    const numbers = new Block('count', ['46', '8'])
    const hero = new Block('stagger')
    const { observer } = arm(numbers, hero)
    observer.report({ target: numbers, top: 800, isIntersecting: false }, { target: hero, top: 799, isIntersecting: true })
    expect([...numbers.attributes]).toEqual(['data-motion-wait'])
    expect(numbers.runs.map((run) => run.set.get('--docs-count-to'))).toEqual(['46', '8'])
    expect([...hero.attributes]).toEqual([])
    expect([...observer.watched]).toEqual([numbers])
    expect(style).toHaveBeenCalledTimes(1)
  })

  it('plays a held block once, when it scrolls in', () => {
    const chips = new Block('stagger')
    const { observer } = arm(chips)
    observer.report({ target: chips, top: 1200, isIntersecting: false })
    observer.report({ target: chips, top: 900, isIntersecting: false })
    expect([...chips.attributes]).toEqual(['data-motion-wait'])
    observer.report({ target: chips, top: 600, isIntersecting: true })
    expect([...chips.attributes]).toEqual(['data-motion-play'])
    expect([...observer.watched]).toEqual([])
  })

  it('holds nothing where --tc-motion is 0, and stops watching', () => {
    knob = '0'
    const chips = new Block('stagger')
    const { observer } = arm(chips)
    observer.report({ target: chips, top: 1200, isIntersecting: false })
    expect([...chips.attributes]).toEqual([])
    expect([...observer.watched]).toEqual([])
  })

  it('leaves a reveal to the CSS where the browser ties it to the scroll, and a block that has played', () => {
    viewTimeline = true
    const section = new Block('reveal')
    const played = new Block('stagger')
    played.setAttribute('data-motion-play')
    const chips = new Block('stagger')
    const { observer } = arm(section, played, chips)
    expect([...observer.watched]).toEqual([chips])
  })

  it('inside content the browser skips, asks the outermost box wholly below the screen, never the block', () => {
    const html = new Around('html', -1200, 5000)
    const island = new Around('island', 0, 0, html)
    const main = new Around('main', -1100, 4800, island)
    const section = new Around('section', 1400, 2200, main)
    const list = new Around('list', 0, 0, section)
    const numbers = new Block('count', ['46'], list)
    const { observer } = arm(numbers)
    observer.report({ target: numbers, top: 0, isIntersecting: false, skipped: true })
    expect([...numbers.attributes]).toEqual(['data-motion-wait'])
    expect([html, island, main, section, list].flatMap((box) => box.measured)).toEqual(['html', 'island', 'main', 'section'])
  })

  it('measures every skipped block before it holds any, so no hold lays the page out again', () => {
    const html = new Around('html', -100, 5000)
    const numbers = new Block('count', [], new Around('numbers', 1400, 2200, html))
    const chips = new Block('stagger', [], new Around('chips', 2600, 3400, html))
    const { observer } = arm(numbers, chips)
    observer.report({ target: numbers, top: 0, isIntersecting: false, skipped: true }, { target: chips, top: 0, isIntersecting: false, skipped: true })
    expect(log).toEqual(['measure html', 'measure numbers', 'measure html', 'measure chips', 'count data-motion-wait', 'stagger data-motion-wait'])
  })

  it('and lets go of a skipped block whose box lies wholly above the screen, as on a page reopened scrolled down', () => {
    const html = new Around('html', -4000, 2000)
    const section = new Around('section', -3000, -2200, html)
    const chips = new Block('stagger', [], section)
    const { observer } = arm(chips)
    observer.report({ target: chips, top: 0, isIntersecting: false, skipped: true })
    expect([...chips.attributes]).toEqual([])
    expect([...observer.watched]).toEqual([])
  })

  it('lets go of every held block on the way out, and ignores a report that lands after it', () => {
    const numbers = new Block('count', ['46'])
    const chips = new Block('stagger')
    const { release, observer } = arm(numbers, chips)
    observer.report({ target: numbers, top: 900, isIntersecting: false })
    release()
    observer.report({ target: chips, top: 900, isIntersecting: false })
    expect([...numbers.attributes, ...chips.attributes]).toEqual([])
  })
})
