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
    slug: 'cli', path: '/docs/cli', kind: 'guide', group: 'start', icon: 'terminal-window', status: 'later',
    title: { en: 'Add with the CLI', ar: 'الإضافة عبر الطرفية' },
    description: {
      en: 'Copy one component into your project with one command, then edit it as your own file.',
      ar: 'انسخ مكوّنًا واحدًا إلى مشروعك بأمر واحد، ثم عدّله كأنه ملفك.',
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
      en: 'Every color token, in each mode, with the contrast it is checked against.',
      ar: 'كل رمز لوني في كل وضع، مع التباين الذي يُفحص مقابله.',
    },
  },
  {
    slug: 'icons', path: '/docs/icons', kind: 'guide', group: 'foundations', icon: 'image', status: 'live',
    title: { en: 'Icons', ar: 'الأيقونات' },
    description: {
      en: 'The built-in icons, by name, and the ones that flip on their own in Arabic.',
      ar: 'الأيقونات المضمّنة بأسمائها، والتي تنعكس وحدها في العربية.',
    },
  },
  {
    slug: 'theming', path: '/docs/theming', kind: 'guide', group: 'foundations', icon: 'moon', status: 'live',
    title: { en: 'Theming', ar: 'السمات' },
    description: {
      en: 'Light, dark and your own mode from one small CSS block, without touching a component.',
      ar: 'وضع فاتح وداكن ووضعك الخاص من كتلة CSS صغيرة واحدة، دون لمس أي مكوّن.',
    },
  },
  {
    slug: 'rtl', path: '/docs/rtl', kind: 'guide', group: 'foundations', icon: 'translate', status: 'live',
    title: { en: 'Right to left', ar: 'من اليمين إلى اليسار' },
    description: {
      en: 'Arabic works without a code change: the layout, the icons and the digits follow the page.',
      ar: 'العربية تعمل دون تغيير في الشيفرة: التخطيط والأيقونات والأرقام تتبع الصفحة.',
    },
  },
  {
    slug: 'server-first', path: '/docs/server-first', kind: 'guide', group: 'foundations', icon: 'globe', status: 'live',
    title: { en: 'Server first', ar: 'الخادم أولًا' },
    description: {
      en: 'Most components render on the server and add no JavaScript. Here is which ones, and why.',
      ar: 'أغلب المكوّنات تُعرض على الخادم ولا تضيف أي JavaScript. هذه هي، وهذا هو السبب.',
    },
  },
  {
    slug: 'accessibility', path: '/docs/accessibility', kind: 'guide', group: 'foundations', icon: 'check-circle', status: 'live',
    title: { en: 'Accessibility', ar: 'إمكانية الوصول' },
    description: {
      en: 'WCAG 2.2 AA, checked in a real browser: axe, target size, the focus ring and contrast.',
      ar: 'معيار WCAG 2.2 AA، مفحوص في متصفح حقيقي: axe وحجم الهدف وحلقة التركيز والتباين.',
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
      en: 'What changed in each release of TopClass UI, newest first, with the version it shipped in.',
      ar: 'ما تغيّر في كل إصدار من TopClass UI، الأحدث أولًا، مع الإصدار الذي صدر فيه.',
    },
  },
] as const satisfies readonly PageEntry[]

export type PageSlug = (typeof PAGES)[number]['slug']

export const LIVE_PAGES: readonly PageEntry[] = PAGES.filter((page) => page.status === 'live')

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
