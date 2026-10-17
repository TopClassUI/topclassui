// The Open Graph card of the catalog and the component pages (S6): 1200x630, dark mode's page, the name, the chip and one line.
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { ImageResponse } from 'next/og'

import colors from '../.generated/og.json' with { type: 'json' }
import { SITE_NAME, SITE_URL } from './site'

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_TYPE = 'image/png'

const font = (file: string) => readFile(join(process.cwd(), 'assets', 'fonts', file))

export interface OgCard {
  /** Latin: the product or component name, always on its own line. */
  name: string
  /** English: the ar image uses it too, since Satori cannot shape Arabic. */
  chip: string
  /** The page's line in English; on /ar, the page's address (PLAN 15.3's Latin fallback, below). */
  line: string
}

/** Satori fails on Noto Sans Arabic (GSUB lookup type 5 format 3), so an /ar image carries no Arabic: its line is the address. */
export function ogLineOf(locale: string, path: string, english: string): string {
  return locale === 'ar' ? `${SITE_URL.replace('https://', '')}${path}` : english
}

export async function ogImage({ name, chip, line }: OgCard): Promise<ImageResponse> {
  const fonts = [
    { name: 'Inter', data: await font('inter-latin-400-normal.woff'), weight: 400 as const },
    { name: 'Inter', data: await font('inter-latin-600-normal.woff'), weight: 600 as const },
  ]
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 32, padding: 80, background: colors.page, color: colors.body, fontFamily: 'Inter' }}>
        <div style={{ display: 'flex', fontSize: 28, fontWeight: 600, color: colors.muted }}>{SITE_NAME}</div>
        <div style={{ display: 'flex', fontSize: 88, fontWeight: 600 }}>{name}</div>
        <div style={{ display: 'flex', alignSelf: 'flex-start', padding: '8px 20px', borderRadius: 999, border: `2px solid ${colors.line}`, background: colors.surface, color: colors.primary, fontSize: 28, fontWeight: 600 }}>{chip}</div>
        <div style={{ display: 'flex', fontSize: 36, color: colors.muted, maxWidth: 1040 }}>{line}</div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  )
}
