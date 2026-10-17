// The headings of /llms.txt (S6), in en and ar; the summary is English, as the file's readers are.
import type { Locale } from '../lib/locales'

export interface LlmsLabels { summary: string; docs: string; components: string }

const en: LlmsLabels = {
  summary: 'React components for Next.js, RTL-first and server-first, built on Tailwind CSS v4 and Base UI.',
  docs: 'Docs',
  components: 'Components',
}

const ar: LlmsLabels = {
  summary: 'مكوّنات React لـ Next.js، من اليمين إلى اليسار أولًا ومن الخادم أولًا، مبنية على Tailwind CSS v4 وBase UI.',
  docs: 'التوثيق بالعربية',
  components: 'المكوّنات بالعربية',
}

export const LLMS_LABELS: Record<Locale, LlmsLabels> = { en, ar }
