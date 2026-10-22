// The hand-written data of the Progress page (S7), in both locales.
export const progress = {
  slug: 'progress',
  title: { en: 'Progress', ar: 'شريط التقدم' },
  description: {
    en: 'A neutral track with a bar in the tone, read as a progressbar from 0 to 100.',
    ar: 'إلى أين وصلت المهمة: مسار محايد عليه شريط بلون النبرة، يقرؤه قارئ الشاشة شريطَ تقدم من 0 إلى 100.',
  },
  note: {
    en: 'It renders no text and clamps value to 0-100, so name it with aria-label or aria-labelledby.',
    ar: 'لا يعرض أي نص ويحصر القيمة بين 0 و100، فسمِّه بـ aria-label أو aria-labelledby.',
  },
  demos: ['labelled', 'values', 'tones', 'sizes', 'indeterminate', 'file-row', 'custom-size', 'rtl'],
  stageHeight: 17.875,
  controlOrder: ['tone', 'size', 'value', 'indeterminate'],
  starts: { value: 60 },
  notes: {
    en: [
      'For an upload, a quota or a step in a long job. `value` is a percentage, clamped to 0-100 before it reaches ARIA or the bar; for a custom range, use Meter.',
      '`indeterminate` is for a wait of unknown length: no value is announced and a short bar pulses.',
      '`size` sets the track height from the spacing scale, so it follows density; `custom` emits none and your class sets it.',
      'The track fills its container. Give it a fixed width with `className`, as a bar in a file row does.',
    ],
    ar: [
      'لرفع ملف، أو حصة استخدام، أو خطوة في مهمة طويلة. `value` نسبة مئوية تُحصر بين 0 و100 قبل أن تصل إلى ARIA أو إلى الشريط؛ وللنطاق المخصص استخدم Meter.',
      '`indeterminate` للانتظار مجهول المدة: لا تُعلن أي قيمة، ويومض شريط قصير.',
      '`size` يحدد ارتفاع المسار من سلّم المسافات، فيتبع الكثافة؛ و`custom` لا يضع شيئًا ويحدده صنفك.',
      'المسار يملأ حاويته. أعطه عرضًا ثابتًا عبر `className`، كما يفعل الشريط في صف ملف.',
    ],
  },
  keyboard: [],
  accessibility: {
    en: [
      'A name is required: the type refuses a Progress with neither `aria-label` nor `aria-labelledby`.',
      'It writes `role="progressbar"` with a minimum of 0, a maximum of 100 and the clamped value; an indeterminate bar carries no value at all.',
      'The bar takes the tone\'s text colour and a `line-strong` outline marks the end of the range. Under forced colours the track is Canvas and the bar CanvasText, and reduced motion stops the pulse.',
    ],
    ar: [
      'الاسم إلزامي: النوع يرفض شريط تقدم بلا `aria-label` ولا `aria-labelledby`.',
      'يكتب `role="progressbar"` بحد أدنى 0 وحد أقصى 100 والقيمة بعد حصرها؛ والشريط غير المحدد لا يحمل أي قيمة.',
      'الشريط يأخذ لون نص النبرة، وإطار `line-strong` يحدد نهاية النطاق. وتحت الألوان القسرية يكون المسار Canvas والشريط CanvasText، وتقليل الحركة يوقف الوميض.',
    ],
  },
  rtl: {
    en: 'The bar grows from the inline start: from the right in Arabic, with no class of its own for it.',
    ar: 'الشريط ينمو من بداية السطر: من اليمين في العربية، دون صنف خاص بذلك.',
  },
  related: {
    components: ['spinner', 'meter', 'skeleton'],
    pages: ['accessibility', 'rtl'],
  },
} as const
