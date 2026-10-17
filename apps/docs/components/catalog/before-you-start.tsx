// Before you start (page 13): the steps that make every card's import line work, once per app.
import { labelsFor } from '../../labels/index'
import { COMPONENT_PAGE_LABELS } from '../../labels/component-page'
import { INSTALL_LINE } from '../../lib/install'
import type { Locale } from '../../lib/locales'
import { CARD, CARD_HEAD, H3, SECTION, SMALL } from '../classes'
import { Code } from '../code'
import type { CodeLang } from '../../lib/highlight'
import { SectionHeading } from '../section-heading'

const CSS_ENTRY = `@import "tailwindcss";
@import "topclassui/tokens.css";
@import "topclassui/styles.css";`

const ROOT_LAYOUT = `const dir = locale === 'ar' ? 'rtl' : 'ltr'

return (
  <html lang={locale} dir={dir} data-theme="dark" suppressHydrationWarning>
    <head><ThemeScript /></head>
    <body>
      <TopClassProvider direction={dir} locale={locale}>
        {children}
      </TopClassProvider>
    </body>
  </html>
)`

export function BeforeYouStart({ id, locale }: { id: string; locale: Locale }) {
  const t = labelsFor(locale).catalog
  const copy = COMPONENT_PAGE_LABELS[locale].copyCode
  const steps: { key: string; title: string; note: string; code: string; file: string; lang: CodeLang }[] = [
    { key: 'install', ...t.steps.install, code: INSTALL_LINE, file: 'terminal', lang: 'bash' },
    { key: 'css', ...t.steps.css, code: CSS_ENTRY, file: 'app/globals.css', lang: 'css' },
    { key: 'layout', ...t.steps.layout, code: ROOT_LAYOUT, file: 'app/[locale]/layout.tsx', lang: 'tsx' },
  ]
  return (
    <section aria-labelledby={id} className={SECTION}>
      <SectionHeading id={id} anchorLabel={COMPONENT_PAGE_LABELS[locale].anchor(t.beforeTitle)}>{t.beforeTitle}</SectionHeading>
      <p className={SMALL}>{t.beforeOnce}</p>
      <p className={SMALL}>{t.beforeLead}</p>
      <ol className="grid min-w-0 gap-4 lg:grid-cols-2">
        {steps.map((step) => (
          <li key={step.key} className={`${CARD} ${CARD_HEAD} content-start`}>
            <h3 className={H3}>{step.title}</h3>
            <Code locale={locale} title={step.file} copyLabel={`${copy}: ${step.title}`} code={step.code} lang={step.lang} />
            <p className={SMALL}>{step.note}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
