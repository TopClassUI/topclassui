// The hand-written data of one component page (docs-site S7), in en and ar.
export const treeView = {
  slug: 'tree-view',
  title: { en: 'Tree view', ar: 'عرض شجري' },
  description: {
    en: 'Nodes in levels that open and close. Open branches flatten into one windowed list, so 10,000 nodes stay fast.',
    ar: 'عقد في مستويات تُفتح وتُغلق. الفروع المفتوحة تُسطَّح في قائمة واحدة تعرض ما يظهر فقط، فتبقى 10,000 عقدة سريعة.',
  },
  demos: ['basic', 'selected', 'load-more', 'status', 'ten-thousand', 'long-content', 'rtl'],
  stageHeight: 22,
  note: {
    en: '`items` is plain data and a node\'s icon is an element, so a Server Component passes the tree as it is; there is no `getKey`.',
    ar: '`items` بيانات عادية وأيقونة العقدة عنصر، فيمرّر مكوّن الخادم الشجرة كما هي، ولا يوجد `getKey`.',
  },
  notes: {
    en: [
      'A node is `{ id, label, icon?, disabled?, children? }`. The `id` is the key; a node with `children`, even `[]`, is a branch.',
      'To load a branch\'s children, listen to `onExpandedChange` and pass them in through `items`.',
      '`loadMore` asks for the next page of root nodes, once per page, while `hasMore`. The tree never fetches.',
      '`visibleRows` sets how many rows show before the tree scrolls; left out, the `--tc-list-rows` knob applies. `virtualize` windows above 200 visible rows.',
      '`status` marks the tree busy while `loading` or `loading-more`, and says there is nothing when `empty`.',
      '`className`, `style`, `ref` and every other prop reach the element with `role="tree"`, not the box around it.',
    ],
    ar: [
      'العقدة هي `{ id, label, icon?, disabled?, children? }`. الـ `id` هو المفتاح، والعقدة التي تحمل `children`، ولو `[]`، فرع.',
      'لتحميل أبناء فرع، استمع إلى `onExpandedChange` ومرّرهم عبر `items`.',
      '`loadMore` يطلب الصفحة التالية من العقد الجذرية، مرة لكل صفحة، ما دام `hasMore`. الشجرة لا تجلب البيانات أبدًا.',
      '`visibleRows` يحدّد عدد الصفوف الظاهرة قبل أن تُمرَّر الشجرة، وإن لم يُمرَّر يُطبَّق المتغير `--tc-list-rows`. و`virtualize` يعرض ما يظهر فقط فوق 200 صف ظاهر.',
      '`status` يجعل الشجرة مشغولة في `loading` و`loading-more`، ويقول إنه لا يوجد شيء في `empty`.',
      '`className` و`style` و`ref` وكل خاصية أخرى تصل إلى العنصر الذي يحمل `role="tree"`، لا إلى الصندوق المحيط به.',
    ],
  },
  keyboard: [
    {
      keys: ['ArrowDown', 'ArrowUp'],
      action: { en: 'The next or the previous visible row; no wrap.', ar: 'الصف الظاهر التالي أو السابق، بلا التفاف.' },
    },
    {
      keys: ['ArrowRight'],
      action: {
        en: 'Opens a closed branch; on an open one, moves to its first child. ArrowLeft in Arabic.',
        ar: 'يفتح فرعًا مغلقًا، وفي الفرع المفتوح ينتقل إلى أول أبنائه. وفي العربية ArrowLeft.',
      },
    },
    {
      keys: ['ArrowLeft'],
      action: {
        en: 'Closes an open branch; anything else moves to its parent. ArrowRight in Arabic.',
        ar: 'يغلق فرعًا مفتوحًا، وفي غير ذلك ينتقل إلى الأب. وفي العربية ArrowRight.',
      },
    },
    { keys: ['Home', 'End'], action: { en: 'The first, the last visible row.', ar: 'أول صف ظاهر، وآخر صف ظاهر.' } },
    {
      keys: ['Enter'],
      action: {
        en: 'Selects the row, and opens or closes a branch; a press does the same.',
        ar: 'يحدّد الصف، ويفتح الفرع أو يغلقه، والضغط يفعل الشيء نفسه.',
      },
    },
    { keys: ['Space'], action: { en: 'Selects the row.', ar: 'يحدّد الصف.' } },
    {
      keys: ['A–Z'],
      action: {
        en: 'The next row whose label starts with what was typed in the last 500 ms.',
        ar: 'الصف التالي الذي يبدأ اسمه بما كُتب خلال آخر 500 ميلي ثانية.',
      },
    },
  ],
  accessibility: {
    en: [
      'The tree is the one tab stop and keeps the focus; `aria-activedescendant` names the row the keys are on, so windowing never drops the focus.',
      'A tree draws no name of its own: `aria-label` or `aria-labelledby` is required by the types.',
      'Each row carries its level, its position among its siblings and whether it is open, so a screen reader says where it is.',
    ],
    ar: [
      'الشجرة محطة Tab واحدة وتحتفظ بالتركيز، و`aria-activedescendant` يسمّي الصف الذي تعمل عليه المفاتيح، فلا يضيع التركيز مع العرض الجزئي.',
      'الشجرة لا ترسم اسمًا لنفسها: الأنواع تشترط `aria-label` أو `aria-labelledby`.',
      'كل صف يحمل مستواه وموضعه بين إخوته وهل هو مفتوح، فيقول قارئ الشاشة أين هو.',
    ],
  },
  rtl: {
    en: 'The indent is on the right and a closed caret points left. ArrowLeft opens a branch and ArrowRight closes it.',
    ar: 'المسافة البادئة على اليمين، والسهم المغلق يشير إلى اليسار. ArrowLeft يفتح الفرع وArrowRight يغلقه.',
  },
  related: {
    components: ['table', 'timeline', 'sidebar', 'command'],
    pages: ['accessibility', 'rtl', 'server-first'],
  },
} as const
