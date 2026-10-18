// The hand-written data of one component page (docs-site S7), in en and ar.
export const kbd = {
  slug: 'kbd',
  title: { en: 'Kbd', ar: 'مفتاح' },
  description: {
    en: 'A keycap for a key the reader presses, rendered on the server. A combination is sibling keys, with no group part and no plus.',
    ar: 'غطاء مفتاح لمفتاح يضغطه القارئ، يُعرض على الخادم. والتركيبة مفاتيح متجاورة، بلا جزء تجميع وبلا علامة زائد.',
  },
  demos: ['keys', 'combination', 'with-icon', 'nested', 'rtl'],
  stageDemo: 'keys',
  stageHeight: 8,
  note: {
    en: 'An icon inside a key is an `<Svg>` with no size: at its 1em default it follows the key\'s own text.',
    ar: 'الأيقونة داخل المفتاح `<Svg>` بلا حجم: بقيمتها الافتراضية 1em تتبع نص المفتاح نفسه.',
  },
  notes: {
    en: [
      'To name a key the reader presses, inside running text or beside a menu item. It is one `<kbd>` with a keycap look and no props of its own.',
      'A combination is sibling keys separated by a space. For the nested form of the HTML spec, wrap the keys in a plain `<kbd>` yourself.',
    ],
    ar: [
      'لتسمية مفتاح يضغطه القارئ، داخل النص أو بجانب عنصر قائمة. هو `<kbd>` واحد بشكل غطاء مفتاح، بلا خصائص خاصة به.',
      'التركيبة مفاتيح متجاورة تفصل بينها مسافة. وللشكل المتداخل في مواصفة HTML، غلّف المفاتيح بنفسك في `<kbd>` عادي.',
    ],
  },
  keyboard: [],
  accessibility: {
    en: [
      'It is not a control: it takes no focus and has no states.',
      'A screen reader reads the key\'s text, so give an icon key a text name of its own, as `with-icon` names its icon "Command".',
    ],
    ar: [
      'ليس عنصر تحكم: لا يأخذ التركيز ولا حالات له.',
      'قارئ الشاشة يقرأ نص المفتاح، فأعطِ مفتاح الأيقونة اسمًا نصيًا، كما يسمّي المثال `with-icon` أيقونته «Command».',
    ],
  },
  rtl: {
    en: 'Key names stay in Latin; the keys of a combination follow the sentence, so in Arabic the first key sits at the right.',
    ar: 'أسماء المفاتيح تبقى بالحروف اللاتينية، ومفاتيح التركيبة تتبع اتجاه الجملة، فيقع المفتاح الأول في العربية على اليمين.',
  },
  related: {
    components: ['button', 'tag', 'segmented-control'],
    pages: ['server-first', 'icons', 'rtl'],
  },
} as const
