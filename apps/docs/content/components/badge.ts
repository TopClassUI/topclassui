// The hand-written data of Badge's page and card (docs-site S7); `x` in a string is inline code.
export const content = {
  slug: 'badge',
  demos: ['with-icon', 'variants', 'tones', 'sizes', 'long-label', 'skeleton', 'custom-size', 'rtl'],
  stageHeight: 8,
  related: ['tag', 'avatar', 'skeleton', 'kbd'],
  en: {
    title: 'Badge',
    description: 'A short status label in three variants across six tones. It renders on the server and ships no JavaScript.',
    note: 'Badge has no ARIA role: the text carries the meaning, colour never does alone.',
    notes: [
      'For a short status beside the thing it describes: Paid, Pending, Draft, a count. It is a label, not a control; for something the user can remove or press, use a Tag or a Button.',
      'A long label truncates to its container with an ellipsis instead of wrapping.',
      '`BadgeSkeleton` holds its place at the same height while data loads; give it the `size` of the badge it stands in for.',
      '`size="custom"` emits no size classes, so `className` sets the padding and the type step.',
    ],
    keyboard: [],
    accessibility: [
      'Badge is not focusable and has no role, so a screen reader reads its text as part of the sentence around it.',
      'Write the status in words: Paid, Overdue. A tone alone says nothing to someone who cannot see the colour.',
      'An icon beside the text is decoration; the word carries the status.',
    ],
    rtl: 'The icon and the text swap sides with the reading direction, and a cut label keeps its ellipsis at the end of its own direction.',
  },
  ar: {
    title: 'شارة',
    description: 'تسمية حالة قصيرة بثلاثة أنماط عبر ست نبرات. تُعرض على الخادم ولا تُرسل أي JavaScript إلى المتصفح.',
    note: 'لا تحمل الشارة أي دور ARIA: النص يحمل المعنى، واللون وحده لا يكفي أبدًا.',
    notes: [
      'لحالة قصيرة بجانب ما تصفه: مدفوع، قيد الانتظار، مسودة، أو عدد. إنها تسمية لا عنصر تحكم؛ لما يمكن للمستخدم إزالته أو الضغط عليه استخدم `Tag` أو `Button`.',
      'التسمية الطويلة تُقتطع عند حدود حاويتها بعلامة حذف بدل أن تلتف إلى سطر جديد.',
      '`BadgeSkeleton` يحجز مكانها بالارتفاع نفسه أثناء تحميل البيانات؛ أعطه `size` الشارة التي ينوب عنها.',
      '`size="custom"` لا يضيف أي أصناف للحجم، فيحدد `className` الحشوة ودرجة الخط.',
    ],
    keyboard: [],
    accessibility: [
      'الشارة لا تستقبل التركيز ولا دور لها، فيقرأ قارئ الشاشة نصها ضمن الجملة المحيطة بها.',
      'اكتب الحالة بالكلمات: مدفوع، متأخر. النبرة وحدها لا تقول شيئًا لمن لا يرى اللون.',
      'الأيقونة بجانب النص زخرفية؛ الكلمة هي التي تحمل الحالة.',
    ],
    rtl: 'تتبادل الأيقونة والنص موضعيهما مع اتجاه القراءة، والتسمية المقتطعة تبقي علامة الحذف في نهاية اتجاهها هي.',
  },
} as const
