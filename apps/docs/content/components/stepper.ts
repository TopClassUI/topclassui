// The hand-written data of the Stepper page and card (docs-site S7), in English and Arabic.
export const stepper = {
  slug: 'stepper',
  demos: ['basic', 'statuses', 'sizes', 'custom-size', 'long-content', 'arabic-digits', 'rtl'],
  stageDemo: null,
  stageHeight: 10,
  related: ['timeline', 'progress', 'tabs', 'form'],
  en: {
    title: 'Stepper',
    description: 'Where a reader is in a task of a few steps. A done step carries a tick, not just a colour, so it survives a greyscale screenshot.',
    note: 'Stepper renders on the server: pass `value`, the id of the current step. It shows progress; it does not navigate.',
    notes: [
      'A step is `{ id, title, status? }`, with `status` one of `done`, `current`, `todo` and `error`.',
      'Steps before `value` are done, steps after it todo. With no `value` the first step is current; a `value` no step has leaves every step todo.',
      'A step\'s own `status` wins over `value`: `error` draws an x and is read as "Needs attention".',
      '`size` sets the circles, from 24 to 48 px, and the titles. With `custom` the circle reads `--tc-stepper-mark`, 32 px unless you set it.',
      'A long title wraps inside its column and is never cut. Steps that do not fit across wrap onto another row, so the page never scrolls sideways.',
    ],
    keyboard: [],
    a11y: [
      'An ordered list, which gives "2 of 4", with `role="list"` written so Safari with VoiceOver keeps it.',
      'The current step carries `aria-current="step"`; every other step has a hidden word for its status, from `labels`.',
      'The circles are hidden from screen readers, and nothing takes focus.',
    ],
    rtl: 'The steps run from the right by themselves. `locale` decides the digits: `ar-u-nu-arab` writes the numbers in Arabic-Indic digits.',
  },
  ar: {
    title: 'مؤشر الخطوات',
    description: 'أين يقف القارئ في مهمة من بضع خطوات. الخطوة المكتملة تحمل علامة صح لا لونًا فقط، فتبقى واضحة في لقطة شاشة رمادية.',
    note: 'مؤشر الخطوات يُعرض على الخادم: مرّر `value`، أي معرّف الخطوة الحالية. هو يعرض التقدّم ولا ينقل بين الصفحات.',
    notes: [
      'الخطوة هي `{ id, title, status? }`، و`status` واحدة من `done` و`current` و`todo` و`error`.',
      'الخطوات قبل `value` مكتملة، والخطوات بعدها لم تبدأ. بلا `value` تكون الخطوة الأولى هي الحالية، و`value` لا تملكه أي خطوة يترك كل الخطوات لم تبدأ.',
      '`status` الخاصة بالخطوة تتقدّم على `value`: الحالة `error` ترسم علامة x وتُقرأ «يحتاج إلى مراجعة».',
      '`size` يحدّد الدوائر، من 24 إلى 48 بكسل، والعناوين. ومع `custom` تقرأ الدائرة `--tc-stepper-mark`، وهو 32 بكسل ما لم تضبطه.',
      'العنوان الطويل يلتفّ داخل عموده ولا يُقصّ أبدًا. والخطوات التي لا تتسع في سطر واحد تنتقل إلى سطر آخر، فلا تُمرَّر الصفحة أفقيًا أبدًا.',
    ],
    keyboard: [],
    a11y: [
      'قائمة مرتّبة تعطي «2 من 4»، مع `role="list"` مكتوبًا كي يحتفظ بها Safari مع VoiceOver.',
      'الخطوة الحالية تحمل `aria-current="step"`، ولكل خطوة أخرى كلمة مخفية تقول حالتها، من `labels`.',
      'الدوائر مخفية عن قارئات الشاشة، ولا شيء يأخذ التركيز.',
    ],
    rtl: 'تبدأ الخطوات من اليمين وحدها. و`locale` يحدّد الأرقام: `ar-u-nu-arab` يكتب الأرقام بالهندية الشرقية.',
  },
} as const
