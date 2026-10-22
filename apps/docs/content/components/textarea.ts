// The hand-written data of one component page (docs-site S7), in en and ar.
export const textarea = {
  slug: 'textarea',
  title: {
    en: 'Textarea',
    ar: 'مربع نص متعدد الأسطر',
  },
  description: {
    en: 'Native textarea on the server; autosize and the live counter are the only client parts.',
    ar: 'مربع نص أصلي على الخادم؛ التمدد التلقائي والعدّاد الحي هما الجزآن الوحيدان في المتصفح.',
  },
  demos: ['basic', 'autosize', 'show-count', 'sizes', 'form', 'row', 'long-content', 'skeleton', 'rtl'],
  stageHeight: 10,
  stageDemo: 'stage',
  controlOrder: ['size', 'maxRows', 'autosize', 'showCount', 'disabled', 'invalid'],
  controlsHidden: ['fullWidth', 'rows'],
  extraSwitches: ['disabled'],
  note: {
    en: 'On its own it is server HTML; `autosize` or `showCount` is what loads the small client half.',
    ar: 'وحده هو HTML من الخادم؛ `autosize` أو `showCount` هو ما يحمّل نصف العميل الصغير.',
  },
  notes: {
    en: [
      '`maxLength` is 5000 by default. Pass your own number, or `maxLength={null}` for no cap; the browser stops typing and pasting there.',
      'With `autosize` the rows follow the text from `rows` up to `maxRows`, then it scrolls. `maxRows` alone grows nothing.',
      'The counter reads 42 / 500 under the field: always with `showCount`, and with `autosize` alone from nine tenths of the cap. At the cap it turns bold; that is not an error.',
      'With `autosize` or `showCount` the width belongs to a box around the textarea: use `fullWidth`, or size the parent.',
      'With no script, what is typed is kept and sent, and a form reset is native.',
    ],
    ar: [
      '`maxLength` قيمته 5000 افتراضيًا. مرّر رقمك، أو `maxLength={null}` لإلغاء الحد؛ عنده يوقف المتصفح الكتابة واللصق.',
      'مع `autosize` تتبع الأسطر النص من `rows` حتى `maxRows`، ثم يظهر التمرير. `maxRows` وحده لا يمدّد شيئًا.',
      'يظهر العدّاد بصيغة 42 / 500 تحت الحقل: دائمًا مع `showCount`، ومع `autosize` وحده ابتداءً من تسعة أعشار الحد. عند الحد يصبح غامقًا، وهذا ليس خطأ.',
      'مع `autosize` أو `showCount` يعود العرض إلى صندوق يحيط بالمربع: استخدم `fullWidth`، أو حدّد عرض الحاوية.',
      'بلا أي سكربت يُحفظ ما كُتب ويُرسل، وإعادة ضبط النموذج أصلية.',
    ],
  },
  keyboard: [
    { keys: ['Tab'], action: { en: 'Moves the focus to the field, and on to the next control.', ar: 'ينقل التركيز إلى الحقل، ثم إلى العنصر التالي.' } },
    { keys: ['Enter'], action: { en: 'Starts a new line; it never submits the form.', ar: 'يبدأ سطرًا جديدًا، ولا يرسل النموذج أبدًا.' } },
  ],
  accessibility: {
    en: [
      'A name is required: a `<label htmlFor>` pointing at `id`, or `aria-label`, or `aria-labelledby`.',
      'The counter is the field\'s description, so a screen reader reads it after the name. It is not a live region.',
      '`invalid` sets aria-invalid, and the border turns to danger and thickens.',
    ],
    ar: [
      'الاسم مطلوب: تسمية `<label htmlFor>` تشير إلى `id`، أو `aria-label`، أو `aria-labelledby`.',
      'العدّاد هو وصف الحقل، فيقرؤه قارئ الشاشة بعد الاسم. وهو ليس منطقة إعلان حيّة.',
      '`invalid` يضبط aria-invalid، ويتحوّل الإطار إلى لون الخطر ويزداد سمكًا.',
    ],
  },
  rtl: {
    en: 'The text starts at the right and the counter sits at the inline end, on the left. Set the direction to auto to let each text follow its first letter.',
    ar: 'يبدأ النص من اليمين، ويقع العدّاد في نهاية السطر، أي على اليسار. اضبط الاتجاه على auto ليتبع كل نص حرفه الأول.',
  },
  related: {
    components: ['input', 'field', 'form', 'number-field'],
    pages: ['server-first', 'accessibility', 'rtl'],
  },
} as const
