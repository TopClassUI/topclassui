// The hand-written data of one component page (docs-site S7), in en and ar.
export const input = {
  slug: 'input',
  title: {
    en: 'Input',
    ar: 'حقل نص',
  },
  description: {
    en: 'A native input that renders on the server and ships 0 KB of JavaScript. The types refuse one with no name.',
    ar: 'حقل إدخال أصلي يُعرض على الخادم ولا يشحن أي JavaScript. الأنواع ترفض حقلًا بلا اسم.',
  },
  demos: ['labelled', 'types', 'sizes', 'full-width', 'row', 'custom-size', 'skeleton', 'rtl'],
  stageHeight: 7,
  extraSwitches: ['disabled', 'required'],
  note: {
    en: 'Outside a Field, Input needs `id`, `aria-label` or `aria-labelledby`: the types reject an unlabelled one.',
    ar: 'خارج Field يحتاج Input إلى `id` أو `aria-label` أو `aria-labelledby`: الأنواع ترفض حقلًا بلا تسمية.',
  },
  notes: {
    en: [
      '`maxLength` has a default per type: text 512, email 254, tel 32, url 2048, search and password 256. Pass your own number, or `maxLength={null}` for no cap.',
      'A number, a date or a checkbox takes no character cap: a number is bounded by min, max and step.',
      'It keeps its own width, `--tc-input-width`, and less in a narrow row. `fullWidth` fills the container; beside a Button, give the Input `flex-1`.',
      '`size="custom"` emits no size classes, so your own classes set the height, the padding and the type step.',
      'A parent with `overflow-hidden` needs 4px of padding, or it cuts the focus ring off.',
    ],
    ar: [
      'لـ`maxLength` قيمة افتراضية حسب النوع: 512 للنص، و254 للبريد، و32 للهاتف، و2048 للرابط، و256 للبحث وكلمة المرور. مرّر رقمك، أو `maxLength={null}` لإلغاء الحد.',
      'الرقم والتاريخ ومربع الاختيار بلا حد للأحرف: الرقم تحدّه القيم الدنيا والعليا والخطوة.',
      'يحتفظ بعرضه الخاص، `--tc-input-width`، ويقلّ في صف ضيّق. `fullWidth` يملأ الحاوية؛ وبجانب Button أعطِ Input الصنف `flex-1`.',
      '`size="custom"` لا يضيف أي صنف للحجم، فأصنافك أنت تحدد الارتفاع والحشو وحجم الخط.',
      'الحاوية التي تقص محتواها (`overflow-hidden`) تحتاج حشوًا بمقدار 4px، وإلا قطعت حلقة التركيز.',
    ],
  },
  keyboard: [
    { keys: ['Tab'], action: { en: 'Moves the focus to the field, and on to the next control.', ar: 'ينقل التركيز إلى الحقل، ثم إلى العنصر التالي.' } },
    { keys: ['Enter'], action: { en: 'Submits the form the field is in, as a native input does.', ar: 'يرسل النموذج الذي يضم الحقل، كما يفعل حقل HTML الأصلي.' } },
  ],
  accessibility: {
    en: [
      'A name is required: a `<label htmlFor>` pointing at `id`, or `aria-label`, or `aria-labelledby`.',
      '`invalid` sets aria-invalid, and the border turns to danger and thickens, so the error does not rest on colour alone.',
      'On a touch screen the text is at least 16px, so iOS does not zoom the page on focus.',
    ],
    ar: [
      'الاسم مطلوب: تسمية `<label htmlFor>` تشير إلى `id`، أو `aria-label`، أو `aria-labelledby`.',
      '`invalid` يضبط aria-invalid، ويتحوّل الإطار إلى لون الخطر ويزداد سمكًا، فلا يعتمد الخطأ على اللون وحده.',
      'على شاشة اللمس لا يقل النص عن 16px، كي لا يكبّر iOS الصفحة عند التركيز.',
    ],
  },
  rtl: {
    en: 'The text starts at the right. Email, number, tel and url fields stay left to right, on the form\'s side.',
    ar: 'يبدأ النص من اليمين. حقول البريد والأرقام والهاتف والروابط تبقى من اليسار إلى اليمين، في جهة النموذج.',
  },
  related: {
    components: ['textarea', 'number-field', 'select', 'combobox', 'field', 'form'],
    pages: ['first-component', 'server-first', 'accessibility', 'rtl'],
  },
} as const
