import type { MDXComponents } from 'mdx/types'
import type { ReactNode } from 'react'

import type { Locale } from '../../content/pages'
import { guideLabelsFor } from '../../labels/guides'
import { DirectionPair } from './direction-pair'
import { IconGrid } from './icon-grid'
import { IconGroups } from './icon-groups'
import { KindCounts } from './kind-counts'
import { KnobsTable } from './knobs-table'
import { ModeIsland } from './mode-island'
import { PageControls } from './guide-islands'
import { Releases } from './releases'
import { RoleBoard } from './role-board'
import { TokenTable, ToneTable } from './token-table'
import { TokensSample } from './tokens-sample'

type Mode = 'light' | 'dark' | 'ocean'

/** The blocks of the foundation pages and the changelog (docs-site pages 7 to 12 and 17), beside the shared ones of mdx-map. */
export function guideComponents(locale: Locale): MDXComponents {
  return {
    PageControls: () => <PageControls labels={guideLabelsFor(locale).controls} />,
    TokenTable: ({ children }: { children?: ReactNode }) => <TokenTable locale={locale}>{children}</TokenTable>,
    ToneSwatches: ({ children }: { children?: ReactNode }) => <ToneTable locale={locale}>{children}</ToneTable>,
    RoleBoard: ({ children }: { children?: ReactNode }) => <RoleBoard locale={locale}>{children}</RoleBoard>,
    TokensSample: ({ mode, names }: { mode: 'dark' | 'ocean'; names?: string }) => <TokensSample mode={mode} names={names?.split(' ')} locale={locale} />,
    IconGroups: ({ children }: { children?: ReactNode }) => <IconGroups locale={locale}>{children}</IconGroups>,
    IconGrid: () => <IconGrid locale={locale} />,
    KnobsTable: ({ children }: { children?: ReactNode }) => <KnobsTable locale={locale}>{children}</KnobsTable>,
    ModeIsland: ({ mode }: { mode: Mode }) => <ModeIsland mode={mode} locale={locale} />,
    DirectionPair: ({ ltr, rtl }: { ltr: string; rtl: string }) => <DirectionPair ltr={ltr} rtl={rtl} locale={locale} />,
    KindCounts: () => <KindCounts locale={locale} />,
    Releases: () => <Releases locale={locale} />,
  }
}
