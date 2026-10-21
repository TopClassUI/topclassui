// The hand-written data of one component page (docs-site S7), in en and ar.
export const combobox = {
  slug: 'combobox',
  title: {
    en: 'Combobox',
    ar: 'قائمة اختيار مع بحث',
  },
  description: {
    en: 'A text input that filters a list as you type. It is windowed above 200 options and calls loadMore for the next page.',
    ar: 'حقل نص يصفّي قائمة أثناء الكتابة. يعرض الصفوف الظاهرة فقط بعد 200 خيار، ويستدعي loadMore لجلب الصفحة التالية.',
  },
  demos: ['basic', 'form', 'sizes', 'load-more', 'status', 'ten-thousand', 'long-content', 'rtl'],
  stageHeight: 7,
  extraSwitches: ['disabled'],
  note: {
    en: 'Filtering runs over the options loaded so far; the next page arrives through `hasMore` and `loadMore`.',
    ar: 'تجري التصفية على الخيارات المحمّلة حتى الآن؛ وتصل الصفحة التالية عبر `hasMore` و`loadMore`.',
  },
  notes: {
    en: [
      '`items` takes `{ value, label, disabled? }`: typing is matched against the label, and the form receives the value. Keep the array the same between renders.',
      'The component asks and never fetches: with `hasMore` it calls `loadMore` once the open list is `loadMoreThreshold` rows (10) from its end, and you append the next page to `items`.',
      '`status` says what is on its way: `loading` draws a spinner in place of the caret, `loading-more` writes a line under the options.',
      '`virtualize` is `auto` by default: above 200 options only the rows in view and a few around them are mounted, and the highlight still reaches every option.',
      'A query with no match says `emptyFallback`, or the provider\'s "no results" label. `maxLength` caps the query at 256 by default.',
    ],
    ar: [
      '`items` يأخذ `{ value, label, disabled? }`: تُطابق الكتابة مع التسمية، ويستلم النموذج القيمة. أبقِ المصفوفة نفسها بين مرات العرض.',
      'المكوّن يطلب ولا يجلب أبدًا: مع `hasMore` يستدعي `loadMore` حين تقترب القائمة المفتوحة من نهايتها بمقدار `loadMoreThreshold` صفوف (10)، وأنت تضيف الصفحة التالية إلى `items`.',
      '`status` يخبر بما هو قادم: `loading` يرسم مؤشر تحميل مكان السهم، و`loading-more` يكتب سطرًا تحت الخيارات.',
      '`virtualize` قيمته `auto` افتراضيًا: بعد 200 خيار تُركَّب الصفوف الظاهرة وقليل حولها فقط، ويبقى التمييز قادرًا على الوصول إلى كل خيار.',
      'البحث بلا نتيجة يعرض `emptyFallback`، أو تسمية "لا نتائج" من المزوّد. و`maxLength` يحدّ البحث بـ256 حرفًا افتراضيًا.',
    ],
  },
  keyboard: [
    { keys: ['ArrowDown'], action: { en: 'Opens the list on its first row; in the list, moves down and wraps back to the input.', ar: 'يفتح القائمة على صفها الأول؛ وداخلها ينتقل إلى الأسفل ويعود إلى الحقل بعد الصف الأخير.' } },
    { keys: ['ArrowUp'], action: { en: 'Moves up; past the first row it goes back to the input, then to the last row.', ar: 'ينتقل إلى الأعلى؛ وبعد الصف الأول يعود إلى الحقل، ثم إلى الصف الأخير.' } },
    { keys: ['Enter'], action: { en: 'Chooses the highlighted option and closes the list.', ar: 'يختار الخيار المميّز ويغلق القائمة.' } },
    { keys: ['Escape'], action: { en: 'Closes the list; on the closed input, clears the value.', ar: 'يغلق القائمة؛ وعلى الحقل المغلق يمسح القيمة.' } },
    { keys: ['ArrowLeft', 'ArrowRight'], action: { en: 'Move the caret in the text.', ar: 'يحرّكان المؤشر داخل النص.' } },
    { keys: ['Home', 'End'], action: { en: 'Move the caret to the start or the end of the text.', ar: 'ينقلان المؤشر إلى بداية النص أو نهايته.' } },
  ],
  accessibility: {
    en: [
      'A name is required: `id` for a `<label htmlFor>`, or `aria-label`, or `aria-labelledby`. The input is an `<input role="combobox">`.',
      'The input keeps the focus while the highlight moves through the list, as the editable combobox of the ARIA Authoring Practices does.',
      'Escape on the closed input clears the value, so the form then sends an empty value.',
    ],
    ar: [
      'الاسم مطلوب: `id` لتسمية `<label htmlFor>`، أو `aria-label`، أو `aria-labelledby`. الحقل هو `<input role="combobox">`.',
      'يبقى التركيز في الحقل بينما يتحرك التمييز في القائمة، كما في نمط القائمة القابلة للكتابة من ARIA Authoring Practices.',
      'مفتاح Escape على الحقل المغلق يمسح القيمة، فيرسل النموذج بعدها قيمة فارغة.',
    ],
  },
  rtl: {
    en: 'The caret and the tick sit at the left, and `bottom-start` lines the list up with the right edge of the input. ArrowLeft and ArrowRight move the caret in the text, in Arabic too.',
    ar: 'يقع السهم وعلامة الاختيار على اليسار، و`bottom-start` تحاذي القائمة مع الحافة اليمنى للحقل. ArrowLeft وArrowRight يحرّكان المؤشر داخل النص، في العربية أيضًا.',
  },
  related: {
    components: ['select', 'input', 'radio-group', 'field', 'form'],
    pages: ['accessibility', 'rtl'],
  },
} as const
