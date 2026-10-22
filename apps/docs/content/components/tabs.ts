// The hand-written data of the Tabs page and card (docs-site S7), in en and ar; `x` in a string is inline code.
export const tabs = {
  slug: 'tabs',
  title: {
    en: 'Tabs',
    ar: 'علامات التبويب',
  },
  description: {
    en: 'Panels render on the server and stay in the HTML, so inactive text is still indexed.',
    ar: 'عروض متعددة لشيء واحد، يظهر منها واحد في كل مرة. كل لوحة تُعرض على الخادم وتبقى في HTML، فيُفهرَس النص المخفي أيضًا.',
  },
  demos: ['basic', 'enclosed', 'sizes', 'disabled', 'server-content', 'controlled', 'many', 'long-label', 'rtl'],
  stageHeight: 19.4,
  stageDemo: 'stage',
  note: {
    en: '`keepMounted` is true here, where Base UI\'s default is false: inactive panels stay in the server HTML, hidden.',
    ar: '`keepMounted` هنا true، وقيمته في Base UI هي false: اللوحات غير النشطة تبقى مخفية في HTML القادم من الخادم.',
  },
  notes: {
    en: [
      'Four flat parts and no bare `Tabs`: `TabsRoot`, `TabsList`, `TabsTab` and `TabsPanel`. Each passes the rest of its props to the element it draws.',
      'Always pass `defaultValue`, or `value`. Without it the server HTML shows no panel until the page hydrates.',
      'Write a panel\'s content in your Server Component. A heavy panel can take `keepMounted={false}`, which leaves it out until its tab opens.',
      '`variant` on `TabsRoot`: `line` draws a bar under the active tab, `enclosed` raises it inside a tinted box.',
      '`size` on `TabsRoot` sets every tab. `custom` sets nothing: give each `TabsTab` its own `className`.',
      'Many tabs scroll sideways inside the list, and the page does not. A long label ends in an ellipsis and is cut at 100 characters.',
      '`value` with `onValueChange` needs a `\'use client\'` file, as the controlled example shows.',
    ],
    ar: [
      'أربعة أجزاء بأسماء مسطّحة، ولا يوجد `Tabs` وحده: `TabsRoot` و`TabsList` و`TabsTab` و`TabsPanel`. كل جزء يمرّر بقية خصائصه إلى العنصر الذي يرسمه.',
      'مرّر دائمًا `defaultValue` أو `value`. دونهما لا يُظهر HTML القادم من الخادم أي لوحة حتى الترطيب.',
      'اكتب محتوى اللوحة في مكوّن الخادم الخاص بك. اللوحة الثقيلة تأخذ `keepMounted={false}`، فلا تُضاف حتى تُفتح علامتها.',
      '`variant` على `TabsRoot`: `line` يرسم خطًّا تحت العلامة النشطة، و`enclosed` يرفعها داخل صندوق ملوّن.',
      '`size` على `TabsRoot` يضبط كل العلامات. `custom` لا يضبط شيئًا: أعطِ كل `TabsTab` قيمة `className` الخاصة به.',
      'العلامات الكثيرة تمرّر أفقيًا داخل القائمة، ولا تتحرك الصفحة. التسمية الطويلة تنتهي بعلامة حذف وتُقصّ عند 100 حرف.',
      '`value` مع `onValueChange` يحتاجان ملفًا فيه `\'use client\'`، كما في المثال المتحكَّم به.',
    ],
  },
  keyboard: [
    { keys: ['ArrowRight'], action: { en: 'Moves to the next tab; in RTL, the tab before.', ar: 'ينتقل إلى العلامة التالية، ومن اليمين إلى اليسار إلى العلامة السابقة.' } },
    { keys: ['ArrowLeft'], action: { en: 'Moves to the tab before; in RTL, the next one.', ar: 'ينتقل إلى العلامة السابقة، ومن اليمين إلى اليسار إلى التالية.' } },
    { keys: ['Home'], action: { en: 'Moves to the first tab.', ar: 'ينتقل إلى العلامة الأولى.' } },
    { keys: ['End'], action: { en: 'Moves to the last tab.', ar: 'ينتقل إلى العلامة الأخيرة.' } },
    { keys: ['Enter'], action: { en: 'Opens the focused tab.', ar: 'يفتح العلامة التي عليها التركيز.' } },
    { keys: ['Space'], action: { en: 'Opens the focused tab.', ar: 'يفتح العلامة التي عليها التركيز.' } },
    { keys: ['Tab'], action: { en: 'Leaves the list for the open panel.', ar: 'يغادر القائمة إلى اللوحة المفتوحة.' } },
  ],
  accessibility: {
    en: [
      '`TabsList` needs `aria-label` or `aria-labelledby`: TypeScript refuses it without one.',
      'A `disabled` tab cannot be opened, but the arrow keys still stop on it, so a screen reader hears that it is there.',
      'The panel is a tab stop of its own. Pass `tabIndex={-1}` to a `TabsPanel` whose first thing is a button or a field.',
    ],
    ar: [
      '`TabsList` يحتاج `aria-label` أو `aria-labelledby`: يرفضه TypeScript دون أحدهما.',
      'العلامة المعطّلة بـ`disabled` لا تُفتح، لكن مفاتيح الأسهم تتوقف عندها، فيسمع قارئ الشاشة أنها موجودة.',
      'اللوحة محطة Tab مستقلة. مرّر `tabIndex={-1}` إلى `TabsPanel` يبدأ بزر أو حقل.',
    ],
  },
  rtl: {
    en: 'The first tab sits at the right. With TopClassProvider direction="rtl" the left arrow goes to the next tab; without a provider the keys stay left to right.',
    ar: 'العلامة الأولى على اليمين. مع `TopClassProvider` وdirection="rtl" ينقل السهم الأيسر إلى العلامة التالية، ودون مزوّد تبقى المفاتيح من اليسار إلى اليمين.',
  },
  related: {
    components: ['accordion', 'segmented-control', 'navbar', 'sidebar'],
    pages: ['server-first', 'accessibility', 'rtl'],
  },
} as const
