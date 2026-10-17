// The seven catalog sections and their 46 cards, in Figma's order (docs-site page 13).
export const SECTIONS = [
  {
    id: 'actions',
    title: { en: 'Actions', ar: 'الإجراءات' },
    lead: {
      en: 'Things a person clicks. Each one renders on the server unless it needs an event handler in the browser.',
      ar: 'ما ينقر عليه المستخدم. كل واحد منها يُعرض على الخادم ما لم يحتج إلى معالج أحداث في المتصفح.',
    },
    slugs: ['button', 'tag', 'kbd', 'segmented-control'],
    pages: [],
  },
  {
    id: 'forms',
    title: { en: 'Forms', ar: 'النماذج' },
    lead: {
      en: 'Each control carries a real name and submits inside a plain <form>. Input and Textarea work before any JavaScript loads; the rest submit their default value and become interactive once it does.',
      ar: 'كل عنصر تحكم يحمل اسمًا حقيقيًا ويُرسَل داخل <form> عادي. يعمل Input وTextarea قبل تحميل أي JavaScript، والبقية ترسل قيمتها الافتراضية وتصبح تفاعلية بعد تحميله.',
    },
    slugs: [
      'input', 'textarea', 'select', 'combobox', 'checkbox', 'radio-group', 'switch', 'slider',
      'number-field', 'otp-field', 'date-picker', 'file-upload', 'rating',
    ],
    pages: ['field', 'form'],
  },
  {
    id: 'display',
    title: { en: 'Display', ar: 'العرض' },
    lead: {
      en: 'Presentational pieces. Nearly all of them render on the server and ship no JavaScript; where one adds a button, such as a removable Tag, the chip on its card says so.',
      ar: 'قطع للعرض. كلها تقريبًا تُعرض على الخادم ولا ترسل أي JavaScript، وحين يضيف أحدها زرًا، مثل Tag القابل للإزالة، تقول ذلك الشارة على بطاقته.',
    },
    slugs: ['badge', 'avatar', 'avatar-group', 'card', 'separator', 'skeleton', 'code-block'],
    pages: [],
  },
  {
    id: 'data',
    title: { en: 'Data', ar: 'البيانات' },
    lead: {
      en: 'Every list component works the same way: a prop for visible rows, windowing above 200 items, and a loadMore callback. It never fetches.',
      ar: 'كل مكوّن قائمة يعمل بالطريقة نفسها: خاصية للصفوف الظاهرة، وعرض نافذي فوق 200 عنصر، ودالة loadMore. ولا يجلب البيانات بنفسه أبدًا.',
    },
    slugs: ['table', 'tree-view', 'timeline', 'stepper'],
    pages: [],
  },
  {
    id: 'feedback',
    title: { en: 'Feedback', ar: 'التنبيهات' },
    lead: {
      en: 'Status, progress and empty states. Toast and Progress announce themselves to screen readers; the rest stay silent.',
      ar: 'الحالة والتقدم والحالات الفارغة. يعلن Toast وProgress عن نفسيهما لقارئ الشاشة، والبقية تبقى صامتة.',
    },
    slugs: ['alert', 'toast', 'banner', 'progress', 'spinner', 'empty-state'],
    pages: ['meter'],
  },
  {
    id: 'overlays',
    title: { en: 'Overlays', ar: 'الطبقات' },
    lead: {
      en: 'Overlays share one scroll rule: the overlay scrolls, the page behind it does not. Placement is logical, so it mirrors in Arabic.',
      ar: 'تشترك الطبقات في قاعدة تمرير واحدة: تتمرر الطبقة ولا تتمرر الصفحة خلفها. والموضع منطقي، فينعكس في العربية.',
    },
    slugs: ['dialog', 'drawer', 'popover', 'tooltip', 'dropdown', 'command'],
    pages: [],
  },
  {
    id: 'navigation',
    title: { en: 'Navigation', ar: 'التنقّل' },
    lead: {
      en: 'Links are links. Every one of these renders a real <a href>, so middle-click, open in a new tab and crawlers all work.',
      ar: 'الروابط روابط. كل واحد من هذه يعرض <a href> حقيقيًا، فيعمل النقر بالزر الأوسط والفتح في علامة تبويب جديدة وزواحف البحث.',
    },
    slugs: ['navbar', 'sidebar', 'tabs', 'accordion', 'breadcrumb', 'pagination'],
    pages: [],
  },
] as const

export type Section = (typeof SECTIONS)[number]
export type SectionId = Section['id']
export type CatalogSlug = Section['slugs'][number]
/** A component with a page of its own and no catalog card (choice 5): Field, Form and Meter. */
export type PageOnlySlug = Section['pages'][number]
