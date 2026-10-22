// The hand-written data of one component page (docs-site S7), in en and ar.
export const segmentedControl = {
  slug: 'segmented-control',
  title: { en: 'Segmented control', ar: 'تحكم مقسّم' },
  description: {
    en: 'A radio group drawn as one track; arrow keys select as they move, and reverse in RTL.',
    ar: 'مجموعة أزرار راديو مرسومة كمسار واحد؛ الأسهم تختار أثناء التنقل، وتنعكس من اليمين إلى اليسار.',
  },
  demos: ['basic', 'with-icons', 'sizes', 'full-width', 'form', 'many', 'long-content', 'rtl'],
  stageHeight: 19.4375,
  stageDemo: 'with-icons',
  extraSwitches: ['disabled'],
  note: {
    en: 'The arrow keys move and select at once; under an RTL `TopClassProvider`, ArrowRight goes to the segment before.',
    ar: 'الأسهم تنقل وتختار معًا، وتحت `TopClassProvider` باتجاه من اليمين إلى اليسار ينتقل السهم الأيمن إلى المقطع السابق.',
  },
  notes: {
    en: [
      'For one choice out of two to five short ones: a view, a mode, a range. One segment is always selected; for longer choices, a RadioGroup reads better.',
      'Two parts, `SegmentedControlRoot` and `SegmentedControlItem`, and it runs in the browser. A server page passes `defaultValue` alone; a controlled `value` belongs in a client file.',
      'The track needs a name and a selected segment: pass `aria-label` or `aria-labelledby`, and `value` or `defaultValue`. The types refuse a track without them.',
      '`invalid` sets `aria-invalid` on the track, whose line turns red and thickens. `fullWidth` fills the parent and shares it equally, for a few short segments.',
      'When the segments do not fit, the track scrolls sideways inside itself and the page does not; a label longer than its segment ends in an ellipsis.',
      '`icon` on a segment is drawn before its label. It is decoration: the label names the segment.',
    ],
    ar: [
      'لاختيار واحد من خيارين إلى خمسة خيارات قصيرة: طريقة عرض، وضع، نطاق. يبقى مقطع واحد مختارًا دائمًا، وللخيارات الأطول تُقرأ `RadioGroup` بشكل أفضل.',
      'جزءان، `SegmentedControlRoot` و`SegmentedControlItem`، ويعمل في المتصفح. صفحة الخادم تمرّر `defaultValue` وحدها، و`value` المتحكَّم بها مكانها ملف عميل.',
      'يحتاج المسار إلى اسم ومقطع مختار: مرّر `aria-label` أو `aria-labelledby`، و`value` أو `defaultValue`. الأنواع ترفض مسارًا بدونهما.',
      '`invalid` يضع `aria-invalid` على المسار، فيتحول خطه إلى الأحمر ويزداد سمكًا. و`fullWidth` يملأ الحاوية ويقسمها بالتساوي، لعدد قليل من المقاطع القصيرة.',
      'عندما لا تتسع المقاطع يتمرر المسار أفقيًا داخل نفسه ولا تتمرر الصفحة، والتسمية الأطول من مقطعها تنتهي بعلامة حذف.',
      '`icon` على المقطع يُرسم قبل تسميته. هو للزينة فقط: التسمية هي ما يسمّي المقطع.',
    ],
  },
  keyboard: [
    { keys: ['Tab'], action: { en: 'Enters the track on the selected segment; the next Tab leaves it.', ar: 'يدخل المسار على المقطع المختار، وTab التالي يخرج منه.' } },
    { keys: ['ArrowRight'], action: { en: 'Moves to the next segment and selects it; in RTL, the segment before.', ar: 'ينتقل إلى المقطع التالي ويختاره، ومن اليمين إلى اليسار إلى المقطع السابق.' } },
    { keys: ['ArrowLeft'], action: { en: 'Moves to the segment before and selects it; in RTL, the next one.', ar: 'ينتقل إلى المقطع السابق ويختاره، ومن اليمين إلى اليسار إلى التالي.' } },
    { keys: ['ArrowDown'], action: { en: 'Moves to the next segment and selects it.', ar: 'ينتقل إلى المقطع التالي ويختاره.' } },
    { keys: ['ArrowUp'], action: { en: 'Moves to the segment before and selects it.', ar: 'ينتقل إلى المقطع السابق ويختاره.' } },
    { keys: ['Space'], action: { en: 'Selects the focused segment.', ar: 'يختار المقطع الذي عليه التركيز.' } },
  ],
  accessibility: {
    en: [
      'The track is a `radiogroup`; each segment is a native `<button>` with `role="radio"`, named by its own text. The arrows skip a disabled segment and wrap at both ends; Enter, Home and End do nothing.',
      'Before the page hydrates, the selected segment is already the one tab stop, so Tab lands on it from the first paint.',
      'Each segment is at least 24 px tall, 44 under a touch pointer. The focus ring is drawn inside the focused segment, and under forced colours the selected one takes the system highlight.',
    ],
    ar: [
      'المسار `radiogroup`، وكل مقطع `<button>` أصلي بالدور `role="radio"`، يُسمّى بنصه. الأسهم تتخطى المقطع المعطّل وتلتف عند الطرفين، وEnter وHome وEnd لا تفعل شيئًا.',
      'قبل الترطيب يكون المقطع المختار هو محطة Tab الوحيدة، فيصل إليه Tab منذ أول عرض.',
      'لا يقل ارتفاع كل مقطع عن 24 بكسل، و44 تحت مؤشر لمس. حلقة التركيز تُرسم داخل المقطع الذي عليه التركيز، وفي وضع الألوان القسرية يأخذ المقطع المختار لون التمييز من النظام.',
    ],
  },
  rtl: {
    en: 'The first segment sits at the right, and the arrow keys reverse with the direction `TopClassProvider` passes from your layout.',
    ar: 'يقع المقطع الأول على اليمين، وتنعكس الأسهم مع الاتجاه الذي يمرّره `TopClassProvider` من التخطيط.',
  },
  related: {
    components: ['button', 'tag', 'kbd'],
    pages: ['rtl', 'accessibility', 'provider'],
  },
} as const
