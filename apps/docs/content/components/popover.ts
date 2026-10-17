// The hand-written data of one component page (docs-site S7), in en and ar.
export const popover = {
  slug: 'popover',
  title: { en: 'Popover', ar: 'نافذة منبثقة' },
  description: {
    en: 'An anchored panel for a link, a field or an action. It flips and shrinks to the room it has instead of overflowing.',
    ar: 'لوحة مثبّتة بجانب مشغّلها لرابط أو حقل أو إجراء. تنقلب وتتقلّص إلى المساحة المتاحة بدلًا من أن تفيض.',
  },
  demos: ['basic', 'with-close', 'hover', 'with-form', 'modal', 'placements', 'long-content', 'rtl'],
  stageHeight: 12,
  note: {
    en: 'A tooltip is plain text only: its children are typed as text. Anything with a link or a control is a Popover.',
    ar: 'التلميح نص فقط: أبناؤه مكتوبون كنص. كل ما فيه رابط أو عنصر تحكم هو نافذة منبثقة.',
  },
  notes: {
    en: [
      'Six flat parts and no bare `Popover`: `PopoverRoot`, `PopoverTrigger`, `PopoverPopup`, `PopoverTitle`, `PopoverDescription` and `PopoverClose`.',
      '`placement` on `PopoverPopup`: twelve values, `bottom` by default. It opens on the other side when its own has no room, and stays 8 px inside the screen.',
      'The popup is 280 px wide and never taller than the room it has; past that it scrolls inside itself. For another width, pass a class.',
      'A `PopoverClose` with nothing in it is the x, and you place it.',
      '`openOnHover` on the trigger lets the pointer open it too, after `delay` (300 ms) and until `closeDelay` (0 ms), both clamped to 0 to 10000.',
      'Put a `form` inside `PopoverPopup`, never `render={<form />}` on it, and give it an `action` or an `onSubmit`.',
    ],
    ar: [
      'ستة أجزاء بأسماء مسطّحة ولا يوجد `Popover` وحده: `PopoverRoot` و`PopoverTrigger` و`PopoverPopup` و`PopoverTitle` و`PopoverDescription` و`PopoverClose`.',
      '`placement` على `PopoverPopup`: اثنتا عشرة قيمة، و`bottom` افتراضيًا. تفتح على الجهة الأخرى حين لا تتسع جهتها، وتبقى على بعد 8 بكسل داخل الشاشة.',
      'عرض النافذة 280 بكسل ولا يتجاوز ارتفاعها المساحة المتاحة، وبعد ذلك تتمرّر داخلها. لعرض آخر، مرّر صنفًا.',
      '`PopoverClose` بلا محتوى هو زر الإغلاق، وأنت تحدّد مكانه.',
      '`openOnHover` على المشغّل يتيح للمؤشر فتحها أيضًا، بعد `delay` (300 مللي ثانية) وحتى `closeDelay` (0)، وكلاهما محصور بين 0 و10000.',
      'ضع `form` داخل `PopoverPopup`، لا `render={<form />}` عليها، وأعطه `action` أو `onSubmit`.',
    ],
  },
  keyboard: [
    {
      keys: ['Enter', 'Space'],
      action: {
        en: 'On the trigger, opens the popover. Focus lands on the first control, or on the popup.',
        ar: 'على المشغّل، يفتح النافذة. ينتقل التركيز إلى أول عنصر تحكم، أو إلى النافذة.',
      },
    },
    {
      keys: ['Tab'],
      action: { en: 'Past the last control, closes the popover and goes on down the page.', ar: 'بعد آخر عنصر تحكم، يغلق النافذة ويتابع في الصفحة.' },
    },
    {
      keys: ['Shift+Tab'],
      action: { en: 'From the first control, goes back to the trigger.', ar: 'من أول عنصر تحكم، يعود إلى المشغّل.' },
    },
    {
      keys: ['Escape'],
      action: {
        en: 'Closes a tooltip open inside first, then the popover. Focus returns to the trigger.',
        ar: 'يغلق أولًا تلميحًا مفتوحًا داخلها، ثم النافذة. يعود التركيز إلى المشغّل.',
      },
    },
  ],
  accessibility: {
    en: [
      '`PopoverTitle` names the popover and `PopoverDescription` describes it. With no title, pass `aria-label` to `PopoverPopup`.',
      'A touch screen reader has no Escape key: give a popover with more than a line of text a `PopoverClose`.',
      'While the popup scrolls it is a tab stop, so the keyboard reaches a long text with no control in it.',
    ],
    ar: [
      '`PopoverTitle` يسمّي النافذة و`PopoverDescription` يصفها. إن لم يكن لها عنوان، مرّر `aria-label` إلى `PopoverPopup`.',
      'قارئ الشاشة على شاشة لمس لا يملك مفتاح Escape: أعطِ النافذة التي تحمل أكثر من سطر `PopoverClose`.',
      'ما دامت النافذة تتمرّر فهي محطة Tab، فتصل لوحة المفاتيح إلى نص طويل لا عنصر تحكم فيه.',
    ],
  },
  rtl: {
    en: '`start` opens on the right and `end` on the left, and `bottom-start` lines up the right edges. The popup takes its direction from the nearest `TopClassProvider`.',
    ar: '`start` تفتح على اليمين و`end` على اليسار، و`bottom-start` تحاذي الحواف اليمنى. تأخذ النافذة اتجاهها من أقرب `TopClassProvider`.',
  },
  related: {
    components: ['tooltip', 'dropdown', 'dialog'],
    pages: ['rtl', 'accessibility', 'server-first'],
  },
} as const
