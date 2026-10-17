import { describe, expect, it } from 'vitest'

import { llmsTextOf } from './llms'

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
