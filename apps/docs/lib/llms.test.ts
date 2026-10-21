import { describe, expect, it } from 'vitest'

import { llmsFullTextOf, llmsTextOf, mdxToText } from './llms'

describe('llmsTextOf', () => {
  it('writes the name, the summary and one absolute link per line, section by section', () => {
    expect(llmsTextOf('TopClass UI', 'React components.', 'https://topclassui.com', [
      { heading: 'Docs', lines: [{ title: 'Components', path: '/en/docs/components', description: 'Every card.' }] },
      { heading: 'Empty', lines: [] },
      { heading: 'Components', lines: [{ title: 'Button', path: '/en/docs/components/button', description: 'A button.' }] },
    ])).toBe([
      '# TopClass UI',
      '',
      '> React components.',
      '',
      '## Docs',
      '',
      '- [Components](https://topclassui.com/en/docs/components): Every card.',
      '',
      '## Components',
      '',
      '- [Button](https://topclassui.com/en/docs/components/button): A button.',
      '',
    ].join('\n'))
  })
})

describe('llmsFullTextOf', () => {
  it('writes the same head, then each page under its heading with its URL, its description and its body', () => {
    expect(llmsFullTextOf('TopClass UI', 'React components.', 'https://topclassui.com', [
      { title: 'CSS entry', path: '/en/docs/css', description: 'Three lines.', body: '### The three lines\n\nIn order.\n' },
    ])).toBe([
      '# TopClass UI',
      '',
      '> React components.',
      '',
      '## CSS entry',
      '',
      'URL: https://topclassui.com/en/docs/css',
      '',
      'Three lines.',
      '',
      '### The three lines',
      '',
      'In order.',
      '',
    ].join('\n'))
  })
})

describe('mdxToText', () => {
  it('drops the frontmatter, the imports and the widgets, keeps the prose and moves every heading one level down', () => {
    const source = [
      '---',
      'title: Icons',
      '---',
      "import { x } from './x'",
      '',
      '<PageControls />',
      '',
      '## The set',
      '',
      'Prose with `code`.',
      '',
      '<Cards>',
      '  <Card title="Flips">Every arrow.</Card>',
      '</Cards>',
      '',
      '<Callout tone="info">Install first.</Callout>',
      '',
      '| Package | Range |',
      '|---|---|',
      '| `react` | <PeerRange name="react" /> |',
    ].join('\n')
    expect(mdxToText(source, (tag, attrs) => (tag === 'PeerRange' && attrs.includes('react') ? '`^19.0.0`' : ''))).toBe([
      '### The set',
      '',
      'Prose with `code`.',
      '',
      '- Flips: Every arrow.',
      '',
      'Install first.',
      '',
      '| Package | Range |',
      '|---|---|',
      '| `react` | `^19.0.0` |',
    ].join('\n'))
  })

  it('keeps a code fence as written, JSX, imports and headings included', () => {
    const fence = ['```tsx', "import { Icon } from 'topclassui/icon'", '## not a heading', '<Icon name="gear" />', '```'].join('\n')
    expect(mdxToText(fence)).toBe(fence)
  })
})
