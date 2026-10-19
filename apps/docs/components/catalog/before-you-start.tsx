// Before you start (page 13, frame 165:1096): one card, the four steps that make every card's command and import line work.
import { labelsFor } from '../../labels/index'
import { COMPONENT_PAGE_LABELS } from '../../labels/component-page'
import { INSTALL_LINE, addLineOf } from '../../lib/install'
import type { Locale } from '../../lib/locales'
import { BOXED_CODE, CARD, CHIP, IN_CARD_TITLE, NOTE, SMALL, STEP, STEP_TITLE } from '../classes'
import { Code } from '../code'
import type { CodeLang } from '../../lib/highlight'
import { SectionHeading } from '../section-heading'

const CSS_ENTRY = `/* app/globals.css */
@import "tailwindcss";
@import "topclassui/tokens.css";
@import "topclassui/styles.css";`

const ROOT_LAYOUT = `// app/[locale]/layout.tsx
const dir = locale === 'ar' ? 'rtl' : 'ltr'

return (
  <html
    lang={locale} dir={dir} data-theme="dark"
    suppressHydrationWarning
  >
    <head><ThemeScript /></head>
    <body>
      <TopClassProvider
        direction={dir} locale={locale}
      >
        {children}
      </TopClassProvider>
    </body>
  </html>
)`

export function BeforeYouStart({ id, locale }: { id: string; locale: Locale }) {
  const t = labelsFor(locale).catalog
  const steps: { key: string; title: string; note: string; code: string; file: string; lang: CodeLang }[] = [
    { key: 'install', ...t.steps.install, code: `${INSTALL_LINE}\n${t.steps.addComment}\n${addLineOf('button')}`, file: 'terminal', lang: 'bash' },
    { key: 'css', ...t.steps.css, code: CSS_ENTRY, file: 'app/globals.css', lang: 'css' },
    { key: 'layout', ...t.steps.layout, code: ROOT_LAYOUT, file: 'app/[locale]/layout.tsx', lang: 'tsx' },
    { key: 'source', ...t.steps.source, code: addLineOf('button'), file: 'terminal (copy the source)', lang: 'bash' },
  ]
  return (
    <section aria-labelledby={id} className={`${CARD} scroll-mt-(--tc-sticky-top,0px)`}>
      <div className="grid min-w-0 gap-1.5 p-4.5">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
          <SectionHeading id={id} className={IN_CARD_TITLE} anchorLabel={COMPONENT_PAGE_LABELS[locale].anchor(t.beforeTitle)}>{t.beforeTitle}</SectionHeading>
          <span className={`${CHIP} bg-page`}>{t.beforeOnce}</span>
        </div>
        <p className={SMALL}>{t.beforeLead}</p>
      </div>
      <ol className="grid min-w-0 lg:grid-cols-2">
        {steps.map((step, index) => (
          <li key={step.key} className={index % 2 === 1 ? `${STEP} lg:border-s-(length:--tc-line-width)` : STEP}>
            <h3 className={STEP_TITLE}>{step.title}</h3>
            <Code locale={locale} title={step.file} copyLabel={step.title} code={step.code} lang={step.lang} className={BOXED_CODE} />
            <p className={NOTE}>{step.note}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
