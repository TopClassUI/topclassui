// The hand-written data of the Field page (S7), in both locales.
export const field = {
  slug: 'field',
  title: { en: 'Field', ar: 'الحقل' },
  description: {
    en: 'The label, the hint and the error around any form control, tied to it by ids in the server HTML before any script runs.',
    ar: 'التسمية والتلميح والخطأ حول أي عنصر تحكم في النموذج، مربوطة به بالمعرّفات في HTML الخادم قبل تشغيل أي سكربت.',
  },
  demos: ['basic', 'hint-error', 'required', 'inline', 'group', 'controls', 'form', 'live', 'long-content', 'rtl'],
  stageHeight: 6,
  stageDemo: 'basic',
  note: {
    en: 'There is no Label component: the label is this prop, and the child spreads the control object onto the control.',
    ar: 'لا يوجد مكوّن Label: التسمية هي هذه الخاصية، والابن ينشر كائن التحكم على عنصر التحكم.',
  },
  notes: {
    en: [
      'In a server file use `Field`; in a client file `FieldLive` renders the same HTML and shows the error the nearest `FormAction` returned for its `name`.',
      'The child is a function, `(control) => <Input {...control} />`. The control object is `id`, `name`, `required` and the three ARIA attributes, and each of the eleven controls takes it as it is.',
      'The ids come from `id` or `useId()`, never from `name`: two Fields may share a name. Pass `id` when a page links to the field.',
      '`error` is one message or the array Zod\'s `fieldErrors` gives; with one, the control is invalid unless `invalid` says otherwise.',
      '`inline` puts the control first and the label beside it, for a Checkbox or a Switch.',
    ],
    ar: [
      'في ملف خادم استخدم `Field`؛ وفي ملف عميل يعرض `FieldLive` نفس HTML ويُظهر الخطأ الذي أعاده أقرب `FormAction` لاسمه `name`.',
      'الابن دالة، `(control) => <Input {...control} />`. كائن التحكم هو `id` و`name` و`required` وسمات ARIA الثلاث، وكل عنصر من عناصر التحكم الأحد عشر يأخذه كما هو.',
      'المعرّفات تأتي من `id` أو `useId()`، لا من `name` أبدًا: قد يتشارك حقلان الاسم نفسه. مرّر `id` حين ترتبط صفحة بالحقل.',
      '`error` رسالة واحدة أو المصفوفة التي يعطيها `fieldErrors` في Zod؛ ومع رسالة يصبح العنصر غير صالح ما لم يقل `invalid` غير ذلك.',
      '`inline` يضع عنصر التحكم أولًا والتسمية بجانبه، لمربع الاختيار أو المفتاح.',
    ],
  },
  keyboard: [
    { keys: ['Tab'], action: { en: 'Moves the focus to the control; Field itself takes no focus.', ar: 'ينقل التركيز إلى عنصر التحكم؛ والحقل نفسه لا يأخذ التركيز.' } },
  ],
  accessibility: {
    en: [
      'The label names the control through `<label for>` and `aria-labelledby`; `aria-describedby` reads the hint and then the error, only those rendered.',
      'The asterisk is only seen: `required` reaches the control, which says so itself, as `required` or `aria-required`.',
      'The error is no live region. It arrives with the page, and after a FormAction the focus goes to the first invalid control.',
    ],
    ar: [
      'التسمية تسمّي عنصر التحكم عبر `<label for>` و`aria-labelledby`؛ و`aria-describedby` يقرأ التلميح ثم الخطأ، وما يُعرض منهما فقط.',
      'النجمة مرئية فقط: `required` يصل إلى عنصر التحكم، فيعلن ذلك بنفسه عبر `required` أو `aria-required`.',
      'الخطأ ليس منطقة حيّة. يصل مع الصفحة، وبعد FormAction ينتقل التركيز إلى أول عنصر غير صالح.',
    ],
  },
  rtl: {
    en: 'The label, the hint and the error start at the right; the asterisk follows the label, and an inline box sits at the right.',
    ar: 'تبدأ التسمية والتلميح والخطأ من اليمين؛ والنجمة تتبع التسمية، ومربع الاختيار في الوضع inline يقع على اليمين.',
  },
  related: {
    components: ['form', 'input', 'textarea', 'select', 'checkbox', 'switch'],
    pages: ['first-component', 'server-first', 'accessibility', 'rtl'],
  },
} as const
