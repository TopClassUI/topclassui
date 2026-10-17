import { describe, expect, it } from 'vitest'

import { ar } from '#shared/labels/ar.js'
import { getLabels } from '#shared/labels/get-labels.js'
import { markup } from '#test/markup.js'
import { EmptyState } from '../index.js'

// R-5.11-1: written out in both languages, so a key swapped in either file fails here.
const EN_TITLE = 'Nothing here yet'
const EN_DESCRIPTION = 'When there is something to show, it will appear here.'
const AR_TITLE = 'لا يوجد شيء بعد'
const AR_DESCRIPTION = 'عندما يصبح هناك ما يُعرض، سيظهر هنا.'

describe('the built-in text comes from labels', () => {
  it('falls back to English when no labels are passed', () => {
    const out = markup(<EmptyState />)
    expect(out).toContain(`>${EN_TITLE}</p>`)
    expect(out).toContain(`>${EN_DESCRIPTION}</div>`)
  })

  it('takes both strings from the Arabic labels, and no English is left', () => {
    const out = markup(<EmptyState labels={ar} />)
    expect(out).toContain(`>${AR_TITLE}</p>`)
    expect(out).toContain(`>${AR_DESCRIPTION}</div>`)
    expect(out).not.toMatch(/[A-Za-z]{3,}<\//)
  })

  it('reads the labels field of getLabels, which is what a layout passes down', () => {
    const out = markup(<EmptyState labels={getLabels('ar-EG').labels} />)
    expect(out).toContain(`>${AR_TITLE}</p>`)
    expect(out).toContain(`>${AR_DESCRIPTION}</div>`)
  })

  it('takes the whole pair getLabels returns as a spread, and writes no locale on the root', () => {
    const out = markup(<EmptyState {...getLabels('ar')} />)
    expect(out).toContain(`>${AR_TITLE}</p>`)
    expect(out).toContain(`>${AR_DESCRIPTION}</div>`)
    expect(out).not.toMatch(/locale=|\[object/)
  })

  it('reads the title and the description keys separately, so one override leaves the other', () => {
    const labels = getLabels('en', { state: { empty: 'No invoices yet' } }).labels
    const out = markup(<EmptyState labels={labels} />)
    expect(out).toContain('>No invoices yet</p>')
    expect(out).toContain(`>${EN_DESCRIPTION}</div>`)
    expect(out).not.toContain(EN_TITLE)
  })

  it('swaps the description key without touching the title', () => {
    const labels = getLabels('en', { state: { emptyDescription: 'Invoices you send land here.' } }).labels
    const out = markup(<EmptyState labels={labels} />)
    expect(out).toContain(`>${EN_TITLE}</p>`)
    expect(out).toContain('>Invoices you send land here.</div>')
  })

  it('applies the title rule in Arabic too: a caller title drops the default description', () => {
    const out = markup(<EmptyState labels={ar} title="لا توجد فواتير" />)
    expect(out).toContain('>لا توجد فواتير</p>')
    expect(out).not.toContain(AR_DESCRIPTION)
  })

  it('never reads labels for a part the caller filled', () => {
    const out = markup(<EmptyState labels={ar} title="A" description="B" />)
    expect(out).not.toContain(AR_TITLE)
    expect(out).not.toContain(AR_DESCRIPTION)
  })
})
