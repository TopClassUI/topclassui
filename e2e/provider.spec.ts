import { expect, test, type Page } from '@playwright/test'

import { DIRECTIONS, compileCss } from '../scripts/lib/harness.js'
import { openLive } from './live.js'

// The isolation root of TopClassProvider, where only a browser can judge it: paint order and layout.
// The live harness mounts the provider around every demo, as a root layout does, so its div is #demo's first child.

const ROOT = '#demo > div'
/** On tooltip--rtl the demo is a provider of its own: an island, whose div is the first child of the root. */
const ISLAND = `${ROOT} > div`

const openPopup = (page: Page) => page.locator('[data-placement][data-open]')

/** Focus opens the first tooltip, and focus keeps it open whatever is laid over the page afterwards. */
async function openTooltip(page: Page): Promise<void> {
  await page.keyboard.press('Tab')
  await expect(openPopup(page)).toBeVisible()
  const box = () => openPopup(page).evaluate((element) => JSON.stringify(element.getBoundingClientRect()))
  // Placed in a frame or two: measured only once two readings agree.
  await expect(async () => {
    const first = await box()
    await page.waitForTimeout(50)
    expect(await box()).toBe(first)
  }).toPass({ timeout: 5_000 })
}

/** A layer over the whole viewport, as a sticky bar or a cookie notice with a careless z-index would be. */
const addLayer = (page: Page, parent: string, id: string, zIndex: number) => page.evaluate((layer) => {
  const element = document.createElement('div')
  element.id = layer.id
  element.style.cssText = `position: fixed; inset: 0; z-index: ${String(layer.zIndex)}; background: rgb(255 0 0 / 0.2)`
  const target = document.querySelector(layer.parent)
  if (!target) throw new Error(`nothing matches ${layer.parent}`)
  target.append(element)
}, { parent, id, zIndex })

/** What is painted on top at a point: the open popup, or the id of whatever covers it. */
const topmostAt = (page: Page, point: { x: number, y: number } | 'popup') => page.evaluate((at) => {
  const popup = document.querySelector('[data-placement][data-open]')
  const box = popup?.getBoundingClientRect()
  const { x, y } = at === 'popup' ? { x: (box?.left ?? 0) + (box?.width ?? 0) / 2, y: (box?.top ?? 0) + (box?.height ?? 0) / 2 } : at
  const hit = document.elementFromPoint(x, y)
  if (hit && popup?.contains(hit)) return 'the popup'
  return hit?.id || hit?.tagName.toLowerCase() || 'nothing'
}, point)

const shapeOf = (page: Page, selector: string) => page.locator(selector).first().evaluate((element) => {
  const style = getComputedStyle(element)
  return { classes: element.getAttribute('class'), display: style.display, isolation: style.isolation, height: element.getBoundingClientRect().height }
})

test.describe('a page element at z-index 9999', () => {
  for (const direction of DIRECTIONS) {
    test(`${direction}: stays under an open tooltip`, async ({ page }) => {
      await openLive(page, 'tooltip--basic', { direction })
      await openTooltip(page)
      await addLayer(page, ROOT, 'page-layer', 9999)
      expect(await topmostAt(page, 'popup')).toBe('the popup')
      // And the layer is really there: beside the popup it is what a click would land on.
      expect(await topmostAt(page, { x: 640, y: 600 })).toBe('page-layer')
    })
  }

  test('the isolation root is a block that isolates, the height of the button inside it', async ({ page }) => {
    await openLive(page, 'tooltip--basic')
    // An element with display: contents has no box at all, and isolate on it creates no stacking context.
    expect(await shapeOf(page, ROOT)).toEqual({ classes: 'isolate', display: 'block', isolation: 'isolate', height: 40 })
  })

  test('the same layer outside the provider does cover the popup, so the test above can tell the two apart', async ({ page }) => {
    await openLive(page, 'tooltip--basic')
    await openTooltip(page)
    await addLayer(page, 'body', 'outside-layer', 9999)
    expect(await topmostAt(page, 'popup')).toBe('outside-layer')
  })

  test('with display: contents back on the root, the layer covers the popup: the fault this file guards', async ({ page }) => {
    await openLive(page, 'tooltip--basic')
    await openTooltip(page)
    await addLayer(page, ROOT, 'page-layer', 9999)
    await page.locator(ROOT).evaluate((element) => { (element as HTMLElement).style.display = 'contents' })
    expect(await topmostAt(page, 'popup')).toBe('page-layer')
  })
})

test.describe('an RTL island, a provider inside the provider', () => {
  test('adds no box and no second stacking context: its z-index is weighed against the page around it', async ({ page }) => {
    await openLive(page, 'tooltip--rtl', { direction: 'ltr' })
    expect(await shapeOf(page, ROOT)).toMatchObject({ classes: 'isolate', display: 'block' })
    expect(await shapeOf(page, ISLAND)).toEqual({ classes: 'contents', display: 'contents', isolation: 'auto', height: 0 })

    await addLayer(page, ISLAND, 'island-layer', 9999)
    await addLayer(page, ROOT, 'page-layer', 1)
    // A second stacking context would trap the 9999 under the page's 1: measured, with a box on the island.
    expect(await topmostAt(page, { x: 640, y: 600 })).toBe('island-layer')
  })

  test('a tooltip opened inside the island paints above a 9999 of the island and a 9999 of the page', async ({ page }) => {
    await openLive(page, 'tooltip--rtl', { direction: 'ltr' })
    await openTooltip(page)
    await addLayer(page, ISLAND, 'island-layer', 9999)
    expect(await topmostAt(page, 'popup')).toBe('the popup')
    await addLayer(page, ROOT, 'page-layer', 9999)
    expect(await topmostAt(page, 'popup')).toBe('the popup')
  })

  test('the root element of an island is still laid out by the page: a flex item beside its neighbour', async ({ page }) => {
    await openLive(page, 'tooltip--rtl', { direction: 'ltr' })
    const widths = await page.evaluate(([rootSelector, islandSelector]) => {
      const root = document.querySelector(rootSelector ?? '')
      const island = document.querySelector(islandSelector ?? '')
      const own = island?.firstElementChild
      if (!root || !island || !(own instanceof HTMLElement)) throw new Error('the island is not where the demo puts it')
      const row = document.createElement('div')
      row.style.cssText = 'display: flex; width: 600px'
      const neighbour = document.createElement('div')
      neighbour.style.flex = '1'
      own.style.flex = '1'
      root.append(row)
      row.append(neighbour, island)
      return { neighbour: neighbour.getBoundingClientRect().width, island: own.getBoundingClientRect().width }
    }, [ROOT, ISLAND])
    // With a box of its own the island's div would be the flex item, and its root 108 px wide.
    expect(widths).toEqual({ neighbour: 300, island: 300 })
  })
})

/** The classes the small pages below are written in, compiled by the repo's own Tailwind entry. */
const APP_CLASSES = [
  'flex', 'flex-col', 'flex-1', 'min-h-dvh', 'grid', 'grid-rows-[auto_1fr_auto]',
  'h-full', 'min-h-full', 'h-10', 'mx-auto', 'max-w-3xl', 'my-4',
]

interface Layout {
  html?: string
  body?: string
  /** What the app passes as className: the provider puts it after its own class (provider.isolation.dom.test). */
  given?: string
  /** An element of the app that sits outside the provider, before it. */
  outside?: string
  children: string
}

test.describe('the one more box between body and the app', () => {
  let css = ''
  test.beforeAll(async () => { css = await compileCss(process.cwd(), APP_CLASSES) })

  /** Rebuilds the page around the root the provider rendered, and measures the element with id="probe". */
  async function lay(page: Page, layout: Layout) {
    await openLive(page, 'tooltip--basic')
    await page.addStyleTag({ content: css })
    return page.evaluate(({ rootSelector, html = '', body = '', given = '', outside = '', children }) => {
      const root = document.querySelector(rootSelector)
      if (!root) throw new Error('the provider rendered no root')
      document.documentElement.className = html
      document.body.className = body
      document.body.innerHTML = outside
      document.body.append(root)
      const own = root.getAttribute('class') ?? ''
      if (given) root.setAttribute('class', `${own} ${given}`)
      root.innerHTML = children
      const probe = document.getElementById('probe')
      if (!probe) throw new Error('the layout names no probe')
      const { top, bottom, width, height } = probe.getBoundingClientRect()
      return { root: root.getAttribute('class'), top, bottom, width, height, pageHeight: document.documentElement.scrollHeight }
    }, { rootSelector: ROOT, ...layout })
  }

  const BARS = '<header class="h-10">header</header><main class="flex-1">main</main><footer id="probe" class="h-10">footer</footer>'

  test('a plain page is laid out as before: a centred container keeps its width, and margins still collapse', async ({ page }) => {
    const container = await lay(page, { children: '<main id="probe" class="mx-auto max-w-3xl">short</main>' })
    expect(container).toMatchObject({ root: 'isolate', width: 768 })
    const second = await lay(page, { children: '<p class="my-4">first</p><p id="probe" class="my-4">second</p>' })
    // 16 + 24 + 16 + 0: one margin between the two, not two.
    expect(second.top).toBe(56)
  })

  test('body as a flex column: flex-1 no longer pushes the footer down, until the classes move to the provider', async ({ page }) => {
    const asBefore = await lay(page, { body: 'flex min-h-dvh flex-col', children: BARS })
    // 40 + 24 + 40: the three bars stacked at their own heights, in a root that is one flex item.
    expect(asBefore.bottom).toBe(104)
    const moved = await lay(page, { given: 'flex min-h-dvh flex-col', children: BARS })
    expect(moved).toMatchObject({ root: 'isolate flex min-h-dvh flex-col', bottom: 720 })
  })

  test('body as a grid: the rows no longer reach the three bars, until the classes move to the provider', async ({ page }) => {
    const asBefore = await lay(page, { body: 'grid min-h-dvh grid-rows-[auto_1fr_auto]', children: BARS })
    expect(asBefore.bottom).toBe(104)
    const moved = await lay(page, { given: 'grid min-h-dvh grid-rows-[auto_1fr_auto]', children: BARS })
    expect(moved.bottom).toBe(720)
  })

  for (const height of ['h-full', 'min-h-full']) {
    test(`a child with ${height} under html and body of h-full collapses to its text, until the provider takes h-full too`, async ({ page }) => {
      const children = `<div id="probe" class="${height}">app</div>`
      expect((await lay(page, { html: 'h-full', body: 'h-full', children })).height).toBe(24)
      expect((await lay(page, { html: 'h-full', body: 'h-full', given: 'h-full', children })).height).toBe(720)
    })
  }

  test('a child with min-h-dvh fills the screen with no change: it never asked its parent', async ({ page }) => {
    expect((await lay(page, { children: '<div id="probe" class="min-h-dvh">app</div>' })).height).toBe(720)
  })

  test('the root takes no height of its own: h-full as a default would scroll a page with a bar outside the provider', async ({ page }) => {
    const layout = { html: 'h-full', body: 'h-full', outside: '<div class="h-10">notice</div>', children: '<p id="probe">short</p>' }
    expect((await lay(page, layout)).pageHeight).toBe(720)
    // 720 of root under 40 of notice: the reason the default is a plain block.
    expect((await lay(page, { ...layout, given: 'h-full' })).pageHeight).toBe(760)
  })
})
