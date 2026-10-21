// The hand-written data of one component page (docs-site S7), in en and ar.
export const otpField = {
  slug: 'otp-field',
  title: {
    en: 'OTP field',
    ar: 'حقل رمز التحقق',
  },
  description: {
    en: 'A one-time code typed one character per cell. A paste fills every cell, and one hidden input carries the code to the form.',
    ar: 'رمز يُستخدم مرة واحدة، حرف في كل خانة. اللصق يملأ كل الخانات، وحقل مخفي واحد يحمل الرمز إلى النموذج.',
  },
  demos: ['basic', 'grouped', 'form', 'sizes', 'long', 'rtl'],
  stageHeight: 7,
  controlOrder: ['length', 'size', 'mask', 'autoSubmit', 'disabled', 'invalid'],
  controlsHidden: ['groupSize'],
  extraSwitches: ['mask', 'autoSubmit', 'disabled'],
  note: {
    en: 'The export is `OTPField`. In a form the hidden input sends what is typed so far, a partial code too.',
    ar: 'اسم التصدير هو `OTPField`. داخل نموذج يرسل الحقل المخفي ما كُتب حتى الآن، حتى لو كان الرمز ناقصًا.',
  },
  notes: {
    en: [
      '`length` is 6 by default, clamped to a whole number from 1 to 12. `groupSize` draws a bar after every that many cells.',
      'Digits are the default: ASCII, Arabic-Indic and Persian digits are taken and stored as ASCII, and spaces in a paste are dropped.',
      'Past eight items, cells and bars together, the row breaks at whole cells, so twelve cells stay 44px tall on a phone.',
      'Each cell is a square of the control scale, 40px at `md`, and gives up width before height. Six cells need 184px.',
      'A Field\'s control object spreads onto it as it is.',
    ],
    ar: [
      '`length` قيمته 6 افتراضيًا، ومحصور في عدد صحيح من 1 إلى 12. و`groupSize` يرسم فاصلًا بعد كل ذلك العدد من الخانات.',
      'الأرقام هي الافتراضية: تُقبل الأرقام اللاتينية والهندية الشرقية والفارسية وتُخزَّن لاتينية، وتُحذف المسافات من اللصق.',
      'بعد ثمانية عناصر، خانات وفواصل معًا، ينكسر الصف عند خانات كاملة، فتبقى الخانات الاثنتا عشرة بارتفاع 44px على الهاتف.',
      'كل خانة مربع من مقياس العناصر، 40px عند `md`، وتتخلى عن العرض قبل الارتفاع. الخانات الست تحتاج 184px.',
      'كائن التحكم الذي يمرره Field يُفرد عليه كما هو.',
    ],
  },
  keyboard: [
    { keys: ['Tab'], action: { en: 'Enters the field: the group is one tab stop.', ar: 'يدخل الحقل: المجموعة كلها محطة Tab واحدة.' } },
    { keys: ['0-9'], action: { en: 'Fills the cell and moves to the next one; a paste fills every cell from the focused one.', ar: 'يملأ الخانة وينتقل إلى التالية؛ واللصق يملأ كل الخانات ابتداءً من الخانة الحالية.' } },
    { keys: ['Backspace'], action: { en: 'Clears the cell and moves back.', ar: 'يمسح الخانة ويعود إلى السابقة.' } },
    { keys: ['ArrowLeft', 'ArrowRight'], action: { en: 'Move to the cell before or after, up to the first empty cell.', ar: 'ينقلان إلى الخانة السابقة أو التالية، حتى أول خانة فارغة.' } },
    { keys: ['Home', 'End'], action: { en: 'Move to the first or the last cell the focus can reach.', ar: 'ينقلان إلى أول خانة أو آخر خانة يمكن للتركيز بلوغها.' } },
  ],
  accessibility: {
    en: [
      'Name it with `id` (for a `<label htmlFor>`) or `aria-labelledby`; the name lands on the first cell. `aria-label` is refused.',
      'Every later cell is named by its place, "Character 2 of 6", in the provider\'s language. `aria-describedby` goes on the first cell.',
      '`invalid` sets aria-invalid on every cell, never on the group: each line turns to danger and thickens.',
    ],
    ar: [
      'سمِّه بـ`id` (لتسمية `<label htmlFor>`) أو `aria-labelledby`؛ ويقع الاسم على الخانة الأولى. أما `aria-label` فمرفوض.',
      'كل خانة بعدها تُسمّى بموقعها، «الخانة 2 من 6»، بلغة المزوّد. و`aria-describedby` يذهب إلى الخانة الأولى.',
      '`invalid` يضبط aria-invalid على كل خانة، لا على المجموعة: يتحوّل كل خط إلى لون الخطر ويزداد سمكًا.',
    ],
  },
  rtl: {
    en: 'A code reads left to right, so on an Arabic page the cells still run left to right; the group sits at the inline start, beside its label.',
    ar: 'الرمز يُقرأ من اليسار إلى اليمين، لذا تبقى الخانات في صفحة عربية من اليسار إلى اليمين؛ وتقع المجموعة في بداية السطر، بجانب تسميتها.',
  },
  related: {
    components: ['input', 'number-field', 'field', 'form'],
    pages: ['accessibility', 'rtl'],
  },
} as const
