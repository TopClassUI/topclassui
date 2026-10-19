// The Open Graph card every page shares (docs-site S6): 1200x630, dark mode's page, the name, a chip and one line.
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { ImageResponse } from 'next/og'

import { BrandMark } from '../components/shell/brand-mark'
import { FACTS } from './data'
import { OG_SIZE } from './metadata'
import { SITE_URL } from './site'

export { OG_SIZE }
export const OG_TYPE = 'image/png'

async function font(file: string) {
  return readFile(join(process.cwd(), 'assets', 'fonts', file))
}

export interface OgCard {
  /** Latin: the product or component name, always on its own line. */
  name: string
  chip: string
  /** The page's line in English. Satori cannot shape Arabic (GSUB lookup type 5 format 3), so an /ar image
   * takes PLAN 15.3's fallback: the Latin name, the chip and the page's address, no Arabic line. */
  line: string
}

/** Satori fails on Noto Sans Arabic, so an /ar image's line is the page's address. */
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
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 32, padding: 80, background: FACTS.page.dark, color: FACTS.dark.body, fontFamily: 'Inter' }}>
        <div style={{ display: 'flex', alignSelf: 'flex-start', padding: '8px 20px', borderRadius: 999, background: FACTS.dark.primary, color: FACTS.dark.body, fontSize: 28, fontWeight: 600 }}>{chip}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 112, height: 112, borderRadius: 24, background: FACTS.dark.primary }}>
            <BrandMark color={FACTS.dark.body} size={112} />
          </div>
          <div style={{ display: 'flex', fontSize: 88, fontWeight: 600 }}>{name}</div>
        </div>
        <div style={{ display: 'flex', fontSize: 40, color: FACTS.dark.muted, maxWidth: 1040 }}>{line}</div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  )
}
