// The hand-written data of the Meter page (S7), in both locales.
export const meter = {
  slug: 'meter',
  title: { en: 'Meter', ar: 'المقياس' },
  description: {
    en: 'A reading inside a known range, such as disk space or a score: a neutral track with a bar in the tone, rendered on the server.',
    ar: 'قراءة داخل نطاق معروف، مثل مساحة القرص أو النتيجة: مسار محايد عليه شريط بلون النبرة، يُعرض على الخادم.',
  },
  demos: ['basic', 'range', 'tones', 'sizes', 'custom-size', 'rtl'],
  stageHeight: 3,
  stageDemo: 'basic',
  note: {
    en: 'It renders no text, so name it with `aria-label` or `aria-labelledby`; the type refuses a Meter with neither.',
    ar: 'لا يعرض أي نص، فسمِّه بـ `aria-label` أو `aria-labelledby`؛ والنوع يرفض مقياسًا بلا أيٍّ منهما.',
  },
  notes: {
    en: [
      'For a task moving towards done, use Progress; Meter is a reading, with `min`, `max` and `value` of its own.',
      '`min` and `max` are clamped, `max` is raised to `min` when below it, and `value` is held between the two.',
      '`aria-valuetext` is passed through, so a screen reader says "512 GB of 1 TB" instead of "512".',
      'The track fills its container and is never narrower than 4rem; give it a width of its own with `className`.',
    ],
    ar: [
      'للمهمة التي تتقدم نحو الاكتمال استخدم Progress؛ أما Meter فقراءة، لها `min` و`max` و`value` خاصة بها.',
      '`min` و`max` محصوران، و`max` يُرفع إلى `min` حين يقل عنه، و`value` يبقى بينهما.',
      '`aria-valuetext` يمرّ كما هو، فيقول قارئ الشاشة "512 GB of 1 TB" بدل "512".',
      'المسار يملأ حاويته ولا يضيق عن 4rem أبدًا؛ أعطه عرضًا خاصًا عبر `className`.',
    ],
  },
  keyboard: [],
  accessibility: {
    en: [
      'It writes `role="meter"` with the clamped minimum, maximum and value.',
      'The bar takes the tone\'s text colour, and a `line-strong` outline marks the end of the range. Under forced colours the track is Canvas and the bar CanvasText.',
    ],
    ar: [
      'يكتب `role="meter"` مع الحد الأدنى والحد الأقصى والقيمة بعد حصرها.',
      'الشريط يأخذ لون نص النبرة، وإطار `line-strong` يحدد نهاية النطاق. وتحت الألوان القسرية يكون المسار Canvas والشريط CanvasText.',
    ],
  },
  rtl: {
    en: 'The bar grows from the inline start: from the right in Arabic, with no class of its own for it.',
    ar: 'الشريط ينمو من بداية السطر: من اليمين في العربية، دون صنف خاص بذلك.',
  },
  related: {
    components: ['progress', 'spinner', 'skeleton'],
    pages: ['accessibility', 'rtl'],
  },
} as const
