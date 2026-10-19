// The hand-written data of one component page (docs-site S7), in en and ar.
export const command = {
  slug: 'command',
  title: { en: 'Command palette', ar: 'لوحة الأوامر' },
  description: {
    en: 'A searchable palette of actions, opened with Ctrl+K or Cmd+K. It loads on its first open, never with the page.',
    ar: 'لوحة أوامر قابلة للبحث تُفتح بـ Ctrl+K أو Cmd+K. تُحمَّل عند أول فتح لها، لا مع الصفحة أبدًا.',
  },
  demos: [
    'basic',
    'groups',
    'with-shortcuts',
    'empty-state',
    'loading',
    'thousand',
    'ten-thousand',
    'long-content',
    'long-page',
    'with-tooltip',
    'rtl',
  ],
  stageHeight: 12,
  stageOpen: true,
  note: {
    en: '`getKey`, `getLabel` and `onSelect` are functions, so the palette is configured inside a client file.',
    ar: '`getKey` و`getLabel` و`onSelect` دوال، لذا تُضبط اللوحة داخل ملف عميل.',
  },
  notes: {
    en: [
      '`Command` is the whole palette; its parts are not exported.',
      'Open it with `open` and `onOpenChange` from your button, or leave both out and let `shortcut` open it.',
      'Before its first open it renders nothing and has loaded no Base UI; it stays mounted after that.',
      'Every word of the query matches anywhere in `getLabel`, in any case, and the order of `items` is kept.',
      '`getGroup` returns a heading, and `renderItem` draws a row that stays one line tall.',
      '`virtualize` is `\'auto\'` (windowing above 200 rows), `true` or `false`; `visibleRows` sets how many rows show.',
    ],
    ar: [
      '`Command` هي اللوحة كلها، وأجزاؤها غير مُصدَّرة.',
      'افتحها بـ `open` و`onOpenChange` من زرك، أو اتركهما ودع `shortcut` يفتحها.',
      'قبل أول فتح لا تعرض شيئًا ولم تحمّل شيئًا من Base UI، وتبقى مركّبة بعد ذلك.',
      'كل كلمة من الاستعلام تُطابق في أي موضع من `getLabel` وبأي حالة أحرف، ويُحفظ ترتيب `items`.',
      '`getGroup` يعيد عنوانًا، و`renderItem` يرسم صفًا يبقى بارتفاع سطر واحد.',
      '`virtualize` هو `\'auto\'` (عرض جزئي فوق 200 صف) أو `true` أو `false`، و`visibleRows` يحدّد عدد الصفوف الظاهرة.',
    ],
  },
  keyboard: [
    {
      keys: ['Ctrl+K', 'Cmd+K'],
      action: {
        en: 'Opens the palette from anywhere, with focus in the input. `shortcut` changes the key; `null` removes it.',
        ar: 'يفتح اللوحة من أي مكان، والتركيز في حقل البحث. `shortcut` يغيّر المفتاح، و`null` يلغيه.',
      },
    },
    {
      keys: ['ArrowDown', 'ArrowUp'],
      action: {
        en: 'Move the active row. The first match is active as you type.',
        ar: 'يحرّكان الصف النشط. أول نتيجة مطابقة تصبح نشطة أثناء الكتابة.',
      },
    },
    {
      keys: ['Enter'],
      action: { en: 'Closes the palette, then runs the active row once.', ar: 'يغلق اللوحة، ثم ينفّذ الصف النشط مرة واحدة.' },
    },
    {
      keys: ['Escape'],
      action: {
        en: 'Closes a tooltip open inside first, then the palette. Focus returns to what had it before.',
        ar: 'يغلق أولًا تلميحًا مفتوحًا داخلها، ثم اللوحة. يعود التركيز إلى حيث كان.',
      },
    },
  ],
  accessibility: {
    en: [
      'The input is a combobox over a listbox, with `aria-activedescendant` on the active row.',
      'With no match the list is removed and the empty text shows, so no empty listbox is left to land in.',
      'Home and End stay with the input, for its caret.',
    ],
    ar: [
      'حقل البحث combobox فوق listbox، و`aria-activedescendant` يشير إلى الصف النشط.',
      'إن لم تطابق أي نتيجة تُزال القائمة ويظهر نص الفراغ، فلا تبقى listbox فارغة يقع فيها القارئ.',
      'يبقى Home وEnd لحقل البحث، لتحريك المؤشر فيه.',
    ],
  },
  rtl: {
    en: 'The glass sits at the right of the input and the rows align right. Ctrl+K also works under an Arabic keyboard layout, because the key is matched by its place too.',
    ar: 'تقع العدسة على يمين حقل البحث وتُحاذى الصفوف إلى اليمين. يعمل Ctrl+K أيضًا مع لوحة مفاتيح عربية، لأن المفتاح يُطابق بموضعه أيضًا.',
  },
  related: {
    components: ['dialog', 'dropdown', 'combobox'],
    pages: ['server-first', 'accessibility', 'rtl'],
  },
} as const
