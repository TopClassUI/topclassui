// The page registry (docs-site S1): the sidebar, "next", the sitemap, search, llms.txt and the metadata all read this list.
import type { IconName } from 'topclassui/icons'

export const LOCALES = ['en', 'ar'] as const
export type Locale = (typeof LOCALES)[number]

export const PAGE_GROUPS = ['start', 'foundations', 'reference', 'more'] as const
export type PageGroup = (typeof PAGE_GROUPS)[number]

export const PAGE_STATUSES = ['live', 'later'] as const
export type PageStatus = (typeof PAGE_STATUSES)[number]

export const PAGE_KINDS = ['home', 'guide', 'catalog', 'changelog'] as const
export type PageKind = (typeof PAGE_KINDS)[number]

interface Both {
  en: string
  ar: string
}

export interface PageEntry {
  slug: string
  path: string
  kind: PageKind
  group: PageGroup
  icon: IconName
  title: Both
  description: Both
  status: PageStatus
}

/** Sidebar order. "Next" is the following live entry; a `later` entry is not routed, listed or indexed. */
export const PAGES = [
  {
    slug: 'home', path: '/', kind: 'home', group: 'start', icon: 'house', status: 'live',
    title: { en: 'Home', ar: 'الصفحة الرئيسية' },
    description: {
      en: 'React components for Next.js, RTL-first and server-first. Most render on the server and add no JavaScript; all of them work in Arabic.',
      ar: 'مكوّنات React لـ Next.js، تبدأ من اليمين إلى اليسار وتُعرض على الخادم أولًا. أغلبها لا يضيف أي JavaScript، وكلها تعمل بالعربية.',
    },
  },
  {
    slug: 'installation', path: '/docs/installation', kind: 'guide', group: 'start', icon: 'download-simple', status: 'live',
    title: { en: 'Install the package', ar: 'تثبيت الحزمة' },
    description: {
      en: 'Two steps. Install the package, then add the components you need.',
      ar: 'خطوتان فقط. ثبّت الحزمة، ثم أضف المكوّنات التي تحتاج إليها.',
    },
  },
  {
    slug: 'cli', path: '/docs/cli', kind: 'guide', group: 'start', icon: 'terminal-window', status: 'live',
    title: { en: 'Add with the CLI', ar: 'الإضافة عبر الطرفية' },
    description: {
      en: 'Copy one component into your project with one command. The CLI brings its source, constants, schema, types and variants, and you edit them as your own files.',
      ar: 'انسخ مكوّنًا واحدًا إلى مشروعك بأمر واحد. تجلب الطرفية مصدره مع ثوابته ومخططه وأنواعه ومتغيراته، ثم تعدّلها كأنها ملفاتك، ويظهر كل تحديث لاحق بأمر diff.',
    },
  },
  {
    slug: 'css', path: '/docs/css', kind: 'guide', group: 'start', icon: 'code', status: 'live',
    title: { en: 'CSS entry', ar: 'مدخل CSS' },
    description: {
      en: 'Three import lines, in order, and no configuration file. That is the whole Tailwind setup.',
      ar: 'ثلاثة أسطر استيراد بترتيب ثابت، ولا ملف إعدادات. هذا كل ما يحتاجه إعداد Tailwind.',
    },
  },
  {
    slug: 'provider', path: '/docs/provider', kind: 'guide', group: 'start', icon: 'gear', status: 'live',
    title: { en: 'Provider', ar: 'المزوّد' },
    description: {
      en: 'One provider at the root of your app, with direction and locale as props. It is required, and everything it does is listed on this page.',
      ar: 'مزوّد واحد في جذر تطبيقك، مع الاتجاه والإعداد المحلي كخصائص. وجوده إلزامي، وكل ما يفعله مذكور في هذه الصفحة.',
    },
  },
  {
    slug: 'first-component', path: '/docs/first-component', kind: 'guide', group: 'start', icon: 'play', status: 'live',
    title: { en: 'Your first component', ar: 'مكوّنك الأول' },
    description: {
      en: 'A form that renders on the server and posts to a Server Action. No JavaScript for its markup.',
      ar: 'نموذج يُعرض على الخادم ويُرسل إلى إجراء خادم. لا JavaScript لبنيته.',
    },
  },
  {
    slug: 'colors', path: '/docs/colors', kind: 'guide', group: 'foundations', icon: 'palette', status: 'live',
    title: { en: 'Colors', ar: 'الألوان' },
    description: {
      en: 'Color has three layers: a palette you never use directly, semantic tokens you always use, and the utility classes Tailwind generates from those tokens.',
      ar: 'للألوان ثلاث طبقات: لوحة ألوان لا تستخدمها مباشرة أبدًا، ورموز دلالية تستخدمها دائمًا، والأصناف المساعدة التي يولّدها Tailwind من تلك الرموز.',
    },
  },
  {
    slug: 'icons', path: '/docs/icons', kind: 'guide', group: 'foundations', icon: 'image', status: 'live',
    title: { en: 'Icons', ar: 'الأيقونات' },
    description: {
      en: '84 icons, inlined as SVG. Only the ones you render are loaded.',
      ar: '84 أيقونة مضمّنة في الصفحة بصيغة SVG. لا يُحمَّل منها إلا ما تعرضه فعلًا.',
    },
  },
  {
    slug: 'theming', path: '/docs/theming', kind: 'guide', group: 'foundations', icon: 'moon', status: 'live',
    title: { en: 'Theming', ar: 'السمات' },
    description: {
      en: 'Six knobs change the shape of every component at once. A mode changes the colors. Nothing else is themeable, by design.',
      ar: 'ستة مفاتيح ضبط تغيّر شكل كل المكوّنات دفعة واحدة، والوضع يغيّر الألوان. ولا شيء غير ذلك قابل للتخصيص، عن قصد.',
    },
  },
  {
    slug: 'rtl', path: '/docs/rtl', kind: 'guide', group: 'foundations', icon: 'translate', status: 'live',
    title: { en: 'Right to left', ar: 'من اليمين إلى اليسار' },
    description: {
      en: 'Every component mirrors in Arabic without a code change, because no component is allowed to say left or right.',
      ar: 'كل مكوّن ينعكس في العربية دون أي تغيير في الشيفرة، لأنه لا يُسمح لأي مكوّن بأن يقول يسار أو يمين.',
    },
  },
  {
    slug: 'server-first', path: '/docs/server-first', kind: 'guide', group: 'foundations', icon: 'globe', status: 'live',
    title: { en: 'Server first', ar: 'الخادم أولًا' },
    description: {
      en: 'A component ships JavaScript only when it has to listen for something. Most of them never do.',
      ar: 'لا يشحن المكوّن شيفرة JavaScript إلا حين يحتاج إلى الاستماع إلى حدث ما. أما البقية فلا تضيف شيئًا.',
    },
  },
  {
    slug: 'accessibility', path: '/docs/accessibility', kind: 'guide', group: 'foundations', icon: 'check-circle', status: 'live',
    title: { en: 'Accessibility', ar: 'إمكانية الوصول' },
    description: {
      en: 'WCAG 2.2 AA is the target. This page lists what a machine checks, what a person checks, and what is not yet covered.',
      ar: 'الهدف هو WCAG 2.2 AA. تعرض هذه الصفحة ما تفحصه الآلة، وما يفحصه الإنسان، وما لم يُغطَّ بعد.',
    },
  },
  {
    slug: 'components', path: '/docs/components', kind: 'catalog', group: 'reference', icon: 'list', status: 'live',
    title: { en: 'Components', ar: 'المكوّنات' },
    description: {
      en: 'Every component in one consistent layout: the preview, the code, every state and how to install it.',
      ar: 'كل المكوّنات بتخطيط واحد: المعاينة والشيفرة وكل الحالات وطريقة التثبيت.',
    },
  },
  {
    slug: 'changelog', path: '/changelog', kind: 'changelog', group: 'more', icon: 'clock', status: 'live',
    title: { en: 'Changelog', ar: 'سجل التغييرات' },
    description: {
      en: 'Every release of TopClass UI, newest first, with what changed in it and how to move to it.',
      ar: 'كل إصدار من TopClass UI، الأحدث أولًا، مع ما تغيّر فيه وكيفية الانتقال إليه.',
    },
  },
] as const satisfies readonly PageEntry[]

export type PageSlug = (typeof PAGES)[number]['slug']

/** Read as PageEntry, so the filter still means something when no entry waits for later. */
const ENTRIES: readonly PageEntry[] = PAGES

export const LIVE_PAGES: readonly PageEntry[] = ENTRIES.filter((page) => page.status === 'live')

/** The guide pages `docs/[page]` renders, in sidebar order. */
export const LIVE_GUIDES: readonly PageEntry[] = LIVE_PAGES.filter((page) => page.kind === 'guide')

export function pageBySlug(slug: string): PageEntry | undefined {
  return LIVE_PAGES.find((page) => page.slug === slug)
}

/** The following live entry in sidebar order, or none after the last. */
export function nextPage(slug: string): PageEntry | undefined {
  const index = LIVE_PAGES.findIndex((page) => page.slug === slug)
  return index === -1 ? undefined : LIVE_PAGES[index + 1]
}

/** The live entry before it in sidebar order, or none before the first. */
export function previousPage(slug: string): PageEntry | undefined {
  const index = LIVE_PAGES.findIndex((page) => page.slug === slug)
  return index < 1 ? undefined : LIVE_PAGES[index - 1]
}

/** The route of a page in a locale: `/en`, `/ar/docs/css`. */
export function hrefOf(page: Pick<PageEntry, 'path'>, locale: Locale): string {
  return page.path === '/' ? `/${locale}` : `/${locale}${page.path}`
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}
