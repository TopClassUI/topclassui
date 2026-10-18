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
