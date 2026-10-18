import type { GuideLabels } from './guides-types'

export const guidesAr: GuideLabels = {
  tokens: {
    swatch: 'العيّنة',
    modes: { light: 'فاتح', dark: 'داكن', ocean: 'محيط' },
    mix: (percent, of) => `${String(percent)}% من ${of} ممزوجة بالصفحة`,
    contrast: (ratio, min) => `${ratio.toFixed(2)}:1، والحد الأدنى ${String(min)}:1`,
    notMeasured: 'غير مقيس: سطح أو خط زخرفي',
  },
  sample: { title: 'topclassui/tokens.css' },
  controls: {
    label: 'مقابض هذه الصفحة',
    radius: 'نصف القطر (rem)',
    density: 'الكثافة',
    note: 'يضبط المنزلقان --tc-radius و--tc-density على هذه الصفحة فقط. مبدّل الوضع في الشريط العلوي.',
  },
  board: {
    label: 'شاشة مثال، كل جزء منها موسوم بالصنف الذي يلوّنه',
    brand: 'TopClass UI',
    title: 'إعدادات المشروع',
    lead: 'اختر طريقة نشر هذا المشروع.',
    save: 'حفظ',
    options: ['الإنتاج', 'المعاينة', 'التطوير'],
  },
  icons: {
    search: (total) => `ابحث في ${String(total)} أيقونة`,
    filter: 'اعرض',
    all: 'الكل',
    directional: 'اتجاهية',
    solid: 'مصمتة',
    results: (count) => {
      const rule = new Intl.PluralRules('ar').select(count)
      if (rule === 'zero') return 'لا نتائج'
      if (rule === 'one') return 'نتيجة واحدة'
      if (rule === 'two') return 'نتيجتان'
      if (rule === 'few') return `${String(count)} نتائج`
      return `${String(count)} نتيجة`
    },
    copy: (name) => `انسخ شيفرة ${name}`,
    copied: (code) => `نُسخ ${code}`,
    failed: 'لم يسمح المتصفح بالنسخ. حدّد الاسم وانسخه يدويًا.',
  },
  island: {
    page: 'في وضع الصفحة',
    scoped: 'داخل data-theme="ocean"',
    email: 'البريد الإلكتروني',
    save: 'حفظ',
  },
  pair: { ltr: 'dir="ltr"', rtl: 'dir="rtl"' },
  kinds: (server, split, client, total) =>
    `من بين ${String(total)} استيرادًا للمكوّنات اليوم: ${String(server)} للخادم، و${String(split)} مقسومة، و${String(client)} للعميل، مقروءة من ملف meta.ts لكل مكوّن.`,
  changelog: {
    empty: 'لم يُنشر أي إصدار بعد. يظهر المُدخل الأول هنا عند نشر الحزمة.',
    groups: { 'Major Changes': 'تغييرات رئيسية', 'Minor Changes': 'تغييرات ثانوية', 'Patch Changes': 'تصحيحات' },
    entriesNote: 'يبقى نص المُدخلات بالإنجليزية كما كُتب في سجل الحزمة.',
  },
}
