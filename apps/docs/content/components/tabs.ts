// The hand-written data of the Tabs page (docs-site S7), in English and Arabic.
export const content = {
  slug: 'tabs',
  demos: ['basic', 'enclosed', 'sizes', 'disabled', 'server-content', 'controlled', 'many', 'long-label', 'rtl'],
  stageHeight: 7,
  related: ['accordion', 'segmented-control', 'navbar', 'sidebar'],
  en: {
    title: 'Tabs',
    description: 'Views of one thing, shown one at a time. Every panel renders on the server and stays in the HTML, so hidden text is still indexed.',
    note: '`keepMounted` is true here, where Base UI\'s default is false: inactive panels stay in the server HTML, hidden.',
    notes: [
      'Four flat parts and no bare `Tabs`: `TabsRoot`, `TabsList`, `TabsTab` and `TabsPanel`. Each passes the rest of its props to the element it draws.',
      'Always pass `defaultValue`, or `value`. Without it the server HTML shows no panel until the page hydrates.',
      'Write a panel\'s content in your Server Component. A heavy panel can take `keepMounted={false}`, which leaves it out until its tab opens.',
      '`variant` on `TabsRoot`: `line` draws a bar under the active tab, `enclosed` raises it inside a tinted box.',
      '`size` on `TabsRoot` sets every tab. `custom` sets nothing: give each `TabsTab` its own `className`.',
      'Many tabs scroll sideways inside the list, and the page does not. A long label ends in an ellipsis and is cut at 100 characters.',
      '`value` with `onValueChange` needs a `\'use client\'` file, as the controlled example shows.',
    ],
    a11y: [
      '`TabsList` needs `aria-label` or `aria-labelledby`: TypeScript refuses it without one.',
      'A `disabled` tab cannot be opened, but the arrow keys still stop on it, so a screen reader hears that it is there.',
      'The panel is a tab stop of its own. Pass `tabIndex={-1}` to a `TabsPanel` whose first thing is a button or a field.',
    ],
    keyboard: [
      { keys: 'Right arrow / Left arrow', action: 'Moves to the next or the previous tab.' },
      { keys: 'Home / End', action: 'Moves to the first or the last tab.' },
      { keys: 'Enter or Space', action: 'Opens the focused tab.' },
      { keys: 'Tab', action: 'Leaves the list for the open panel.' },
    ],
    rtl: 'The first tab sits at the right. With TopClassProvider direction="rtl" the left arrow goes to the next tab; without a provider the keys stay left to right.',
  },
  ar: {
    title: 'علامات التبويب',
    description: 'عروض متعددة لشيء واحد، يظهر منها واحد في كل مرة. كل لوحة تُعرض على الخادم وتبقى في HTML، فيُفهرَس النص المخفي أيضًا.',
    note: '`keepMounted` هنا true، وقيمته في Base UI هي false: اللوحات غير النشطة تبقى مخفية في HTML القادم من الخادم.',
    notes: [
      'أربعة أجزاء بأسماء مسطّحة، ولا يوجد `Tabs` وحده: `TabsRoot` و`TabsList` و`TabsTab` و`TabsPanel`. كل جزء يمرّر بقية خصائصه إلى العنصر الذي يرسمه.',
      'مرّر دائمًا `defaultValue` أو `value`. دونهما لا يُظهر HTML القادم من الخادم أي لوحة حتى الترطيب.',
      'اكتب محتوى اللوحة في مكوّن الخادم الخاص بك. اللوحة الثقيلة تأخذ `keepMounted={false}`، فلا تُضاف حتى تُفتح علامتها.',
      '`variant` على `TabsRoot`: `line` يرسم خطًّا تحت العلامة النشطة، و`enclosed` يرفعها داخل صندوق ملوّن.',
      '`size` على `TabsRoot` يضبط كل العلامات. `custom` لا يضبط شيئًا: أعطِ كل `TabsTab` قيمة `className` الخاصة به.',
      'العلامات الكثيرة تمرّر أفقيًا داخل القائمة، ولا تتحرك الصفحة. التسمية الطويلة تنتهي بعلامة حذف وتُقصّ عند 100 حرف.',
      '`value` مع `onValueChange` يحتاجان ملفًا فيه `\'use client\'`، كما في المثال المتحكَّم به.',
    ],
    a11y: [
      '`TabsList` يحتاج `aria-label` أو `aria-labelledby`: يرفضه TypeScript دون أحدهما.',
      'العلامة المعطّلة بـ`disabled` لا تُفتح، لكن مفاتيح الأسهم تتوقف عندها، فيسمع قارئ الشاشة أنها موجودة.',
      'اللوحة نقطة توقف مستقلة لمفتاح Tab. مرّر `tabIndex={-1}` إلى `TabsPanel` يبدأ بزر أو حقل.',
    ],
    keyboard: [
      { keys: 'السهم الأيسر / السهم الأيمن', action: 'ينتقل إلى العلامة التالية أو السابقة.' },
      { keys: 'Home / End', action: 'ينتقل إلى العلامة الأولى أو الأخيرة.' },
      { keys: 'Enter أو Space', action: 'يفتح العلامة التي عليها التركيز.' },
      { keys: 'Tab', action: 'يغادر القائمة إلى اللوحة المفتوحة.' },
    ],
    rtl: 'العلامة الأولى على اليمين. مع `TopClassProvider` وdirection="rtl" ينقل السهم الأيسر إلى العلامة التالية، ودون مزوّد تبقى المفاتيح من اليسار إلى اليمين.',
  },
} as const
