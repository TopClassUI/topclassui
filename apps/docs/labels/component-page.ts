// The strings of the Previewer (S8), a component's page (page 14) and the preview route (S9), in en and ar.
import type { Locale } from '../lib/locales'

export interface ComponentPageLabels {
  home: string
  components: string
  /** The h2 of each section of a component's page, in On this page's order. */
  sections: {
    examples: string
    props: string
    keyboard: string
    rtl: string
    serverClient: string
    related: string
  }
  modes: { light: string; dark: string; ocean: string }
  cardMode: (component: string) => string
  install: string
  tryIt: string
  theCode: string
  copyCode: string
  everyState: string
  stateCount: (n: number) => string
  /** A state's caption by its id in dummy/states.tsx; an id missing here, a prop value such as sm or solid, stays Latin. */
  stateNames: Record<string, string>
  /** The visible word on the code's copy button, and what its status says. */
  copy: string
  copied: string
  copyFailed: string
  copySource: string
  copySourceNote: string
  copyAdd: (component: string) => string
  thenImport: string
  thenImportNote: string
  copyImport: (component: string) => string
  chip: { lazy: string }
  demoTabs: (component: string) => string
  preview: string
  code: string
  copyDemo: (demo: string, component: string) => string
  density: string
  radius: string
  knobValues: { compact: string; normal: string; comfortable: string; square: string; rounded: string; pill: string }
  table: { prop: string; type: string; default: string; limits: string; description: string; caption: (part: string) => string }
  noProps: string
  keys: string
  action: string
  keyboardCaption: (component: string) => string
  noKeyboard: string
  rendersOn: { server: string; split: string; client: string }
  filesLine: (files: string) => string
  sizeLine: (chip: string) => string
  sectionPeers: (section: string) => string
  rulePages: string
  rtlDemo: string
  anchor: (heading: string) => string
}

/** The guide pages a component page links to; the registry (S1) replaces this once the shell lands. */
export const RULE_PAGE_TITLES: Record<string, Record<Locale, string>> = {
  'server-first': { en: 'Server first', ar: 'الخادم أولًا' },
  accessibility: { en: 'Accessibility', ar: 'إمكانية الوصول' },
  rtl: { en: 'Right to left', ar: 'من اليمين إلى اليسار' },
  theming: { en: 'Theming', ar: 'السمات' },
  colors: { en: 'Colors', ar: 'الألوان' },
  icons: { en: 'Icons', ar: 'الأيقونات' },
  installation: { en: 'Install the package', ar: 'تثبيت الحزمة' },
  provider: { en: 'Provider', ar: 'المزوّد' },
  css: { en: 'CSS entry', ar: 'مدخل CSS' },
  'first-component': { en: 'Your first component', ar: 'مكوّنك الأول' },
}

const en: ComponentPageLabels = {
  home: 'Home',
  components: 'Components',
  sections: {
    examples: 'Examples',
    props: 'Props',
    keyboard: 'Keyboard and accessibility',
    rtl: 'Right to left',
    serverClient: 'Server and client',
    related: 'Related',
  },
  modes: { light: 'Light', dark: 'Dark', ocean: 'Ocean' },
  cardMode: (component) => `Colour mode for ${component}`,
  install: 'Install',
  tryIt: 'Try it',
  theCode: 'The code',
  copyCode: 'Copy the code',
  everyState: 'Every state',
  stateCount: (n) => (n === 1 ? '1 state' : `${String(n)} states`),
  stateNames: {},
  copy: 'Copy',
  copied: 'Copied',
  copyFailed: 'Could not copy',
  copySource: 'Copy the source',
  copySourceNote: 'Source lands in your repo. You own it.',
  copyAdd: (component) => `Copy the add command for ${component}`,
  thenImport: 'Then import it',
  thenImportNote: 'It is your file now. Edit it freely; topclassui diff shows what changed upstream.',
  copyImport: (component) => `Copy the import for ${component}`,
  chip: { lazy: 'lazy' },
  demoTabs: (component) => `${component} demo`,
  preview: 'Preview',
  code: 'Code',
  copyDemo: (demo, component) => `Copy the ${demo} code for ${component}`,
  density: 'Density',
  radius: 'Radius',
  knobValues: { compact: 'Compact', normal: 'Normal', comfortable: 'Comfortable', square: 'Square', rounded: 'Rounded', pill: 'Pill' },
  table: {
    prop: 'Prop',
    type: 'Type',
    default: 'Default',
    limits: 'Limits',
    description: 'Description',
    caption: (part) => `The props of ${part}`,
  },
  noProps: 'No props of its own: it takes the attributes of the element it renders.',
  keys: 'Keys',
  action: 'What it does',
  keyboardCaption: (component) => `The keyboard of ${component}`,
  noKeyboard: 'Nothing to operate: it is not interactive on its own.',
  rendersOn: {
    server: 'Renders on the server and ships no JavaScript.',
    split: 'Renders on the server; the interactive part is a client component that ships only when it is used.',
    client: 'A client component: it renders on the server and hydrates in the browser.',
  },
  filesLine: (files) => `Files: ${files}.`,
  sizeLine: (chip) => `On the chip: ${chip}.`,
  sectionPeers: (section) => `More in ${section}`,
  rulePages: 'The rules behind it',
  rtlDemo: 'In Arabic, right to left',
  anchor: (heading) => `Link to the ${heading} section`,
}

const ar: ComponentPageLabels = {
  home: 'الصفحة الرئيسية',
  components: 'المكوّنات',
  sections: {
    examples: 'أمثلة',
    props: 'الخصائص',
    keyboard: 'لوحة المفاتيح وإمكانية الوصول',
    rtl: 'من اليمين إلى اليسار',
    serverClient: 'الخادم والمتصفح',
    related: 'ذو صلة',
  },
  modes: { light: 'فاتح', dark: 'داكن', ocean: 'محيط' },
  cardMode: (component) => `وضع الألوان لـ ${component}`,
  install: 'تثبيت',
  tryIt: 'جرّبه',
  theCode: 'الشيفرة',
  copyCode: 'انسخ الشيفرة',
  everyState: 'كل الحالات، بدون تمرير الفأرة',
  stateCount: (n) => {
    const rule = new Intl.PluralRules('ar').select(n)
    const word = { zero: 'حالة', one: 'حالة واحدة', two: 'حالتان', few: 'حالات', many: 'حالة', other: 'حالة' }[rule]
    return rule === 'one' || rule === 'two' ? word : `${String(n)} ${word}`
  },
  stateNames: {
    idle: 'عادي', hover: 'تمرير', active: 'ضغط', 'focus-visible': 'تركيز', disabled: 'معطّل', loading: 'تحميل',
    invalid: 'غير صالح', 'read-only': 'للقراءة فقط', empty: 'فارغ', selected: 'محدّد', unselected: 'غير محدّد', open: 'مفتوح',
    closed: 'مغلق', error: 'خطأ', success: 'نجاح', warning: 'تحذير', info: 'معلومة', danger: 'خطر', current: 'الحالية',
    todo: 'لاحقة', done: 'منجزة', complete: 'مكتمل', checked: 'محدّد', unchecked: 'غير محدّد', indeterminate: 'جزئي',
    collapsed: 'مطويّ', expanded: 'موسّع', on: 'مفعّل', off: 'متوقف', today: 'اليوم', scrolled: 'بعد التمرير', sorted: 'مرتّب',
    filtered: 'مصفّى', dismissed: 'مُغلق', partial: 'جزئي', half: 'نصف', full: 'كامل', default: 'افتراضي',
  },
  copy: 'نسخ',
  copied: 'نُسخ',
  copyFailed: 'تعذّر النسخ',
  copySource: 'انسخ الشيفرة المصدرية',
  copySourceNote: 'تصل الشيفرة إلى مستودعك. أنت تملكها.',
  copyAdd: (component) => `انسخ أمر الإضافة لـ ${component}`,
  thenImport: 'ثم استورده',
  thenImportNote: 'الملف ملفك الآن. عدّله بحرية؛ يُظهر topclassui diff ما تغيّر في المصدر.',
  copyImport: (component) => `انسخ الاستيراد لـ ${component}`,
  chip: { lazy: 'عند الطلب' },
  demoTabs: (component) => `مثال ${component}`,
  preview: 'العرض',
  code: 'الشيفرة',
  copyDemo: (demo, component) => `انسخ شيفرة ${demo} لـ ${component}`,
  density: 'الكثافة',
  radius: 'الاستدارة',
  knobValues: { compact: 'مضغوط', normal: 'عادي', comfortable: 'مريح', square: 'مربّع', rounded: 'مستدير', pill: 'كبسولة' },
  table: {
    prop: 'الخاصية',
    type: 'النوع',
    default: 'الافتراضي',
    limits: 'الحدود',
    description: 'الوصف',
    caption: (part) => `خصائص ${part}`,
  },
  noProps: 'لا خصائص خاصة به: يأخذ سمات العنصر الذي يعرضه.',
  keys: 'المفاتيح',
  action: 'ما يفعله',
  keyboardCaption: (component) => `لوحة مفاتيح ${component}`,
  noKeyboard: 'لا شيء يُشغَّل: ليس تفاعليًا بمفرده.',
  rendersOn: {
    server: 'يُعرض على الخادم ولا يرسل أي JavaScript.',
    split: 'يُعرض على الخادم، والجزء التفاعلي مكوّن متصفح لا يُرسل إلا عند استخدامه.',
    client: 'مكوّن متصفح: يُعرض على الخادم ثم يُرطَّب في المتصفح.',
  },
  filesLine: (files) => `الملفات: ${files}.`,
  sizeLine: (chip) => `على الشارة: ${chip}.`,
  sectionPeers: (section) => `المزيد في ${section}`,
  rulePages: 'القواعد وراءه',
  rtlDemo: 'بالعربية، من اليمين إلى اليسار',
  anchor: (heading) => `رابط إلى قسم ${heading}`,
}

export const COMPONENT_PAGE_LABELS: Record<Locale, ComponentPageLabels> = { en, ar }
