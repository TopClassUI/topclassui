import { describe, expect, it } from 'vitest'

import { captionOf, nameOf } from './state-strip'

describe('the Every state captions', () => {
  it('names a state by its aria-label, then a string title, then its text', () => {
    expect(nameOf(<span aria-label="In progress" title="ignored">x</span>)).toBe('In progress')
    expect(nameOf(<span title="Open">x</span>)).toBe('Open')
    expect(nameOf(<button type="button">Sav<b>ing</b></button>)).toBe('Saving')
  })

  it('leaves a part with nothing inline unnamed, and a long text uncaptioned', () => {
    expect(nameOf(<div />)).toBe('')
    const long = <p>The panel of an open item is shown under its trigger, always.</p>
    expect(nameOf(long)).not.toBe('')
    expect(captionOf(long)).toBe('')
  })
})
