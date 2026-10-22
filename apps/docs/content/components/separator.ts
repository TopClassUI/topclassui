// The hand-written data of one component page (docs-site S7), in en and ar.
export const separator = {
  slug: 'separator',
  title: { en: 'Separator', ar: 'فاصل' },
  description: {
    en: 'A hairline between two groups, across a column or down a row. Decorative by default, so it is not announced.',
    ar: 'خط رفيع بين مجموعتين، عرضيًا في عمود أو طوليًا في صف. زخرفي افتراضيًا، فلا يُعلَن لقارئ الشاشة.',
  },
  demos: ['horizontal', 'vertical', 'semantic', 'rtl'],
  stageHeight: 14,
  codeDemo: 'horizontal',
  note: {
    en: 'A vertical Separator takes its height from a flex or grid row; give the row a height or let it stretch.',
    ar: 'يأخذ الفاصل العمودي ارتفاعه من صف flex أو grid؛ أعطِ الصف ارتفاعًا أو دعه يتمدد.',
  },
  notes: {
    en: [
      'For a hairline between two groups: sections of a form, items of a menu, two facts on one row.',
      'It has no margin of its own, so the gap and padding of its parent space it.',
      'In a block parent a vertical separator is 0 px tall: put it in a flex or grid row.',
      'The line is a border at the line-width token, so it survives forced colours.',
    ],
    ar: [
      'لخط رفيع بين مجموعتين: أقسام نموذج، عناصر قائمة، معلومتين في صف واحد.',
      'لا هامش له، فالمسافة والحشوة في العنصر الأب هما ما يباعده.',
      'داخل عنصر أب كتلي يكون الفاصل العمودي بارتفاع 0 px: ضعه في صف flex أو grid.',
      'الخط حدّ بسماكة رمز عرض الخط، فيبقى ظاهرًا في وضع الألوان القسرية.',
    ],
  },
  keyboard: [],
  accessibility: {
    en: [
      'By default it renders `role="none"` and stays out of the accessibility tree.',
      'Pass `decorative={false}` when it divides content a reader should hear as separate: it becomes a `separator` with its `aria-orientation`.',
      'The line uses `--tc-line`, which is decorative and exempt from the 3:1 contrast rule; never let it be the only thing that separates meaning.',
    ],
    ar: [
      'يُعرض افتراضيًا مع `role="none"` ويبقى خارج شجرة إمكانية الوصول.',
      'مرّر `decorative={false}` حين يفصل محتوى ينبغي أن يُسمع منفصلًا: يصبح `separator` مع `aria-orientation`.',
      'يستخدم الخط `--tc-line`، وهو زخرفي ومستثنى من قاعدة تباين 3:1؛ لا تجعله وحده ما يفصل بين المعاني.',
    ],
  },
  rtl: {
    en: 'The vertical line is the inline-start border of its box, so it mirrors with the page and needs no RTL class.',
    ar: 'الخط العمودي هو الحد عند بداية السطر في صندوقه، فينعكس مع الصفحة بلا أي صنف خاص بالاتجاه.',
  },
  related: {
    components: ['card', 'skeleton', 'badge'],
    pages: ['accessibility', 'colors', 'rtl'],
  },
} as const
