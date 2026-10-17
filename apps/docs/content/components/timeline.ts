// The hand-written data of the Timeline page and card (docs-site S7), in English and Arabic.
export const timeline = {
  slug: 'timeline',
  demos: ['basic', 'tones', 'icons', 'long-text', 'empty', 'rtl'],
  stageDemo: 'basic',
  stageHeight: 18,
  related: ['stepper', 'table', 'tree-view', 'empty-state'],
  en: {
    title: 'Timeline',
    description: 'A rail of dated events, each with a marker in its tone. It renders on the server and mirrors by itself in right-to-left layouts.',
    note: 'An item\'s icon is an element, such as `<Svg icon={check} size="xs" />`, not an icon name: no icon loader ships.',
    notes: [
      'An item is `{ title, time?, status?, tone?, icon? }`, plus any field of your own, such as an `id` for `getKey`.',
      'Pass a `<time dateTime="...">` as `time` for a date a machine can read; it shows muted under the title.',
      'A `done` item is a filled dot, `current` a dot in a ring and `todo` a hollow dot. With no tone, `done` is success and the rest are primary; a `todo` marker stays hollow whatever the tone.',
      'Timeline renders the `items` it is given, in that order: it never sorts, fetches or pages.',
      'No items renders `emptyFallback` on its own, or nothing without one.',
    ],
    keyboard: [],
    a11y: [
      'An ordered list, with `role="list"` written so Safari with VoiceOver keeps it.',
      'The marker is a shape and a colour, so each status is also said in hidden words from `labels`; the current item carries `aria-current="step"`.',
      'Nothing in it takes focus: it is page content, not a control.',
    ],
    rtl: 'The rail sits at the inline start, on the right in Arabic, with no direction prop. Pass `labels` for the status words in Arabic.',
  },
  ar: {
    title: 'خط زمني',
    description: 'مسار من الأحداث المؤرّخة، لكل حدث علامة بنبرته. يُعرض على الخادم وينعكس وحده في التخطيطات من اليمين إلى اليسار.',
    note: 'أيقونة العنصر عنصرٌ، مثل `<Svg icon={check} size="xs" />`، لا اسم أيقونة: لا يُشحن أي محمّل أيقونات.',
    notes: [
      'العنصر هو `{ title, time?, status?, tone?, icon? }`، وأي حقل خاص بك، مثل `id` لـ `getKey`.',
      'مرّر `<time dateTime="...">` في `time` لتاريخ تقرؤه الآلة، ويظهر باهتًا تحت العنوان.',
      'العنصر `done` نقطة ممتلئة، و`current` نقطة داخل حلقة، و`todo` نقطة مفرّغة. بلا نبرة يكون `done` بنبرة success والبقية بنبرة primary، وتبقى علامة `todo` مفرّغة أيًّا كانت النبرة.',
      'يعرض الخط الزمني `items` كما تصله وبترتيبها: لا يرتّب ولا يجلب البيانات ولا يقسّمها إلى صفحات.',
      'عند غياب العناصر يُعرض `emptyFallback` وحده، أو لا شيء إن لم يُمرَّر.',
    ],
    keyboard: [],
    a11y: [
      'قائمة مرتّبة، مع `role="list"` مكتوبًا كي يحتفظ بها Safari مع VoiceOver.',
      'العلامة شكل ولون، فتُقال كل حالة أيضًا بكلمات مخفية من `labels`، والعنصر الحالي يحمل `aria-current="step"`.',
      'لا شيء فيه يأخذ التركيز: هو محتوى الصفحة، لا عنصر تحكم.',
    ],
    rtl: 'يقع المسار في بداية السطر، على اليمين في العربية، بلا خاصية اتجاه. مرّر `labels` لتُقال كلمات الحالات بالعربية.',
  },
} as const
