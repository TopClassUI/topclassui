export const tooltip = {
  slug: 'tooltip',
  demos: [
    'basic',
    'delays',
    'long-label',
    'with-count',
    'placements',
    'disabled',
    'rtl',
  ],
  stageDemo: 'basic',
  stageHeight: 12,
  related: ['popover', 'button', 'kbd'],
  en: {
    title: 'Tooltip',
    description: 'One or two lines of plain text on hover or focus: the name of an icon-only control, or a label that truncates.',
    note: 'Touch never shows a tooltip, so the trigger\'s own label must repeat the text: give an icon-only Button an `aria-label`.',
    keyboard: [
      { keys: 'Tab', action: 'Focus on the trigger opens the tooltip.' },
      { keys: 'Escape', action: 'Closes the tooltip. Inside a dialog, the next Escape closes the dialog.' },
    ],
    accessibility: [
      'Base UI links the popup to nothing, so the trigger\'s name carries the text, not the tooltip.',
      'The popup\'s children are typed as text: an element, a link or a control is refused at compile time.',
    ],
    rtl: '`start` opens on the right and `end` on the left. The default, `top`, stays above.',
  },
  ar: {
    title: 'تلميح',
    description: 'سطر أو سطران من النص عند التمرير أو التركيز: اسم عنصر تحكم بأيقونة فقط، أو تسمية مقطوعة.',
    note: 'شاشات اللمس لا تعرض التلميح أبدًا، فيجب أن يكرّر اسم المشغّل النص نفسه: أعطِ الزر ذا الأيقونة فقط `aria-label`.',
    keyboard: [
      { keys: 'Tab', action: 'التركيز على المشغّل يفتح التلميح.' },
      { keys: 'Escape', action: 'يغلق التلميح. داخل مربع حوار، يغلق Escape التالي مربع الحوار.' },
    ],
    accessibility: [
      'لا يربط Base UI النافذة بأي عنصر، فاسم المشغّل هو الذي يحمل النص، لا التلميح.',
      'أبناء النافذة مكتوبون كنص: العنصر أو الرابط أو عنصر التحكم يُرفض عند الترجمة.',
    ],
    rtl: '`start` يفتح على اليمين و`end` على اليسار. الموضع الافتراضي `top` يبقى في الأعلى.',
  },
} as const
