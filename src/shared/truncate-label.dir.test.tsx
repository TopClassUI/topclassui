import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { truncateLabel } from './truncate-label.js'

const html = (children: Parameters<typeof truncateLabel>[0]) => renderToStaticMarkup(<>{truncateLabel(children, 200)}</>)

describe('the span truncateLabel writes around each run of text', () => {
  it('carries dir="auto" for a run in one script, so an English label in an RTL page keeps its start', () => {
    expect(html('Release notes')).toBe('<span dir="auto" class="truncate min-w-0">Release notes</span>')
    expect(html('مساحة العمل')).toBe('<span dir="auto" class="truncate min-w-0">مساحة العمل</span>')
  })

  it('carries no dir for a run that mixes the two, so an Arabic label that starts with a brand reads the brand first', () => {
    expect(html('Wi-Fi متصل')).toBe('<span class="truncate min-w-0">Wi-Fi متصل</span>')
  })

  it('decides for each run on its own', () => {
    expect(html(['Wi-Fi ', 'متصل', <b key="b">!</b>, 'Inbox'])).toBe(
      '<span class="truncate min-w-0">Wi-Fi متصل</span><b>!</b><span dir="auto" class="truncate min-w-0">Inbox</span>',
    )
  })
})
