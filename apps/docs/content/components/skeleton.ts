// The hand-written data of one component page (docs-site S7), in en and ar.
export const skeleton = {
  slug: 'skeleton',
  title: { en: 'Skeleton', ar: 'هيكل التحميل' },
  description: {
    en: 'A placeholder that holds the shape of content while it loads: lines of text, a circle, a rectangle or a card.',
    ar: 'عنصر نائب يحجز شكل المحتوى أثناء تحميله: أسطر نص، أو دائرة، أو مستطيل، أو بطاقة.',
  },
  demos: ['media-object', 'variants', 'rows', 'beside-text', 'custom-size', 'rtl'],
  stageHeight: 14,
  codeDemo: 'media-object',
  note: {
    en: 'Give the skeleton the real dimensions through className; rows is clamped from 1 to 50, and a wrong size is a layout shift.',
    ar: 'أعطِ الهيكل الأبعاد الحقيقية عبر className؛ تُحصر rows بين 1 و50، والحجم الخاطئ يعني إزاحة في التخطيط.',
  },
  notes: {
    en: [
      'Most often it is a `<Suspense>` fallback. Pick the shape of what is coming with `variant`: `text`, `circle`, `rect` or `card`.',
      'The text shape is as tall as the lines it replaces at any type step, so set the type step on it as you would on the text.',
      'With more than one row, the last row is two thirds wide, as a paragraph ends.',
      'The pulse stops under reduced motion.',
      'Badge, Avatar, Button, Card, Input, Table and Textarea also ship a skeleton of their own exact size.',
    ],
    ar: [
      'غالبًا ما يكون البديل في `<Suspense>`. اختر شكل ما سيأتي عبر `variant`: `text` أو `circle` أو `rect` أو `card`.',
      'شكل النص بارتفاع الأسطر التي ينوب عنها عند أي درجة خط، فاضبط درجة الخط عليه كما تضبطها على النص.',
      'عند وجود أكثر من سطر يكون عرض السطر الأخير ثلثي العرض، كما تنتهي الفقرة.',
      'تتوقف النبضة عند تفضيل تقليل الحركة.',
      'تأتي `Badge` و`Avatar` و`Button` و`Card` و`Input` و`Table` و`Textarea` أيضًا بهيكل تحميل بمقاسها هي تمامًا.',
    ],
  },
  keyboard: [],
  accessibility: {
    en: [
      'Every shape renders `aria-hidden`, so a screen reader never reads a list of empty boxes.',
      'Mark the loading region itself, for example with `aria-busy="true"` on the element the content will fill.',
    ],
    ar: [
      'كل شكل يُعرض مع `aria-hidden`، فلا يقرأ قارئ الشاشة قائمة من الصناديق الفارغة.',
      'علِّم المنطقة التي تُحمَّل نفسها، مثلًا بـ `aria-busy="true"` على العنصر الذي سيملؤه المحتوى.',
    ],
  },
  rtl: {
    en: 'Rows start at the inline start, so the short last row and a circle beside the text sit on the right in Arabic.',
    ar: 'تبدأ الأسطر من بداية السطر، فيقع السطر الأخير القصير والدائرة بجانب النص على اليمين في العربية.',
  },
  related: {
    components: ['card', 'avatar', 'badge', 'spinner'],
    pages: ['server-first', 'accessibility'],
  },
} as const
