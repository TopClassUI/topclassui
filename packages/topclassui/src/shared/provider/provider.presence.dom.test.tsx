import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { type MockInstance, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const MESSAGE = '[topclassui] A component rendered with no <TopClassProvider> above it, so it runs on direction="ltr" locale="en".\n'
  + '  Mount one in the root layout (R-13-1): <TopClassProvider direction={dir} locale={locale}>'

/** Fresh modules, so the once-per-page memory the setup file spent is back. */
async function load() {
  vi.resetModules()
  const { TopClassProvider } = await import('./provider.js')
  const { useLocale } = await import('./context.js')
  const { usePortalLocale } = await import('./use-portal-locale.js')
  const { AccordionItem, AccordionRoot } = await import('../../components/accordion/index.js')
  const { Checkbox } = await import('../../components/checkbox/index.js')
  const { RadioGroupItem, RadioGroupRoot } = await import('../../components/radio-group/index.js')
  const { SegmentedControlItem, SegmentedControlRoot } = await import('../../components/segmented-control/index.js')
  const { Switch } = await import('../../components/switch/index.js')
  const { TabsList, TabsRoot, TabsTab } = await import('../../components/tabs/index.js')
  const Locale = () => <p>{useLocale()}</p>
  const Portal = () => <p>{usePortalLocale().lang ?? 'none'}</p>
  // The six Base UI-backed components that read no label, so only their hook.ts can notice the missing provider.
  const unlabelled: Record<string, ReactElement> = {
    accordion: <AccordionRoot><AccordionItem value="one" title="One">Text</AccordionItem></AccordionRoot>,
    checkbox: <Checkbox aria-label="Agree" />,
    'radio-group': <RadioGroupRoot aria-label="Size"><RadioGroupItem value="s">Small</RadioGroupItem></RadioGroupRoot>,
    'segmented-control': <SegmentedControlRoot aria-label="View" defaultValue="list"><SegmentedControlItem value="list">List</SegmentedControlItem></SegmentedControlRoot>,
    switch: <Switch aria-label="Wifi" />,
    tabs: <TabsRoot><TabsList aria-label="Order"><TabsTab value={0}>One</TabsTab></TabsList></TabsRoot>,
  }
  return { Provider: TopClassProvider, Locale, Portal, unlabelled }
}

let warn: MockInstance<typeof console.warn>
beforeEach(() => { warn = vi.spyOn(console, 'warn').mockImplementation(() => {}) })
afterEach(() => { warn.mockRestore(); vi.unstubAllEnvs() })

describe('R-13-1: a component with no provider above it', () => {
  it('warns once when it reads the context', async () => {
    const { Locale } = await load()
    render(<Locale />)
    expect(warn.mock.calls).toEqual([[MESSAGE]])
  })

  it('warns once from a portaled part, which reads the provider for its dir and lang', async () => {
    const { Portal } = await load()
    render(<Portal />)
    expect(warn.mock.calls).toEqual([[MESSAGE]])
  })

  for (const slug of ['accordion', 'checkbox', 'radio-group', 'segmented-control', 'switch', 'tabs']) {
    it(`warns once from ${slug}, which reads no label`, async () => {
      const { unlabelled } = await load()
      render(<>{unlabelled[slug]}{unlabelled[slug]}</>)
      expect(warn.mock.calls).toEqual([[MESSAGE]])
    })
  }

  it('warns once per page, however many components render without one', async () => {
    const { Locale, Portal, unlabelled } = await load()
    render(<><Locale /><Portal />{unlabelled.switch}<Locale /></>)
    render(<Locale />)
    expect(warn).toHaveBeenCalledTimes(1)
  })

  it('stays quiet inside a provider', async () => {
    const { Provider, Locale, Portal, unlabelled } = await load()
    render(<Provider direction="ltr" locale="en"><Locale /><Portal />{Object.values(unlabelled)}</Provider>)
    expect(warn).not.toHaveBeenCalled()
  })

  it('never warns in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const { Locale, unlabelled } = await load()
    render(<><Locale />{unlabelled.switch}</>)
    expect(warn).not.toHaveBeenCalled()
  })
})
