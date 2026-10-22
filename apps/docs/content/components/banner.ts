// The hand-written data of the Banner page (S7), in both locales.
export const banner = {
  slug: 'banner',
  title: { en: 'Banner', ar: 'شريط إعلان' },
  description: {
    en: 'Full width above the header; it pushes the page down rather than covering anything.',
    ar: 'بعرض كامل فوق الترويسة؛ يدفع الصفحة إلى الأسفل بدل أن يغطي شيئًا.',
  },
  note: {
    en: 'Dismissal is remembered per id, so change the id when the message changes.',
    ar: 'الإخفاء يُحفظ حسب المعرّف، فغيّر المعرّف عندما تتغير الرسالة.',
  },
  demos: ['basic', 'tones', 'with-action', 'dismissible', 'minimal', 'long-action', 'long-text', 'rtl'],
  stageHeight: 19.4375,
  notes: {
    en: [
      'For one message the whole page should see: a release, a trial ending, planned maintenance. Put it above the header.',
      'A link action is a Button with `render={<a href="..." />}`; a bare link gets no styling and no 44 px touch target. When the message and the action do not fit on one line, the action moves under the message.',
      'Pass an `icon` when the tone matters: colour alone does not tell a warning from a notice.',
      '`dismissible` and `id` are plain values, so a Server Component page needs no client wrapper, and only a dismissible banner ships the client part. `onDismiss` is a function, so only a client file can pass it.',
      'The server cannot read the visitor\'s storage, so the next page shows a dismissed banner until the script runs and then removes it, and the page below moves up. That is why `dismissible` is off by default.',
    ],
    ar: [
      'لرسالة واحدة يجب أن تراها الصفحة كلها: إصدار جديد، أو فترة تجريبية تنتهي، أو صيانة مجدولة. ضعه فوق الترويسة.',
      'الإجراء الذي هو رابط يكون زرًا مع `render={<a href="..." />}`؛ الرابط المجرد بلا تنسيق وبلا مساحة لمس 44 بكسل. وإذا لم تتسع الرسالة والإجراء لسطر واحد ينتقل الإجراء تحت الرسالة.',
      'مرّر `icon` عندما تهمّ النبرة: اللون وحده لا يميّز التحذير من الإشعار العادي.',
      '`dismissible` و`id` قيم عادية، فصفحة مكوّن خادم لا تحتاج إلى غلاف عميل، ولا يشحن الجزءَ العامل في المتصفح إلا الشريطُ القابل للإخفاء. أما `onDismiss` فدالة، فلا يمررها إلا ملف عميل.',
      'الخادم لا يقرأ تخزين الزائر، فالصفحة التالية تعرض الشريط المُخفى حتى يعمل السكربت فيزيله، فتصعد الصفحة تحته. لهذا يكون `dismissible` معطّلًا افتراضيًا.',
    ],
  },
  keyboard: [
    {
      keys: ['Tab'],
      action: { en: 'Reaches the action, then the x.', ar: 'يصل إلى الإجراء، ثم إلى زر الإغلاق.' },
    },
    {
      keys: ['Enter', 'Space'],
      action: {
        en: 'On the x, hides the banner and remembers it in this browser. Focus falls to the page; move it in onDismiss to put it somewhere.',
        ar: 'على زر الإغلاق، يخفي الشريط ويحفظ ذلك في هذا المتصفح. يسقط التركيز إلى الصفحة؛ انقله داخل onDismiss لتضعه في مكان محدد.',
      },
    },
  ],
  accessibility: {
    en: [
      'A banner is a `region` landmark, so it needs a name: pass `aria-label` or `aria-labelledby`. The type refuses a Banner with neither, and two banners on a page need two names.',
      'The x is 24 px, and 44 px on a touch screen. Under forced colours a hovered x draws an outline, and the banner draws an edge in place of its fill.',
      'A dismissible banner needs an `id`, which the type requires; it is also the element\'s id.',
    ],
    ar: [
      'شريط الإعلان معلَم من نوع `region`، فيحتاج إلى اسم: مرّر `aria-label` أو `aria-labelledby`. النوع يرفض شريطًا بلا أيٍّ منهما، والشريطان في صفحة واحدة يحتاجان إلى اسمين.',
      'زر الإغلاق 24 بكسل، و44 بكسل على شاشة اللمس. وتحت الألوان القسرية يرسم الزر حدًّا عند التمرير، ويرسم الشريط حافة بدل تعبئته.',
      'الشريط القابل للإخفاء يحتاج إلى `id` يفرضه النوع؛ وهو أيضًا معرّف العنصر.',
    ],
  },
  rtl: {
    en: 'The icon sits at the start, the action at the end, and the x at the inline end of whatever line it wraps to, with no physical class to mirror.',
    ar: 'الأيقونة في البداية والإجراء في النهاية، وزر الإغلاق في نهاية السطر الذي يلتف إليه، دون أي صنف فيزيائي يحتاج إلى عكس.',
  },
  related: {
    components: ['alert', 'toast', 'navbar'],
    pages: ['server-first', 'accessibility'],
  },
} as const
