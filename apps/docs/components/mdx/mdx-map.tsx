import Link from 'next/link'
import type { MDXComponents } from 'mdx/types'
import type { ComponentProps, ReactNode } from 'react'

import type { Locale } from '../../content/pages'
import { EXTERNAL_REL, isExternal } from '../../lib/external'
import { INSTALL_LINE } from '../../lib/site'
import { labelsFor } from '../../labels/index'
import { PROSE_CODE, TEXT_LINK } from '../classes'
import { Callout } from './callout'
import { FrameworkTabs } from './framework-tabs'
import { Card, Cards } from './cards'
import { CodeFence } from './code-fence'
import { Heading } from './heading'
import { MdxTable, Widths, type ColumnWidth } from './mdx-table'
import { PackageManagers } from './package-managers'
import { PeerRange } from './peer-range'
import { PropsTable } from './props-table'
import { Steps } from './steps'
import { ThemeScriptCsp } from './theme-script-csp'
import { ThemeScriptHtml } from './theme-script-html'
import { ThemeUtilities } from './theme-utilities'
import { WrongRight } from './wrong-right'

/** Every MDX element and block mapped to a library component, in the page's locale (docs-site S3). */
export function mdxComponents(locale: Locale): MDXComponents {
  const labels = labelsFor(locale)
  const { terminal, wrong, right, packageManagers, framework } = labels.blocks
  return {
    h2: ({ children }) => <Heading anchorLabel={labels.shell.anchor}>{children}</Heading>,
    h3: ({ children }) => <h3 className="text-lg font-semibold text-body">{children}</h3>,
    p: ({ children }) => <p className="text-base text-muted">{children}</p>,
    ul: ({ children }) => <ul className="flex list-disc flex-col gap-1 ps-6 text-base text-body">{children}</ul>,
    ol: ({ children }) => <Steps>{children}</Steps>,
    code: ({ children }) => <code dir="ltr" className={PROSE_CODE}>{children}</code>,
    pre: ({ children }) => <CodeFence locale={locale} terminal={terminal} repeat={labels.blocks.repeat}>{children}</CodeFence>,
    table: ({ children, widths }: { children?: ReactNode; widths?: readonly ColumnWidth[] | undefined }) => <MdxTable locale={locale} widths={widths}>{children}</MdxTable>,
    Widths,
    a: ({ href = '', children }: ComponentProps<'a'>) =>
      href.startsWith('/') ? <Link href={href} className={TEXT_LINK}>{children}</Link> : <a href={href} rel={isExternal(href) ? EXTERNAL_REL : undefined} className={TEXT_LINK}>{children}</a>,
    Callout,
    Cards,
    Card,
    WrongRight: ({ children }) => <WrongRight locale={locale} wrong={wrong} right={right} terminal={terminal} repeat={labels.blocks.repeat}>{children}</WrongRight>,
    PackageManagers: () => <PackageManagers locale={locale} label={packageManagers} />,
    FrameworkTabs: ({ frameworks }: { frameworks: readonly string[] }) => <FrameworkTabs locale={locale} label={framework} frameworks={frameworks} terminal={terminal} />,
    PeerRange,
    InstallLine: () => <code dir="ltr" className={PROSE_CODE}>{INSTALL_LINE}</code>,
    ThemeUtilities: () => <ThemeUtilities locale={locale} labels={labels.blocks.utilities} />,
    PropsTable: ({ of }: { of: 'TopClassProvider' }) => <PropsTable of={of} locale={locale} labels={labels} />,
    ThemeScriptCsp: () => <ThemeScriptCsp locale={locale} />,
    ThemeScriptHtml: () => <ThemeScriptHtml locale={locale} />,
  }
}
