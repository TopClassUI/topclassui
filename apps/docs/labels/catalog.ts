// The strings of the catalog (page 13), in en and ar; the sections' names and leads live in content/sections.ts.
import type { Locale } from '../lib/locales'

export interface CatalogLabels {
  title: string
  lead: (count: number) => string
  metaTitle: string
  description: string
  beforeTitle: string
  beforeOnce: string
  beforeLead: string
  /** Steps 1 to 3 of Figma's four; step 4, copy the source, waits for the CLI (choice 11). */
  steps: { install: StepLabels; css: StepLabels; layout: StepLabels }
  legendTitle: string
  legendLead: string
  legend: { title: string; text: string }[]
  sectionCount: (n: number) => string
  startHere: string
  sectionsHeading: string
  installHeading: string
}

interface StepLabels { title: string; note: string }

const en: CatalogLabels = {
  title: 'Components',
  lead: (count) => `${String(count)} components, each with a live preview: every state at once, a playground wired to the real props, and the import line.`,
  metaTitle: 'Components - TopClass UI',
  description: 'Every TopClass UI component on one page, with a live preview, a playground on the real props, every state and its import line.',
  beforeTitle: 'Before you start',
  beforeOnce: 'once per app',
  beforeLead: 'Every card below shows an import line. These three steps make it work.',
  steps: {
    install: {
      title: '1. Install the package',
      note: 'Three peer dependencies: react, react-dom and Tailwind CSS 4.2 or later. Your project already has them, and zod installs with the package.',
    },
    css: {
      title: '2. The Tailwind CSS v4 entry',
      note: 'Three lines, in this order, and no tailwind.config.js. The third carries the mapping that gives Tailwind the semantic class names.',
    },
    layout: {
      title: '3. The root layout',
      note: 'Pass direction and locale to TopClassProvider as props from your layout; never read them from document.dir in an effect. ThemeScript goes first in <head>: it sets data-theme before the first paint.',
    },
  },
  legendTitle: 'How to read a card',
  legendLead: 'Every component below is laid out the same way, so you learn it once. Five parts, top to bottom.',
  legend: [
    { title: 'The stage', text: 'The component in its most common configuration, on the page background, so you see it in context.' },
    { title: 'Try it', text: 'Every prop you can change, with its allowed values.' },
    { title: 'The code', text: 'The JSX that produces the preview above it. Copy it, paste it and it runs.' },
    { title: 'Every state', text: 'Hover, focus, disabled, loading, error - all at once. You never hover to review a state.' },
    { title: 'Import it', text: 'The one import line from the package, and the install command.' },
  ],
  sectionCount: (n) => (n === 1 ? '1 component' : `${String(n)} components`),
  startHere: 'Start here',
  sectionsHeading: 'Sections',
  installHeading: 'Before you start',
}

const ar: CatalogLabels = {
  title: 'المكوّنات',
  lead: (count) => `${String(count)} مكوّنًا، لكل واحد عرض حيّ: كل الحالات معًا، ومساحة تجربة موصولة بالخصائص الحقيقية، وسطر الاستيراد.`,
  metaTitle: 'المكوّنات - TopClass UI',
  description: 'كل مكوّنات TopClass UI في صفحة واحدة، مع عرض حيّ ومساحة تجربة على الخصائص الحقيقية وكل الحالات وسطر الاستيراد.',
  beforeTitle: 'قبل أن تبدأ',
  beforeOnce: 'مرة واحدة لكل تطبيق',
  beforeLead: 'كل بطاقة أدناه تعرض سطر استيراد. هذه الخطوات الثلاث تجعله يعمل.',
  steps: {
    install: {
      title: '1. ثبّت الحزمة',
      note: 'ثلاث اعتماديات نظيرة: react وreact-dom وTailwind CSS 4.2 أو أحدث. مشروعك فيه هذه بالفعل، وzod يُثبَّت مع الحزمة.',
    },
    css: {
      title: '2. مدخل Tailwind CSS v4',
      note: 'ثلاثة أسطر، بهذا الترتيب، وبلا tailwind.config.js. السطر الثالث يحمل الربط الذي يعطي Tailwind أسماء الأصناف الدلالية.',
    },
    layout: {
      title: '3. التخطيط الجذري',
      note: 'مرّر direction وlocale إلى TopClassProvider خاصيتين من التخطيط؛ ولا تقرأهما أبدًا من document.dir داخل effect. يأتي ThemeScript أولًا في <head>: يضبط data-theme قبل أول رسم.',
    },
  },
  legendTitle: 'كيف تقرأ البطاقة',
  legendLead: 'كل مكوّن أدناه مرتّب بالطريقة نفسها، فتتعلمها مرة واحدة. خمسة أجزاء، من الأعلى إلى الأسفل.',
  legend: [
    { title: 'العرض', text: 'المكوّن في أكثر إعداداته شيوعًا، على خلفية الصفحة، لتراه في سياقه.' },
    { title: 'جرّبه', text: 'كل خاصية يمكنك تغييرها، مع قيمها المسموح بها.' },
    { title: 'الشيفرة', text: 'شيفرة JSX التي تنتج العرض فوقها. انسخها والصقها فتعمل.' },
    { title: 'كل الحالات', text: 'التمرير والتركيز والتعطيل والتحميل والخطأ - كلها معًا. لا تحتاج إلى التمرير لمراجعة حالة.' },
    { title: 'استورده', text: 'سطر الاستيراد الواحد من الحزمة، وأمر التثبيت.' },
  ],
  sectionCount: (n) => {
    const rule = new Intl.PluralRules('ar').select(n)
    if (rule === 'one') return 'مكوّن واحد'
    if (rule === 'two') return 'مكوّنان'
    return `${String(n)} ${rule === 'few' ? 'مكوّنات' : 'مكوّنًا'}`
  },
  startHere: 'ابدأ من هنا',
  sectionsHeading: 'الأقسام',
  installHeading: 'قبل أن تبدأ',
}

export const CATALOG_LABELS: Record<Locale, CatalogLabels> = { en, ar }
