// The hand-written data of one component page (docs-site S7), in en and ar.
export const stepper = {
  slug: 'stepper',
  title: { en: 'Stepper', ar: 'مؤشر الخطوات' },
  description: {
    en: 'A done step carries a tick, not just a colour, so it survives a greyscale screenshot.',
    ar: 'أين يقف القارئ في مهمة من بضع خطوات. الخطوة المكتملة تحمل علامة صح لا لونًا فقط، فتبقى واضحة في لقطة شاشة رمادية.',
  },
  demos: ['basic', 'statuses', 'sizes', 'custom-size', 'long-content', 'arabic-digits', 'rtl'],
  stageHeight: 19.4,
  note: {
    en: 'Stepper renders on the server: pass `value`, the id of the current step. It shows progress; it does not navigate.',
    ar: 'مؤشر الخطوات يُعرض على الخادم: مرّر `value`، أي معرّف الخطوة الحالية. هو يعرض التقدّم ولا ينقل بين الصفحات.',
  },
  notes: {
    en: [
      'A step is `{ id, title, status? }`, with `status` one of `done`, `current`, `todo` and `error`.',
      'Steps before `value` are done, steps after it todo. With no `value` the first step is current; a `value` no step has leaves every step todo.',
      'A step\'s own `status` wins over `value`: `error` draws an x and is read as "Needs attention".',
      '`size` sets the circles, from 24 to 48 px, and the titles. With `custom` the circle reads `--tc-stepper-mark`, 32 px unless you set it.',
      'A long title wraps inside its column and is never cut. Steps that do not fit across wrap onto another row, so the page never scrolls sideways.',
    ],
    ar: [
      'الخطوة هي `{ id, title, status? }`، و`status` واحدة من `done` و`current` و`todo` و`error`.',
      'الخطوات قبل `value` مكتملة، والخطوات بعدها لم تبدأ. بلا `value` تكون الخطوة الأولى هي الحالية، و`value` لا تملكه أي خطوة يترك كل الخطوات لم تبدأ.',
      '`status` الخاصة بالخطوة تتقدّم على `value`: الحالة `error` ترسم علامة x وتُقرأ «يحتاج إلى مراجعة».',
      '`size` يحدّد الدوائر، من 24 إلى 48 بكسل، والعناوين. ومع `custom` تقرأ الدائرة `--tc-stepper-mark`، وهو 32 بكسل ما لم تضبطه.',
      'العنوان الطويل يلتفّ داخل عموده ولا يُقصّ أبدًا. والخطوات التي لا تتسع في سطر واحد تنتقل إلى سطر آخر، فلا تُمرَّر الصفحة أفقيًا أبدًا.',
    ],
  },
  keyboard: [],
  accessibility: {
    en: [
      'An ordered list, which gives "2 of 4", with `role="list"` written so Safari with VoiceOver keeps it.',
      'The current step carries `aria-current="step"`; every other step has a hidden word for its status, from `labels`.',
      'The circles are hidden from screen readers, and nothing takes focus.',
    ],
    ar: [
      'قائمة مرتّبة تعطي «2 من 4»، مع `role="list"` مكتوبًا كي يحتفظ بها Safari مع VoiceOver.',
      'الخطوة الحالية تحمل `aria-current="step"`، ولكل خطوة أخرى كلمة مخفية تقول حالتها، من `labels`.',
      'الدوائر مخفية عن قارئات الشاشة، ولا شيء يأخذ التركيز.',
    ],
  },
  rtl: {
    en: 'The steps run from the right by themselves. `locale` decides the digits: `ar-u-nu-arab` writes the numbers in Arabic-Indic digits.',
    ar: 'تبدأ الخطوات من اليمين وحدها. و`locale` يحدّد الأرقام: `ar-u-nu-arab` يكتب الأرقام بالهندية الشرقية.',
  },
  related: {
    components: ['timeline', 'progress', 'tabs', 'form'],
    pages: ['server-first', 'accessibility', 'rtl'],
  },
} as const
