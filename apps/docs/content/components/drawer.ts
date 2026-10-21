// The hand-written data of one component page (docs-site S7), in en and ar.
export const drawer = {
  slug: 'drawer',
  title: { en: 'Drawer', ar: 'درج' },
  description: {
    en: 'A dialog that slides in from a logical edge, so it mirrors in Arabic with no code change. A swipe or the x closes it.',
    ar: 'مربع حوار ينزلق من حافة منطقية، فينعكس في العربية دون أي تعديل في الشيفرة. يُغلق بالسحب أو بزر الإغلاق.',
  },
  demos: [
    'end',
    'start',
    'bottom',
    'top',
    'sizes',
    'with-form',
    'long-body',
    'long-content',
    'non-modal',
    'trap-focus',
    'rtl',
  ],
  stageHeight: 24.25,
  stageOpen: true,
  note: {
    en: '`placement` is logical: `start` opens from the left in English and from the right in Arabic. Never `left` or `right`.',
    ar: '`placement` منطقي: `start` يفتح من اليسار في الإنجليزية ومن اليمين في العربية. لا `left` ولا `right` أبدًا.',
  },
  notes: {
    en: [
      'For a panel that slides in from an edge of the screen: filters, navigation, a list to pick from on a phone.',
      '`placement` on `DrawerRoot`: `end` (the default), `start`, `top` or `bottom`.',
      '`size` on `DrawerRoot` is the widest a `start` or `end` sheet grows: 256, 288, 320, 384 or 480 px. Top and bottom sheets span the screen and grow to nine tenths of its height.',
      'A swipe toward the sheet\'s own edge closes it once it is past half of the sheet. A finger starts anywhere on the sheet; a mouse starts on the header.',
      '`DrawerBody` scrolls and the header and the footer stay put. Start with a `DrawerHeader`, which keeps the title clear of the x.',
      'On a phone the sheet pads the notch and the home indicator, when the viewport meta has `viewport-fit=cover`.',
    ],
    ar: [
      'للوحة تنزلق من حافة الشاشة: عوامل التصفية، التنقّل، قائمة للاختيار منها على الهاتف.',
      '`placement` على `DrawerRoot`: `end` (الافتراضي) أو `start` أو `top` أو `bottom`.',
      '`size` على `DrawerRoot` هو أقصى عرض يبلغه درج `start` أو `end`: 256 أو 288 أو 320 أو 384 أو 480 بكسل. درجا الأعلى والأسفل يمتدان بعرض الشاشة ويبلغان تسعة أعشار ارتفاعها.',
      'السحب نحو حافة الدرج يغلقه متى تجاوز نصفه. الإصبع يبدأ من أي مكان في الدرج، والفأرة تبدأ من الرأس.',
      '`DrawerBody` يتمرّر ويبقى الرأس والتذييل في مكانهما. ابدأ بـ `DrawerHeader`، فهو يُبعد العنوان عن زر الإغلاق.',
      'على الهاتف يترك الدرج مساحة للنتوء ولمؤشر الشاشة الرئيسية، إن كان وسم viewport يحمل `viewport-fit=cover`.',
    ],
  },
  keyboard: [
    {
      keys: ['Enter', 'Space'],
      action: {
        en: 'On the trigger, opens the sheet. Focus lands on the sheet, and Tab goes to its first control.',
        ar: 'على المشغّل، يفتح الدرج. ينتقل التركيز إلى الدرج نفسه، ثم ينقله Tab إلى أول عنصر تحكم.',
      },
    },
    {
      keys: ['Tab', 'Shift+Tab'],
      action: { en: 'Move through the sheet. Focus stays inside it.', ar: 'يتنقّلان داخل الدرج. يبقى التركيز داخله.' },
    },
    {
      keys: ['Escape'],
      action: {
        en: 'Closes a tooltip open inside first, then the sheet. Focus returns to the trigger.',
        ar: 'يغلق أولًا تلميحًا مفتوحًا داخله، ثم الدرج. يعود التركيز إلى المشغّل.',
      },
    },
  ],
  accessibility: {
    en: [
      'Every sheet ends with an x that nothing removes: a swipe is a drag, and a drag needs a second way (WCAG 2.5.7).',
      '`DrawerTitle` names the sheet. With no title, pass `aria-label` to `DrawerPopup`.',
      'While `DrawerBody` scrolls it is a tab stop, so the keyboard reaches a long text with no control in it.',
    ],
    ar: [
      'كل درج ينتهي بزر إغلاق لا يمكن إزالته: السحب حركة جرّ، والجرّ يحتاج طريقة ثانية (WCAG 2.5.7).',
      '`DrawerTitle` يسمّي الدرج. إن لم يكن له عنوان، مرّر `aria-label` إلى `DrawerPopup`.',
      'ما دام `DrawerBody` يتمرّر فهو محطة Tab، فتصل لوحة المفاتيح إلى نص طويل لا عنصر تحكم فيه.',
    ],
  },
  rtl: {
    en: '`start` opens from the right and `end` from the left, and each closes by a swipe toward its own edge. Mount a `TopClassProvider`: without one the swipe follows left to right.',
    ar: '`start` يفتح من اليمين و`end` من اليسار، ويُغلق كل منهما بالسحب نحو حافته. ركّب `TopClassProvider`: من دونه يتبع السحب اتجاه اليسار إلى اليمين.',
  },
  related: {
    components: ['dialog', 'popover', 'sidebar'],
    pages: ['rtl', 'accessibility', 'server-first'],
  },
} as const
