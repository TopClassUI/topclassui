// llms.txt (S6): one line per live page and per component, title, URL and description, from the registry and the component file.
export interface LlmsLine {
  title: string
  path: string
  description: string
}

export interface LlmsSection {
  heading: string
  lines: readonly LlmsLine[]
}

/** The llmstxt.org shape: the name, a one-line summary, then a Markdown list per section, with absolute URLs. */
export function llmsTextOf(name: string, summary: string, origin: string, sections: readonly LlmsSection[]): string {
  const blocks = sections.filter((section) => section.lines.length > 0).map((section) => [
    `## ${section.heading}`,
    '',
    ...section.lines.map((line) => `- [${line.title}](${origin}${line.path}): ${line.description}`),
  ].join('\n'))
  return `${[`# ${name}`, '', `> ${summary}`, ...blocks.flatMap((block) => ['', block])].join('\n')}\n`
}

export interface LlmsDoc {
  title: string
  path: string
  description: string
  /** Markdown: a guide's MDX through mdxToText, or a component page's facts. */
  body: string
}

/** llms-full.txt: the same head as llms.txt, then every page in full under a heading of its own. */
export function llmsFullTextOf(name: string, summary: string, origin: string, docs: readonly LlmsDoc[]): string {
  const blocks = docs.map((doc) => [`## ${doc.title}`, '', `URL: ${origin}${doc.path}`, '', doc.description, '', doc.body.trim()].join('\n'))
  return `${[`# ${name}`, '', `> ${summary}`, ...blocks.flatMap((block) => ['', block])].join('\n')}\n`
}

const attrOf = (attrs: string, key: string) => new RegExp(`${key}="([^"]*)"`).exec(attrs)?.[1]

/** A guide's MDX as plain Markdown: no frontmatter, no import or export, one heading level down, each JSX tag replaced
 * by `inline(name, attrs)` when it closes itself and by its children otherwise; code fences are kept as written. */
export function mdxToText(source: string, inline: (name: string, attrs: string) => string = () => ''): string {
  const lines = source.replace(/^---\n[\s\S]*?\n---\n/, '').split('\n')
  const out: string[] = []
  let fenced = false
  for (const line of lines) {
    if (/^\s*```/.test(line)) fenced = !fenced
    if (fenced || /^\s*```/.test(line)) {
      out.push(line)
      continue
    }
    if (/^(import|export) /.test(line)) continue
    const wrapped = /^\s*<([A-Z]\w*)([^>]*)>(.*)<\/\1>\s*$/.exec(line)
    const title = wrapped === null ? undefined : attrOf(wrapped[2] ?? '', 'title')
    const text = wrapped === null
      ? line.replace(/<([A-Z]\w*)([^>]*?)\s*\/>/g, (_, tag: string, attrs: string) => inline(tag, attrs)).replace(/<\/?[A-Z]\w*[^>]*>/g, '')
      : `${title === undefined ? '' : `- ${title}: `}${wrapped[3] ?? ''}`
    if (text.trim() === '' && line.trim() !== '') continue
    out.push(text.replace(/^(#{2,5}) /, '#$1 '))
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}
