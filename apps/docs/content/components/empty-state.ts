// The hand-written data of the EmptyState page (S7), in both locales.
export const content = {
  slug: 'empty-state',
  title: { en: 'Empty state', ar: 'الحالة الفارغة' },
  description: {
    en: 'What a list, a table or a search shows when there is nothing to show: an icon, a line, a sentence and your own action.',
    ar: 'ما تعرضه القائمة أو الجدول أو البحث حين لا يوجد ما يُعرض: أيقونة وسطر وجملة وإجراء من عندك.',
  },
  note: {
    en: 'With no props it shows the tray icon and the two labels.state strings; a title of your own drops the default description.',
    ar: 'بلا خصائص يعرض أيقونة الدُّرج ونصّي labels.state؛ وعنوانك الخاص يُسقط الوصف الافتراضي.',
  },
  demos: ['default', 'with-action', 'filtered', 'failed', 'title-only', 'rtl'],
  stageDemo: 'default',
  stageHeight: 16,
  notes: {
    en: [
      'Pass a `title` and the default description goes too, because it would describe the wrong thing.',
      '`null` hides the `icon`, the `title` or the `description`.',
      'The action is your own Button, passed as `children`; the component draws none of its own.',
      'A search with no match or a list that failed to load is another `icon` and `title`, not a variant.',
    ],
    ar: [
      'مرّر `title` فيذهب الوصف الافتراضي معه، لأنه سيصف شيئًا آخر.',
      'القيمة `null` تخفي `icon` أو `title` أو `description`.',
      'الإجراء زرّك أنت، يُمرَّر في `children`؛ المكوّن لا يرسم أي زر من عنده.',
      'البحث بلا نتائج أو القائمة التي فشل تحميلها هي `icon` و`title` آخران، لا نمط مختلف.',
    ],
  },
  keyboard: [],
  a11y: {
    en: [
      'It has no role and no live region: it is page content, read in place.',
      'The title is a paragraph, not a heading, so it adds nothing to the page outline.',
      'The default icon is decorative and takes the muted colour; an icon you pass keeps its own.',
    ],
    ar: [
      'بلا دور وبلا منطقة حية: إنه محتوى من الصفحة يُقرأ في مكانه.',
      'العنوان فقرة لا عنوان قسم، فلا يضيف شيئًا إلى مخطط الصفحة.',
      'الأيقونة الافتراضية زخرفية وتأخذ اللون الخافت؛ والأيقونة التي تمررها تحتفظ بلونها.',
    ],
  },
  rtl: {
    en: 'A centred column, so nothing mirrors. With the Arabic labels the default title and description are Arabic.',
    ar: 'عمود في المنتصف، فلا شيء يُعكس. ومع التسميات العربية يصبح العنوان والوصف الافتراضيان عربيين.',
  },
  related: ['table', 'skeleton', 'spinner'],
} as const
