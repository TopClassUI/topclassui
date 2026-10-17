import { describe, expect, it } from 'vitest'

import { Button } from '#components/button/index.js'
import { attr, markup } from '#test/markup.js'
import { TooltipPopup, TooltipRoot, TooltipTrigger } from '../index.js'

// The ssr project: what reaches the HTML before any script runs.
describe('on the server', () => {
  it('TooltipRoot renders no element of its own, only its children', () => {
    expect(markup(<TooltipRoot><span>Inside</span></TooltipRoot>)).toBe('<span>Inside</span>')
  })

  it('renders the trigger as the Button it is given, with its label', () => {
    const html = markup(
      <TooltipRoot>
        <TooltipTrigger render={<Button variant="ghost" aria-label="Copy link" />}>C</TooltipTrigger>
        <TooltipPopup>Copy link</TooltipPopup>
      </TooltipRoot>,
    )
    expect(html).toMatch(/^<button type="button" data-variant="ghost"/)
    expect(attr(html, 'aria-label')).toBe('Copy link')
    expect(attr(html, 'data-base-ui-tooltip-trigger')).toBe('')
  })

  it('renders no popup, even one open from the start, because the portal needs the browser', () => {
    const html = markup(
      <TooltipRoot defaultOpen>
        <TooltipTrigger render={<Button aria-label="Copy link" />}>C</TooltipTrigger>
        <TooltipPopup>Copy link</TooltipPopup>
      </TooltipRoot>,
    )
    expect(html.match(/<button /g) ?? []).toHaveLength(1)
    expect(html).not.toContain('data-placement')
    expect(html.split('Copy link').length - 1).toBe(1)
  })

  it('renders a bare trigger as a plain button when nothing is passed to render', () => {
    const html = markup(
      <TooltipRoot>
        <TooltipTrigger aria-label="Copy link">C</TooltipTrigger>
        <TooltipPopup>Copy link</TooltipPopup>
      </TooltipRoot>,
    )
    expect(html).toMatch(/^<button type="button" id="[^"]+" data-base-ui-tooltip-trigger="" aria-label="Copy link">C<\/button>$/)
  })
})
