import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { expect, test, type Locator, type Page } from '@playwright/test'

import { callsUseCollection, takesLoadMore } from '../scripts/lib/collections.js'
import { liveErrors, openLive } from './live.js'
import { atRest, openOverlay } from './overlay.js'
import { DEMOS } from './pages.js'

// R-8.5-1 in a browser, for every component check-structure finds calling useCollection: its ten-thousand demo keeps
// fewer rows mounted than it has items wherever it is scrolled, and its load-more demo asks for a page at the end.

const COMPONENTS = join(process.cwd(), 'src', 'components')
const MOST_MOUNTED = 100

interface Driver {
  /** Opens a demo of the component and returns the element its rows scroll in. */
  open: (page: Page, demo: string) => Promise<Locator>
  /** One row, inside that element. */
  row: string
  /** The name of the last of the ten thousand. */
  last: string
}

const comboboxNames: Record<string, string> = { 'combobox--ten-thousand': 'Ten thousand options', 'combobox--load-more': 'Search results' }
const commandNames: Record<string, string> = { 'command--ten-thousand': 'Ten thousand commands', 'command--load-more': 'Search results' }

/** The lists that follow R-8.5-1 without windowing, each by the external constraint that stops it: the load-more loop
 * still runs for them, the ten-thousand loop does not. */
const UNWINDOWED: Record<string, string> = {
  select: 'Base UI SelectRoot.js:292-306 moves real focus over the mounted items, with no virtual option',
}

const DRIVERS: Record<string, Driver> = {
  combobox: {
    open: async (page, demo) => {
      await openLive(page, demo)
      await page.getByRole('combobox', { name: comboboxNames[demo] ?? '', exact: true }).click()
      await atRest(page.locator('[data-placement]'))
      return page.getByRole('listbox')
    },
    row: '[role="option"]',
    last: 'Option 10000',
  },
  command: {
    open: async (page, demo) => {
      await openLive(page, demo)
      await openOverlay(page, page.locator('#demo button').filter({ hasText: commandNames[demo] ?? '' }))
      return page.locator('[role="dialog"] [role="listbox"]')
    },
    row: '[role="option"]',
    last: 'Pin page 10000',
  },
  'file-upload': {
    open: async (page, demo) => {
      await openLive(page, demo)
      // Ten thousand text files into an images-only upload: every one is refused, and each is a row of the list.
      const files = Array.from({ length: 10_000 }, (_, index) => ({ name: `File ${String(index + 1)}.txt`, mimeType: 'text/plain', buffer: Buffer.from('') }))
      await page.locator('#demo input[type="file"]').setInputFiles(files)
      return page.locator('#demo ul[role="list"]')
    },
    row: 'li[data-index]',
    last: 'File 10000.txt',
  },
  select: {
    open: async (page, demo) => {
      await openLive(page, demo)
      await page.getByRole('combobox', { name: 'Search results', exact: true }).click()
      await atRest(page.locator('[data-placement]'))
      return page.getByRole('listbox')
    },
    row: '[role="option"]',
    last: '',
  },
  table: {
    open: async (page, demo) => {
      await openLive(page, demo)
      return page.locator('#demo [role="region"]').first()
    },
    row: 'tbody tr:not([aria-hidden])',
    last: 'Entry 10000',
  },
  'tree-view': {
    open: async (page, demo) => {
      await openLive(page, demo)
      return page.locator('#demo [role="tree"]').first()
    },
    row: '[role="treeitem"]',
    last: 'File 10000.ts',
  },
}

const read = (slug: string, file: string) => {
  try { return readFileSync(join(COMPONENTS, slug, file), 'utf8') } catch { return '' }
}

const COLLECTIONS = readdirSync(COMPONENTS, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && callsUseCollection(read(entry.name, 'hook.ts')))
  .map((entry) => entry.name)
  .sort()

const mounted = (list: Locator, row: string) => list.locator(row).count()

const WINDOWED = COLLECTIONS.filter((slug) => !(slug in UNWINDOWED))
const PAGED = COLLECTIONS.filter((slug) => takesLoadMore(read(slug, 'types.ts')))

test('a driver for every component whose hook calls useCollection, and nothing else', () => {
  expect(COLLECTIONS).toEqual(['combobox', 'command', 'file-upload', 'select', 'table', 'tree-view'])
  expect(Object.keys(DRIVERS).sort()).toEqual(COLLECTIONS)
  expect(Object.keys(UNWINDOWED).filter((slug) => !COLLECTIONS.includes(slug))).toEqual([])
})

test('each windowed one has a ten-thousand demo, and each has a load-more demo when its props take loadMore', () => {
  const missing = COLLECTIONS.flatMap((slug) => [
    ...(slug in UNWINDOWED || DEMOS.includes(`${slug}--ten-thousand`) ? [] : [`${slug}--ten-thousand`]),
    ...(PAGED.includes(slug) && !DEMOS.includes(`${slug}--load-more`) ? [`${slug}--load-more`] : []),
  ])
  expect(missing).toEqual([])
  expect(PAGED).toEqual(['combobox', 'command', 'select', 'table', 'tree-view'])
})

test.describe('live', () => {
  test.afterEach(async ({ page }) => { expect(await liveErrors(page)).toEqual([]) })

  for (const slug of WINDOWED) {
    const driver = DRIVERS[slug] as Driver

    test(`${slug}: ten thousand items keep fewer than a hundred rows mounted at the top, the middle and the end`, async ({ page }) => {
      const list = await driver.open(page, `${slug}--ten-thousand`)
      await expect(list.locator(driver.row).first()).toBeVisible()
      for (const at of [0, 0.5, 1]) {
        const before = await list.locator(driver.row).first().textContent()
        await list.evaluate((node, share) => { node.scrollTop = (node.scrollHeight - node.clientHeight) * share }, at)
        if (at > 0) await expect.poll(() => list.locator(driver.row).first().textContent(), `the window moved at ${String(at)}`).not.toBe(before)
        const count = await mounted(list, driver.row)
        expect(count, `rows mounted at ${String(at)}`).toBeGreaterThan(0)
        expect(count, `rows mounted at ${String(at)}`).toBeLessThan(MOST_MOUNTED)
      }
      await expect(list.locator(driver.row).filter({ hasText: driver.last }).last()).toBeVisible()
    })
  }

  // Derived, so a list that starts taking loadMore gets this test without an edit here.
  for (const slug of PAGED) {
    const driver = DRIVERS[slug] as Driver

    test(`${slug}: nothing is asked at the top, and scrolling to the end calls loadMore once`, async ({ page }) => {
      const list = await driver.open(page, `${slug}--load-more`)
      const asked = page.getByTestId('asked')
      await expect(asked).toHaveText('Pages asked for: 0, loaded: 1')
      await list.evaluate((node) => { node.scrollTop = node.scrollHeight })
      await expect(asked).toHaveText(/^Pages asked for: 1, loaded: [12]$/)
      await expect(asked).toHaveText('Pages asked for: 1, loaded: 2')
    })
  }
})
