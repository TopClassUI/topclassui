// /llms-full.txt (S6): every live page and component page in full, in English, prerendered like /llms.txt (rule 4).
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import pkg from 'topclassui/package.json' with { type: 'json' }

import { LIVE_PAGES, hrefOf } from '../../content/pages'
import { labelsFor } from '../../labels/index'
import { type PagedComponent, componentOrder } from '../../lib/components'
import { type LlmsDoc, llmsFullTextOf, mdxToText } from '../../lib/llms'
import { descriptionOf } from '../../lib/metadata'
import { SITE_NAME, SITE_URL } from '../../lib/site'

export const dynamic = 'force-static'

const t = labelsFor('en').llms
const peers: Record<string, string> = pkg.peerDependencies

/** The self-closing tags whose value is text: a peer's range; every other one draws a widget and is left out. */
const inline = (tag: string, attrs: string) => {
  const name = /name="([^"]*)"/.exec(attrs)?.[1] ?? ''
  return tag === 'PeerRange' && name in peers ? `\`${peers[name] ?? ''}\`` : ''
}

function guideDoc(page: (typeof LIVE_PAGES)[number]): LlmsDoc {
  const file = join(process.cwd(), 'content', 'en', `${page.slug}.mdx`)
  return { title: page.title.en, path: hrefOf(page, 'en'), description: descriptionOf(page, 'en'), body: mdxToText(readFileSync(file, 'utf8'), inline).replaceAll('](/', `](${SITE_URL}/`) }
}

function componentDoc(entry: PagedComponent): LlmsDoc {
  const { content } = entry
  const body = [
    ...content.notes.en.map((note) => `- ${note}`),
    '', `### ${t.keyboard}`, '',
    ...content.keyboard.map((row) => `- ${row.keys.join(' + ')}: ${row.action.en}`),
    '', `### ${t.accessibility}`, '',
    ...content.accessibility.en.map((line) => `- ${line}`),
    '', `### ${t.rtl}`, '',
    content.rtl.en,
  ].join('\n')
  return { title: content.title.en, path: `/en/docs/components/${entry.slug}`, description: descriptionOf(entry, 'en'), body }
}

export function GET() {
  const docs = [
    ...LIVE_PAGES.filter((page) => page.kind === 'guide' || page.kind === 'changelog').map(guideDoc),
    ...componentOrder().map(componentDoc),
  ]
  return new Response(llmsFullTextOf(SITE_NAME, t.summary, SITE_URL, docs), { headers: { 'content-type': 'text/plain; charset=utf-8' } })
}
