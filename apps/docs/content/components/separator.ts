// The hand-written data of Separator's page and card (docs-site S7); `x` in a string is inline code.
export const content = {
  slug: 'separator',
  demos: ['horizontal', 'vertical', 'semantic', 'rtl'],
  stageHeight: 8,
  related: ['card', 'skeleton', 'badge'],
  en: {
    title: 'Separator',
    description: 'A hairline between two groups, across a column or down a row. Decorative by default, so it is not announced.',
    note: 'A vertical Separator takes its height from a flex or grid row; give the row a height or let it stretch.',
    notes: [
      'For a hairline between two groups: sections of a form, items of a menu, two facts on one row.',
      'It has no margin of its own, so the gap and padding of its parent space it.',
      'In a block parent a vertical separator is 0 px tall: put it in a flex or grid row.',
      'The line is a border at the line-width token, so it survives forced colours.',
    ],
    keyboard: [],
    accessibility: [
      'By default it renders `role="none"` and stays out of the accessibility tree.',
      'Pass `decorative={false}` when it divides content a reader should hear as separate: it becomes a `separator` with its `aria-orientation`.',
      'The line uses `--tc-line`, which is decorative and exempt from the 3:1 contrast rule; never let it be the only thing that separates meaning.',
    ],
    rtl: 'The vertical line is the inline-start border of its box, so it mirrors with the page and needs no RTL class.',
  },
  ar: {
    title: 'فاصل',
    description: 'خط رفيع بين مجموعتين، عرضيًا في عمود أو طوليًا في صف. زخرفي افتراضيًا، فلا يُعلَن لقارئ الشاشة.',
    note: 'يأخذ الفاصل العمودي ارتفاعه من صف flex أو grid؛ أعطِ الصف ارتفاعًا أو دعه يتمدد.',
    notes: [
      'لخط رفيع بين مجموعتين: أقسام نموذج، عناصر قائمة، معلومتين في صف واحد.',
      'لا هامش له، فالمسافة والحشوة في العنصر الأب هما ما يباعده.',
      'داخل عنصر أب كتلي يكون الفاصل العمودي بارتفاع 0 px: ضعه في صف flex أو grid.',
      'الخط حدّ بسماكة رمز عرض الخط، فيبقى ظاهرًا في وضع الألوان القسرية.',
    ],
    keyboard: [],
    accessibility: [
      'يُعرض افتراضيًا مع `role="none"` ويبقى خارج شجرة إمكانية الوصول.',
      'مرّر `decorative={false}` حين يفصل محتوى ينبغي أن يُسمع منفصلًا: يصبح `separator` مع `aria-orientation`.',
      'يستخدم الخط `--tc-line`، وهو زخرفي ومستثنى من قاعدة تباين 3:1؛ لا تجعله وحده ما يفصل بين المعاني.',
    ],
    rtl: 'الخط العمودي هو الحد عند بداية السطر في صندوقه، فينعكس مع الصفحة بلا أي صنف خاص بالاتجاه.',
  },
} as const
