// The hand-written data of one component page (docs-site S7), in en and ar.
export const card = {
  slug: 'card',
  title: { en: 'Card', ar: 'بطاقة' },
  description: {
    en: 'A surface for content that belongs together, with a larger radius than a control so it never reads as a button.',
    ar: 'سطح لمحتوى يجمعه موضوع واحد، باستدارة أكبر من استدارة عنصر التحكم كي لا تبدو البطاقة زرًا أبدًا.',
  },
  demos: ['basic', 'with-actions', 'report', 'paragraphs', 'grid', 'skeleton', 'rtl'],
  stageHeight: 15.625,
  stageDemo: 'basic',
  controlOrder: ['interactive', 'media', 'footer'],
  extraSwitches: ['interactive', 'media', 'footer'],
  starts: { footer: true },
  note: {
    en: 'Card sets the type of its title and leaves the heading level to you: put the h2 or h3 inside CardHeader.',
    ar: 'تحدد البطاقة خط عنوانها وتترك لك مستوى العنوان: ضع h2 أو h3 داخل CardHeader.',
  },
  notes: {
    en: [
      'Every part is a flat export: `CardRoot`, `CardHeader`, `CardBody`, `CardFooter` and `CardSkeleton`. There is no `Card`.',
      'A card is not interactive itself; what the user can do goes in `CardFooter` as a Button, in a row that wraps when the card is narrow.',
      '`CardBody` is a block, so space several paragraphs yourself, for example with `space-y-2`.',
      'Card takes the width of its container: in a grid, each card fills its cell and the height of its row.',
      '`CardSkeleton` holds the full width at 5:2 while data loads; pass the real height in `className`.',
    ],
    ar: [
      'كل جزء مُصدَّر باسم مستقل: `CardRoot` و`CardHeader` و`CardBody` و`CardFooter` و`CardSkeleton`. لا يوجد `Card`.',
      'البطاقة نفسها ليست تفاعلية؛ ما يمكن للمستخدم فعله يوضع في `CardFooter` على شكل `Button`، في صف يلتف حين تضيق البطاقة.',
      '`CardBody` عنصر كتلي، فباعد بين الفقرات المتعددة بنفسك، مثلًا بـ `space-y-2`.',
      'تأخذ البطاقة عرض حاويتها: في الشبكة تملأ كل بطاقة خليتها وارتفاع صفها.',
      '`CardSkeleton` يحجز العرض كاملًا بنسبة 5:2 أثناء تحميل البيانات؛ مرّر الارتفاع الحقيقي في `className`.',
    ],
  },
  keyboard: [],
  accessibility: {
    en: [
      'Card renders plain `div` elements with no role: what it holds gives it meaning.',
      'Pick the heading level the page outline needs; `CardHeader` styles whatever heading you put in it.',
      '`CardSkeleton` is hidden from assistive technology, so mark the loading region itself, for example with `aria-busy`.',
    ],
    ar: [
      'تُعرض البطاقة عناصر `div` عادية بلا دور: ما تحتويه هو ما يمنحها المعنى.',
      'اختر مستوى العنوان الذي يحتاجه مخطط الصفحة؛ `CardHeader` ينسّق أي عنوان تضعه فيه.',
      '`CardSkeleton` مخفي عن التقنيات المساعدة، فعلِّم المنطقة التي تُحمَّل نفسها، مثلًا بـ `aria-busy`.',
    ],
  },
  rtl: {
    en: 'The footer\'s buttons start at the inline start, so in Arabic the first one sits on the right; text aligns to the start.',
    ar: 'تبدأ أزرار التذييل من بداية السطر، فيقع أولها في العربية على اليمين؛ ويُحاذى النص إلى البداية.',
  },
  related: {
    components: ['separator', 'skeleton', 'avatar-group', 'button'],
    pages: ['server-first', 'theming'],
  },
} as const
