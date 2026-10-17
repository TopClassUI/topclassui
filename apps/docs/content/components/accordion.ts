// The hand-written data of the Accordion page and card (docs-site S7), in en and ar; `x` in a string is inline code.
export const accordion = {
  slug: 'accordion',
  title: {
    en: 'Accordion',
    ar: 'الأكورديون',
  },
  description: {
    en: 'Sections a reader opens one at a time. Closed panels stay in the HTML, so a crawler reads them and find-in-page opens them.',
    ar: 'أقسام يفتحها القارئ واحدًا تلو الآخر. اللوحات المغلقة تبقى في HTML، فيقرؤها الزاحف ويفتحها البحث في الصفحة.',
  },
  demos: ['basic', 'first-open', 'multiple', 'disabled', 'long-content', 'many-items', 'rtl'],
  stageHeight: 14,
  note: {
    en: 'A closed panel is hidden="until-found": the browser\'s search, an #id link or a text fragment opens it.',
    ar: 'اللوحة المغلقة hidden="until-found": بحث المتصفح أو رابط #id أو جزء نصي في العنوان يفتحها.',
  },
  notes: {
    en: [
      'Two flat parts and no bare `Accordion`: `AccordionRoot` and `AccordionItem`. An item needs `value` and `title`; its children are the panel.',
      'Open at first: `defaultValue={[\'install\']}` on the root, the `value` of each item that starts open. It is plain data, so a server page can pass it.',
      'One at a time is the default, and pressing the open item closes it. `multiple` leaves the others as they are.',
      'The title is text or inline elements, such as an icon or a `Badge`. No link and no button: it sits inside a button. Put the link in the panel.',
      'A table wider than the box scrolls sideways inside its panel. A long title wraps and is never cut.',
      '`hiddenUntilFound={false}` on the root takes closed panels out of the page; `keepMounted` then keeps them, hidden from the search too.',
      'From a server page, pass text, booleans and `defaultValue`. `value` with `onValueChange`, and `onOpenChange`, need a `\'use client\'` file.',
    ],
    ar: [
      'جزءان بأسماء مسطّحة، ولا يوجد `Accordion` وحده: `AccordionRoot` و`AccordionItem`. العنصر يحتاج `value` و`title`، وأبناؤه هم اللوحة.',
      'مفتوح من البداية: `defaultValue={[\'install\']}` على الجذر، وهي قيم `value` للعناصر التي تبدأ مفتوحة. بيانات بسيطة، فتمرّرها صفحة خادم.',
      'عنصر واحد في كل مرة هو الافتراضي، والضغط على العنصر المفتوح يغلقه. `multiple` يترك العناصر الأخرى كما هي.',
      'العنوان نص أو عناصر سطرية، مثل أيقونة أو `Badge`. لا رابط ولا زر: العنوان داخل زر. ضع الرابط في اللوحة.',
      'الجدول الأعرض من الصندوق يمرّر أفقيًا داخل لوحته. العنوان الطويل يلتف على أسطر ولا يُقصّ أبدًا.',
      '`hiddenUntilFound={false}` على الجذر يُخرج اللوحات المغلقة من الصفحة، و`keepMounted` يبقيها حينها مخفية عن البحث أيضًا.',
      'من صفحة خادم مرّر النصوص والقيم المنطقية و`defaultValue`. أما `value` مع `onValueChange`، و`onOpenChange`، فتحتاج ملفًا فيه `\'use client\'`.',
    ],
  },
  keyboard: [
    { keys: ['Tab'], action: { en: 'Moves from trigger to trigger.', ar: 'ينتقل من زر فتح إلى الذي يليه.' } },
    { keys: ['Shift', 'Tab'], action: { en: 'Moves back.', ar: 'يعود إلى الخلف.' } },
    { keys: ['Enter'], action: { en: 'Opens or closes the focused item.', ar: 'يفتح العنصر الذي عليه التركيز أو يغلقه.' } },
    { keys: ['Space'], action: { en: 'Opens or closes the focused item.', ar: 'يفتح العنصر الذي عليه التركيز أو يغلقه.' } },
  ],
  accessibility: {
    en: [
      'Set `headingLevel` on each item, 2 to 6 (default 3): one more than the heading above the accordion. It is clamped to that range.',
      'A screen reader hears the trigger as a button in a heading, expanded or collapsed, and an open panel as a region named by its title.',
      'A `disabled` item keeps its trigger in the tab order and says that it is disabled. Reduced motion removes the 150 ms fade.',
    ],
    ar: [
      'اضبط `headingLevel` على كل عنصر، من 2 إلى 6 (الافتراضي 3): أعلى بدرجة من العنوان الذي فوق الأكورديون. القيمة محصورة في هذا المدى.',
      'يسمع قارئ الشاشة زر الفتح زرًّا داخل عنوان، موسَّعًا أو مطويًّا، واللوحة المفتوحة منطقة اسمها عنوانها.',
      'العنصر المعطّل بـ`disabled` يبقي زره في ترتيب التنقل ويعلن أنه معطّل. تقليل الحركة يلغي التلاشي ذا 150 ms.',
    ],
  },
  rtl: {
    en: 'Nothing is told the direction: under dir="rtl" the title starts at the right and the caret sits at the left, the inline end.',
    ar: 'لا شيء يُخبَر بالاتجاه: مع dir="rtl" يبدأ العنوان من اليمين ويجلس السهم على اليسار، في نهاية السطر.',
  },
  related: {
    components: ['tabs', 'sidebar', 'card'],
    pages: ['server-first', 'accessibility', 'rtl'],
  },
} as const
