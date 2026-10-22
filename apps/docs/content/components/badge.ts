// The hand-written data of one component page (docs-site S7), in en and ar.
export const badge = {
  slug: 'badge',
  title: { en: 'Badge', ar: 'شارة' },
  description: {
    en: 'A short status label in three variants across six tones. It renders on the server and ships no JavaScript.',
    ar: 'تسمية حالة قصيرة بثلاثة أنماط عبر ست نبرات. تُعرض على الخادم ولا تُرسل أي JavaScript إلى المتصفح.',
  },
  demos: ['with-icon', 'variants', 'tones', 'sizes', 'long-label', 'skeleton', 'custom-size', 'rtl'],
  stageHeight: 19.5,
  stageDemo: 'tones',
  codeDemo: 'with-icon',
  note: {
    en: 'Badge has no ARIA role: the text carries the meaning, colour never does alone.',
    ar: 'لا تحمل الشارة أي دور ARIA: النص يحمل المعنى، واللون وحده لا يكفي أبدًا.',
  },
  notes: {
    en: [
      'For a short status beside the thing it describes: Paid, Pending, Draft, a count. It is a label, not a control; for something the user can remove or press, use a Tag or a Button.',
      'A long label truncates to its container with an ellipsis instead of wrapping.',
      '`BadgeSkeleton` holds its place at the same height while data loads; give it the `size` of the badge it stands in for.',
      '`size="custom"` emits no size classes, so `className` sets the padding and the type step.',
    ],
    ar: [
      'لحالة قصيرة بجانب ما تصفه: مدفوع، قيد الانتظار، مسودة، أو عدد. إنها تسمية لا عنصر تحكم؛ لما يمكن للمستخدم إزالته أو الضغط عليه استخدم `Tag` أو `Button`.',
      'التسمية الطويلة تُقتطع عند حدود حاويتها بعلامة حذف بدل أن تلتف إلى سطر جديد.',
      '`BadgeSkeleton` يحجز مكانها بالارتفاع نفسه أثناء تحميل البيانات؛ أعطه `size` الشارة التي ينوب عنها.',
      '`size="custom"` لا يضيف أي أصناف للحجم، فيحدد `className` الحشوة ودرجة الخط.',
    ],
  },
  keyboard: [],
  accessibility: {
    en: [
      'Badge is not focusable and has no role, so a screen reader reads its text as part of the sentence around it.',
      'Write the status in words: Paid, Overdue. A tone alone says nothing to someone who cannot see the colour.',
      'An icon beside the text is decoration; the word carries the status.',
    ],
    ar: [
      'الشارة لا تستقبل التركيز ولا دور لها، فيقرأ قارئ الشاشة نصها ضمن الجملة المحيطة بها.',
      'اكتب الحالة بالكلمات: مدفوع، متأخر. النبرة وحدها لا تقول شيئًا لمن لا يرى اللون.',
      'الأيقونة بجانب النص زخرفية؛ الكلمة هي التي تحمل الحالة.',
    ],
  },
  rtl: {
    en: 'The icon and the text swap sides with the reading direction, and a cut label keeps its ellipsis at the end of its own direction.',
    ar: 'تتبادل الأيقونة والنص موضعيهما مع اتجاه القراءة، والتسمية المقتطعة تبقي علامة الحذف في نهاية اتجاهها هي.',
  },
  related: {
    components: ['tag', 'avatar', 'skeleton', 'kbd'],
    pages: ['colors', 'accessibility', 'rtl'],
  },
} as const
