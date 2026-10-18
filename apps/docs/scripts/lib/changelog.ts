// The Changelog page's entries, read from the package's CHANGELOG.md, the file Changesets writes (docs-site page 17).
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { ChangelogFacts, ChangelogGroup, ChangelogItem, Release } from '../../lib/guide-facts.js'
import { slugify } from '../../lib/slug.js'
import type { TocEntry } from './toc.js'
import { LIBRARY } from './library.js'

/** Changesets opens each entry with the commit it came from; the page shows the change, not the hash. */
const COMMIT = /^[0-9a-f]{7,40}: /

/** `## version`, then `### Group`, then `- item` lines, each continued by indented lines or `  - sub-items`. */
export function parseChangelog(markdown: string): Release[] {
  const releases: Release[] = []
  let group: ChangelogGroup | null = null
  let item: ChangelogItem | null = null
  for (const line of markdown.split(/\r?\n/)) {
    const version = /^## +(.+?)\s*$/.exec(line)?.[1]
    if (version !== undefined) {
      releases.push({ version, groups: [] })
      group = null
      item = null
      continue
    }
    const release = releases.at(-1)
    if (release === undefined || line.trim() === '') continue
    const title = /^### +(.+?)\s*$/.exec(line)?.[1]
    if (title !== undefined) {
      group = { title, items: [] }
      release.groups.push(group)
      item = null
      continue
    }
    if (group === null) {
      group = { title: null, items: [] }
      release.groups.push(group)
    }
    const top = /^[-*] +(.*)$/.exec(line)?.[1]
    const sub = /^\s+[-*] +(.*)$/.exec(line)?.[1]
    if (top !== undefined) {
      item = { text: top.replace(COMMIT, ''), children: [] }
      group.items.push(item)
    } else if (sub !== undefined && item !== null) {
      item.children.push(sub)
    } else if (item !== null && /^\s/.test(line)) {
      const last = item.children.length - 1
      if (last >= 0) item.children[last] = `${item.children[last] ?? ''} ${line.trim()}`
      else item.text = `${item.text} ${line.trim()}`
    } else {
      item = { text: line.trim(), children: [] }
      group.items.push(item)
    }
  }
  return releases
}

/** The package's changelog when the release has written it; none before, and the page says so. */
export function changelogFacts(root = LIBRARY): ChangelogFacts {
  const file = join(root, 'CHANGELOG.md')
  return { releases: existsSync(file) ? parseChangelog(readFileSync(file, 'utf8')) : [] }
}

/** One On this page row per release, newest first, with the id the page's heading gets. */
export function releaseToc(facts: ChangelogFacts): TocEntry[] {
  return facts.releases.map((release) => ({ text: release.version, id: slugify(release.version) }))
}
