import { expect, test, type Page } from '@playwright/test'

import { DIRECTIONS } from '../scripts/lib/harness.js'
import { urlFor } from './pages.js'

// Measured, because a class list cannot see it: every unit test passed while twenty avatars
// scrolled a phone sideways, +12,345 read "12,34" and an avatar inside a link lost its ring.

/** Every demo, written out, so a deleted one fails here. */
const DEMOS = ['counts', 'custom-size', 'four', 'linked', 'many', 'max', 'on-card', 'overflow', 'rtl', 'sizes', 'two']

/** The control scale in CSS px, which an avatar and the counter beside it both measure. */
const SCALE = [28, 32, 40, 48, 56]

/** Runs in the page: each group against its children, its parent and the page. */
function probe() {
  const SLACK = 0.5
  const groups = [...document.querySelectorAll('[role="group"]')].map((group) => {
    const box = group.getBoundingClientRect()
    const parent = (group.parentElement ?? group).getBoundingClientRect()
    const kids = [...group.children].map((kid) => kid.getBoundingClientRect())
    const rtl = getComputedStyle(group).direction === 'rtl'
    const tops = [...new Set(kids.map((kid) => Math.round(kid.top)))]
    return {
      name: group.getAttribute('aria-label') ?? '',
      rows: tops.length,
      width: box.width,
      strayChildren: kids.filter((kid) => kid.left < box.left - SLACK || kid.right > box.right + SLACK
        || kid.top < box.top - SLACK || kid.bottom > box.bottom + SLACK).length,
      pastParent: Math.max(box.right - parent.right, parent.left - box.left) > SLACK,
      // How far the first child of each row sits from the group's own starting edge.
      rowStarts: tops.map((top) => {
        const row = kids.filter((kid) => Math.round(kid.top) === top)
        return Math.round(rtl ? box.right - Math.max(...row.map((kid) => kid.right)) : Math.min(...row.map((kid) => kid.left)) - box.left)
      }),
      // From one child's starting edge to the next one's: the avatar less the overlap.
      steps: [...new Set(kids.slice(1).map((kid, i) => Math.round(Math.abs(kid.left - (kids[i]?.left ?? 0)))))],
    }
  })
  // The body, not the root: the harness keeps a stable scrollbar gutter the root still counts.
  return { groups, scrollWidth: document.documentElement.scrollWidth, pageWidth: document.body.clientWidth }
}

type Clip = { x: number; y: number; width: number; height: number }

/** The pixels of a clip as a flat [r, g, b, a, ...], decoded in the browser so no image library is needed. */
async function pixelsOf(page: Page, clip: Clip): Promise<number[]> {
  const png = await page.screenshot({ clip, animations: 'disabled' })
  return page.evaluate(async (base64) => {
    const image = new Image()
    image.src = `data:image/png;base64,${base64}`
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    const pen = canvas.getContext('2d')
    if (!pen) throw new Error('no canvas')
    pen.drawImage(image, 0, 0)
    return [...pen.getImageData(0, 0, image.width, image.height).data]
  }, png.toString('base64'))
}

/** How many pixels are text: the digits are dark, and the fill, the ring and the page are not. */
const inkIn = (pixels: number[]) => pixels.filter((value, index) => index % 4 === 0 && value < 200).length

/** The ring of the second child where it crosses the first, on the centre line. */
async function ringBetween(page: Page, direction: string) {
  const second = await page.locator('#demo [role="group"] > :nth-child(2)').boundingBox()
  if (!second) throw new Error('no second avatar to measure')
  const x = direction === 'rtl' ? second.x + second.width : second.x - 1
  return (await pixelsOf(page, { x, y: second.y + second.height / 2, width: 1, height: 1 })).slice(0, 3)
}

for (const width of [320, 390]) {
  test.describe(`on a phone ${String(width)} px wide`, () => {
    test.use({ viewport: { width, height: 800 } })

    for (const direction of DIRECTIONS) {
      for (const demo of DEMOS) {
        test(`${demo} ${direction}: the group stays inside its container and the page`, async ({ page }) => {
          await page.goto(urlFor(`avatar-group--${demo}`, 'light', direction))
          const { groups, scrollWidth, pageWidth } = await page.evaluate(probe)
          expect(groups.length, 'no group on this page').toBeGreaterThan(0)
          expect(scrollWidth, 'the page scrolls sideways').toBeLessThanOrEqual(pageWidth)
          for (const group of groups) {
            expect(group.strayChildren, `${group.name}: a child lies outside the group`).toBe(0)
            expect(group.pastParent, `${group.name}: the group is wider than its container`).toBe(false)
            expect(group.rowStarts.every((start) => start === 0), `${group.name}: a row starts off the edge`).toBe(true)
          }
        })
      }

      test(`many ${direction}: twenty avatars and the counter wrap onto three rows`, async ({ page }) => {
        await page.goto(urlFor('avatar-group--many', 'light', direction))
        expect((await page.evaluate(probe)).groups.map((group) => group.rows)).toEqual([3])
      })
    }
  })
}

for (const direction of DIRECTIONS) {
  test(`many ${direction}: on a desktop it is one row, 680 px wide, exactly as before it could wrap`, async ({ page }) => {
    await page.goto(urlFor('avatar-group--many', 'light', direction))
    const { groups } = await page.evaluate(probe)
    expect(groups.map((group) => [group.rows, group.width, group.steps])).toEqual([[1, 680, [32]]])
  })

  test(`sizes ${direction}: the overlap is half a step at xs and sm, and covers no initials`, async ({ page }) => {
    await page.goto(urlFor('avatar-group--sizes', 'light', direction))
    const { groups } = await page.evaluate(probe)
    expect(groups.map((group) => group.steps)).toEqual([[24], [28], [32], [40], [48]])

    const hidden = await page.locator('#demo [role="group"] > :not(:last-child)').evaluateAll((avatars) => avatars.map((avatar) => {
      const next = avatar.nextElementSibling?.getBoundingClientRect() ?? new DOMRect()
      const range = document.createRange()
      range.selectNodeContents(avatar)
      const ink = range.getBoundingClientRect()
      // The ring is two pixels outside the next avatar, on the side it overlaps from.
      const under = getComputedStyle(avatar).direction === 'rtl' ? next.right + 2 - ink.left : ink.right - (next.left - 2)
      return Math.max(under, 0)
    }))
    expect(hidden).toHaveLength(15)
    // Two pixels of slack for another font: a whole step hid 4.5 px of "OA" at xs.
    for (const under of hidden) expect(under, 'initials sit under the next avatar').toBeLessThanOrEqual(2)
  })

  test(`linked ${direction}: a link around an avatar is ringed as a circle, over the one before`, async ({ page }) => {
    await page.goto(urlFor('avatar-group--linked', 'light', direction))
    const links = await page.locator('#demo [role="group"] > a').evaluateAll((all) => all.map((link) => {
      const [box, avatar] = [link.getBoundingClientRect(), link.firstElementChild?.getBoundingClientRect()]
      return { box: [box.width, box.height], avatar: [avatar?.width, avatar?.height], round: Number.parseFloat(getComputedStyle(link).borderTopLeftRadius) >= 24 }
    }))
    expect(links).toEqual([1, 2, 3].map(() => ({ box: [48, 48], avatar: [48, 48], round: true })))
    expect(await ringBetween(page, direction), 'the first avatar paints over the ring of the second').toEqual([255, 255, 255])

    // Tab to the second link: its focus ring must also show on the side the third avatar covers.
    const second = page.locator('#demo [role="group"] > a').nth(1)
    const box = await second.boundingBox()
    if (!box) throw new Error('no second link to measure')
    const far = { x: direction === 'rtl' ? box.x - 2 : box.x + box.width, y: box.y + 22, width: 2, height: 4 }
    const atRest = await page.screenshot({ clip: far, animations: 'disabled' })
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await expect(second).toBeFocused()
    expect(Buffer.compare(atRest, await page.screenshot({ clip: far, animations: 'disabled' })), 'the next avatar hides the focus ring').not.toBe(0)
  })
}

test('counts: no count is cut, from +99 at xs to +12,345 at xl, and a long one makes a pill', async ({ page }) => {
  await page.goto(urlFor('avatar-group--counts', 'light', 'ltr'))
  const counters = page.locator('#demo [role="group"] > :last-child')
  const found = await counters.evaluateAll((all) => all.map((counter) => {
    const box = counter.getBoundingClientRect()
    const range = document.createRange()
    range.selectNodeContents(counter)
    const ink = range.getBoundingClientRect()
    return { text: counter.textContent, width: box.width, height: box.height, spare: Math.min(ink.left - box.left, box.right - ink.right) }
  }))
  expect(found.map((counter) => counter.text)).toEqual(SCALE.flatMap(() => ['+99', '+999', '+12,345']))
  expect(found.map((counter) => counter.height)).toEqual(SCALE.flatMap((px) => [px, px, px]))
  for (const [index, counter] of found.entries()) {
    const name = `${counter.text} at ${String(counter.height)} px`
    expect(counter.width, `${name}: narrower than a circle`).toBeGreaterThanOrEqual(counter.height)
    expect(counter.spare, `${name}: the digits reach the edge`).toBeGreaterThanOrEqual(3)
    if (counter.text === '+12,345') expect(counter.width, `${name}: not a pill`).toBeGreaterThan(counter.height + 8)

    // The pixels too: with the clip taken off, a counter that cut nothing shows no more ink.
    const box = await counters.nth(index).boundingBox()
    if (!box) throw new Error('no counter to measure')
    const around = { x: box.x - 12, y: box.y, width: box.width + 24, height: box.height }
    const clipped = inkIn(await pixelsOf(page, around))
    await counters.nth(index).evaluate((el) => { (el as HTMLElement).style.overflow = 'visible' })
    expect(clipped, `${name}: no digits were painted`).toBeGreaterThan(20)
    expect(inkIn(await pixelsOf(page, around)) - clipped, `${name}: pixels of ink were cut`).toBe(0)
  }
})

test('custom-size: one class on the group sizes every avatar and the counter alike', async ({ page }) => {
  await page.goto(urlFor('avatar-group--custom-size', 'light', 'ltr'))
  const boxes = await page.locator('#demo [role="group"] > *').evaluateAll((all) => all.map((el) => {
    const box = el.getBoundingClientRect()
    return [box.width, box.height]
  }))
  expect(boxes).toEqual([[64, 64], [64, 64], [64, 64]])
})

/** The page and a Card in each mode, written out: only in dark do the two differ. */
const SURFACES = [
  { mode: 'light', page: [255, 255, 255], card: [255, 255, 255] },
  { mode: 'dark', page: [10, 10, 10], card: [38, 38, 38] },
  { mode: 'ocean', page: [255, 255, 255], card: [255, 255, 255] },
] as const

for (const surface of SURFACES) {
  test(`${surface.mode}: the ring is the page colour, and on a Card the colour the caller gives it`, async ({ page }) => {
    await page.goto(urlFor('avatar-group--overflow', surface.mode, 'ltr'))
    expect(await ringBetween(page, 'ltr')).toEqual(surface.page)
    await page.goto(urlFor('avatar-group--on-card', surface.mode, 'ltr'))
    expect(await ringBetween(page, 'ltr')).toEqual(surface.card)
  })
}

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`forced colours, ${scheme} palette`, () => {
    test.use({ forcedColors: 'active', colorScheme: scheme })

    test('the ring is gone, and every avatar and the counter keep an edge that tells them apart', async ({ page }) => {
      await page.goto(urlFor('avatar-group--overflow', 'light', 'ltr'))
      const edges = await page.locator('#demo [role="group"] > *').evaluateAll((all) => all.map((el) => {
        const style = getComputedStyle(el)
        return { ring: style.boxShadow, edge: `${style.outlineStyle} ${style.outlineWidth}` }
      }))
      expect(edges).toEqual([1, 2, 3, 4, 5].map(() => ({ ring: 'none', edge: 'solid 1px' })))
    })
  })
}
