import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Command } from '../index.js'

interface Entry { id: string, label: string }

const ITEMS: Entry[] = [{ id: 'new', label: 'ملف جديد' }]

function Palette() {
  return <Command defaultOpen items={ITEMS} getKey={(entry) => entry.id} getLabel={(entry) => entry.label} onSelect={() => undefined} />
}

const viewport = () => screen.getByRole('dialog').parentElement as HTMLElement

async function ready() {
  await screen.findByRole('dialog', {}, { timeout: 15_000 })
  await waitFor(() => { expect(document.activeElement?.getAttribute('role')).toBe('combobox') })
}

// A portal sits in the body, so it inherits neither from an island: the viewport carries the provider's.
describe('the direction and the language of the portal', () => {
  it('inside an Arabic provider the viewport is rtl and ar, and every built-in text is Arabic', async () => {
    render(<TopClassProvider direction="rtl" locale="ar"><Palette /></TopClassProvider>)
    await ready()
    expect(viewport().getAttribute('dir')).toBe('rtl')
    expect(viewport().getAttribute('lang')).toBe('ar')
    expect(screen.getByRole('combobox').getAttribute('placeholder')).toBe('اكتب أمرًا أو ابحث')
    expect(screen.getByRole('dialog').getAttribute('aria-labelledby')).toBe(screen.getByText('لوحة الأوامر').id)
  })

  it('with no provider nothing is stamped, so the palette is laid out as its page is', async () => {
    render(<Palette />)
    await ready()
    expect(viewport().hasAttribute('dir')).toBe(false)
    expect(viewport().hasAttribute('lang')).toBe(false)
  })
})
