// The hand-written data of one component page (docs-site S7), in en and ar.
export const dropdown = {
  slug: 'dropdown',
  title: { en: 'Dropdown menu', ar: 'قائمة منسدلة' },
  description: {
    en: 'A menu of actions and links behind one button. Link rows are real anchors, so open in a new tab and middle-click work.',
    ar: 'قائمة إجراءات وروابط خلف زر واحد. صفوف الروابط روابط حقيقية، فيعمل الفتح في علامة تبويب جديدة والنقر بالزر الأوسط.',
  },
  demos: ['basic', 'groups', 'danger-item', 'with-links', 'data-driven', 'placements', 'sixty-items', 'in-dialog', 'rtl'],
  stageHeight: 12,
  note: {
    en: '`href` and Server Action items work from a server page; `onSelect` is a plain function and needs a client file.',
    ar: 'عناصر `href` وإجراء الخادم تعمل من صفحة خادم؛ أما `onSelect` فدالة عادية تحتاج ملف عميل.',
  },
  notes: {
    en: [
      'For a short list of actions or links behind one button. Anything that is not a row goes in a Popover.',
      'Flat parts and no bare `Dropdown`: `DropdownRoot`, `DropdownTrigger`, `DropdownPopup`, `DropdownItem`, `DropdownLinkItem`, `DropdownGroup`, `DropdownGroupLabel`, `DropdownSeparator`.',
      '`DropdownMenu` builds the same menu from `items`: each is an `href` link, a Server Action `action`, or an `onSelect` function. Pass your framework\'s `Link` as `link`.',
      'A row takes `icon` before the label and `shortcut` after it; a long label ends in an ellipsis.',
      'The menu is as wide as its longest row, 192 to 320 px, and shows about seven rows before it scrolls inside itself.',
      'Every row is mounted: keep a menu to tens of rows.',
    ],
    ar: [
      'لقائمة قصيرة من الإجراءات أو الروابط خلف زر واحد. كل ما ليس صفًا يوضع في نافذة منبثقة.',
      'أجزاء بأسماء مسطّحة ولا يوجد `Dropdown` وحده: `DropdownRoot` و`DropdownTrigger` و`DropdownPopup` و`DropdownItem` و`DropdownLinkItem` و`DropdownGroup` و`DropdownGroupLabel` و`DropdownSeparator`.',
      '`DropdownMenu` يبني القائمة نفسها من `items`: كل عنصر رابط `href` أو إجراء خادم `action` أو دالة `onSelect`. مرّر `Link` إطار عملك إلى `link`.',
      'يأخذ الصف `icon` قبل التسمية و`shortcut` بعدها، والتسمية الطويلة تنتهي بعلامة حذف.',
      'عرض القائمة بعرض أطول صف، من 192 إلى 320 بكسل، وتعرض نحو سبعة صفوف قبل أن تتمرّر داخلها.',
      'كل الصفوف مركّبة: أبقِ القائمة في حدود عشرات الصفوف.',
    ],
  },
  keyboard: [
    {
      keys: ['Enter', 'Space', 'ArrowDown'],
      action: { en: 'On the trigger, opens the menu on the first row.', ar: 'على المشغّل، يفتح القائمة على الصف الأول.' },
    },
    {
      keys: ['ArrowUp'],
      action: { en: 'On the trigger, opens the menu on the last row.', ar: 'على المشغّل، يفتح القائمة على الصف الأخير.' },
    },
    {
      keys: ['ArrowDown', 'ArrowUp'],
      action: { en: 'Move between rows, and loop at both ends.', ar: 'يتنقّلان بين الصفوف، ويدوران عند الطرفين.' },
    },
    {
      keys: ['Home', 'End'],
      action: { en: 'Jump to the first or the last row.', ar: 'يقفزان إلى الصف الأول أو الأخير.' },
    },
    {
      keys: ['A-Z'],
      action: { en: 'A letter goes to the row that starts with it.', ar: 'الحرف ينقل إلى الصف الذي يبدأ به.' },
    },
    {
      keys: ['Enter', 'Space'],
      action: { en: 'Runs the row and closes the menu.', ar: 'ينفّذ الصف ويغلق القائمة.' },
    },
    {
      keys: ['Escape'],
      action: { en: 'Closes the menu. Focus returns to the trigger.', ar: 'يغلق القائمة. يعود التركيز إلى المشغّل.' },
    },
    {
      keys: ['Tab'],
      action: { en: 'Closes the menu and goes on to the next control of the page.', ar: 'يغلق القائمة وينتقل إلى عنصر التحكم التالي في الصفحة.' },
    },
  ],
  accessibility: {
    en: [
      '`tone="danger"` only colours the row: write what it does in the label, add an icon, and put a separator above it.',
      'A row with an icon alone needs `aria-label`, and the types ask for it.',
      'A disabled row is announced as unavailable, and the arrow keys still stop on it.',
    ],
    ar: [
      '`tone="danger"` يلوّن الصف فقط: اكتب ما يفعله في التسمية، وأضف أيقونة، وضع فاصلًا فوقه.',
      'الصف الذي يحمل أيقونة فقط يحتاج `aria-label`، والأنواع تطلبه.',
      'الصف المعطّل يُعلن أنه غير متاح، وتتوقف عنده مفاتيح الأسهم مع ذلك.',
    ],
  },
  rtl: {
    en: '`bottom-start` lines up the right edges, the icon sits at the right and the shortcut at the left. The menu takes its direction from the nearest `TopClassProvider`.',
    ar: '`bottom-start` تحاذي الحواف اليمنى، وتقع الأيقونة على اليمين والاختصار على اليسار. تأخذ القائمة اتجاهها من أقرب `TopClassProvider`.',
  },
  related: {
    components: ['popover', 'command', 'select'],
    pages: ['server-first', 'accessibility', 'rtl'],
  },
} as const
