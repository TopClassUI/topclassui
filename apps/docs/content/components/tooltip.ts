// The hand-written data of one component page (docs-site S7), in en and ar.
export const tooltip = {
  slug: 'tooltip',
  title: { en: 'Tooltip', ar: 'تلميح' },
  description: {
    en: 'One or two lines of plain text on hover or focus: the name of an icon-only control, or a label that truncates.',
    ar: 'سطر أو سطران من النص عند التمرير أو التركيز: اسم عنصر تحكم بأيقونة فقط، أو تسمية مقطوعة.',
  },
  demos: ['basic', 'delays', 'long-label', 'with-count', 'placements', 'disabled', 'rtl'],
  stageHeight: 24.25,
  stageOpen: true,
  note: {
    en: 'Touch never shows a tooltip, so the trigger\'s own name must repeat the text: give an icon-only Button an `aria-label`.',
    ar: 'شاشات اللمس لا تعرض التلميح أبدًا، فيجب أن يكرّر اسم المشغّل النص نفسه: أعطِ الزر ذا الأيقونة فقط `aria-label`.',
  },
  notes: {
    en: [
      'Three flat parts, `TooltipRoot`, `TooltipTrigger` and `TooltipPopup`, and no bare `Tooltip`.',
      'Anything with a link or a control is a Popover: the popup\'s children are typed as text, so an element is refused at compile time.',
      '`delay` and `closeDelay` go on the trigger and are clamped to 0 to 10000 ms; left out, 600 and 0 apply, or the shared delay of the app\'s provider.',
      '`placement` goes on the popup, `top` by default.',
      'Put the trigger\'s text or icon inside the Button passed to `render`, never inside `TooltipTrigger`, so the label still truncates and the icon still gives way to the loading spinner.',
    ],
    ar: [
      'ثلاثة أجزاء بأسماء مسطّحة، `TooltipRoot` و`TooltipTrigger` و`TooltipPopup`، ولا يوجد `Tooltip` وحده.',
      'كل ما فيه رابط أو عنصر تحكم هو نافذة منبثقة: أبناء النافذة مكتوبون كنص، فيُرفض العنصر عند الترجمة.',
      '`delay` و`closeDelay` على المشغّل، محصوران بين 0 و10000 مللي ثانية؛ إن لم يُمرَّرا يُطبَّق 600 و0، أو التأخير المشترك من مزوّد التطبيق.',
      '`placement` على النافذة، و`top` افتراضيًا.',
      'ضع نص المشغّل أو أيقونته داخل الزر الممرَّر إلى `render`، لا داخل `TooltipTrigger`، فتبقى التسمية تنتهي بعلامة حذف وتفسح الأيقونة مكانها لمؤشر التحميل.',
    ],
  },
  keyboard: [
    {
      keys: ['Tab'],
      action: { en: 'Focus on the trigger opens the tooltip.', ar: 'التركيز على المشغّل يفتح التلميح.' },
    },
    {
      keys: ['Escape'],
      action: {
        en: 'Closes the tooltip. Inside a dialog, the next Escape closes the dialog.',
        ar: 'يغلق التلميح. داخل مربع حوار، يغلق Escape التالي مربع الحوار.',
      },
    },
  ],
  accessibility: {
    en: [
      'Base UI links the popup to nothing, so the trigger\'s name carries the text, not the tooltip.',
      'The popup\'s children are typed as text: an element, a link or a control is refused at compile time.',
    ],
    ar: [
      'لا يربط Base UI النافذة بأي عنصر، فاسم المشغّل هو الذي يحمل النص، لا التلميح.',
      'أبناء النافذة مكتوبون كنص: العنصر أو الرابط أو عنصر التحكم يُرفض عند الترجمة.',
    ],
  },
  rtl: {
    en: '`start` opens on the right and `end` on the left. The default, `top`, stays above.',
    ar: '`start` يفتح على اليمين و`end` على اليسار. الموضع الافتراضي `top` يبقى في الأعلى.',
  },
  related: {
    components: ['popover', 'button', 'kbd'],
    pages: ['accessibility', 'rtl', 'server-first'],
  },
} as const
