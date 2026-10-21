// The hand-written data of one component page (docs-site S7), in en and ar.
export const numberField = {
  slug: 'number-field',
  title: {
    en: 'Number field',
    ar: 'حقل رقمي',
  },
  description: {
    en: 'A number between known bounds, typed or stepped. A hidden input carries the plain number, so the form submits before hydration.',
    ar: 'رقم بين حدود معروفة، يُكتب أو يُزاد خطوة خطوة. حقل مخفي يحمل الرقم المجرد، فيُرسل النموذج قبل الترطيب.',
  },
  demos: ['basic', 'limits', 'form', 'sizes', 'row', 'rtl'],
  stageHeight: 7,
  extraSwitches: ['disabled', 'required'],
  note: {
    en: '`min`, `max` and `step` are clamped at runtime, so a typed or passed value cannot break the field.',
    ar: '`min` و`max` و`step` تُحصر أثناء التشغيل، فلا تستطيع قيمة مكتوبة أو ممرَّرة أن تكسر الحقل.',
  },
  notes: {
    en: [
      'For a count or an amount between known bounds: guests, seats, hours. Nothing bounds it by a count of characters.',
      'The form receives the plain number, never the formatted text: 1234.5, not 1,234.5. An empty field sends an empty value.',
      'A decimal needs a step it fits: with the default `step` of 1, a value of 12.5 fails the browser\'s check. Use 0.5 or any.',
      'The field formats with the provider\'s locale and numbering system, so the server and the browser print the same text. Arabic-Indic digits are read in any locale.',
      'A stepper at its limit is disabled and dimmed. The steppers keep their 24px, 44px under a touch pointer, so a narrow field takes the room from the number.',
    ],
    ar: [
      'لعدد أو مقدار بين حدود معروفة: الضيوف، المقاعد، الساعات. ولا يحدّه عدد الأحرف.',
      'يستلم النموذج الرقم المجرد، لا النص المنسّق: 1234.5 لا 1,234.5. والحقل الفارغ يرسل قيمة فارغة.',
      'العدد العشري يحتاج خطوة تناسبه: مع `step` الافتراضية 1، تفشل القيمة 12.5 في تحقق المتصفح. استخدم 0.5 أو any.',
      'ينسّق الحقل بلغة المزوّد ونظام أرقامه، فيطبع الخادم والمتصفح النص نفسه. والأرقام الهندية الشرقية تُقرأ في أي لغة.',
      'زر الحد يتعطّل ويخفت عند بلوغ الحد. ويحتفظ الزران بـ24px، و44px تحت مؤشر لمس، فيأخذ الحقل الضيق المساحة من الرقم.',
    ],
  },
  keyboard: [
    { keys: ['ArrowUp'], action: { en: 'Adds one step; with Shift it adds 10, with Alt 0.1.', ar: 'يضيف خطوة واحدة؛ ومع Shift يضيف 10، ومع Alt 0.1.' } },
    { keys: ['ArrowDown'], action: { en: 'Takes one step away; with Shift 10, with Alt 0.1.', ar: 'ينقص خطوة واحدة؛ ومع Shift ينقص 10، ومع Alt 0.1.' } },
    { keys: ['Home'], action: { en: 'Goes to the minimum, when one is set.', ar: 'ينتقل إلى الحد الأدنى، إن كان محددًا.' } },
    { keys: ['End'], action: { en: 'Goes to the maximum, when one is set.', ar: 'ينتقل إلى الحد الأقصى، إن كان محددًا.' } },
    { keys: ['Tab'], action: { en: 'Moves past the field: the steppers are not tab stops.', ar: 'يتجاوز الحقل: زرّا الزيادة والإنقاص ليسا محطتي Tab.' } },
  ],
  accessibility: {
    en: [
      'A name is required: `id` for a `<label htmlFor>`, or `aria-label`, or `aria-labelledby`. They land on the visible input.',
      'The steppers are named in the provider\'s language, and they are not tab stops: the arrow keys do the same from the input.',
      '`invalid` sets aria-invalid on the input, and the line of the field turns to danger and thickens.',
    ],
    ar: [
      'الاسم مطلوب: `id` لتسمية `<label htmlFor>`، أو `aria-label`، أو `aria-labelledby`. وتقع على الحقل الظاهر.',
      'زرّا الزيادة والإنقاص مسمّيان بلغة المزوّد، وليسا محطتي Tab: مفاتيح الأسهم تؤدي العمل نفسه من الحقل.',
      '`invalid` يضبط aria-invalid على الحقل، ويتحوّل خطه إلى لون الخطر ويزداد سمكًا.',
    ],
  },
  rtl: {
    en: 'Increase sits at the left and the number stays left to right. Its digits follow the provider\'s numbering system.',
    ar: 'يقع زر الزيادة على اليسار ويبقى الرقم من اليسار إلى اليمين. وأرقامه تتبع نظام الأرقام في المزوّد.',
  },
  related: {
    components: ['input', 'slider', 'field', 'form'],
    pages: ['accessibility', 'rtl'],
  },
} as const
