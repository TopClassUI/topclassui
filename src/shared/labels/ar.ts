import type { CountLabel, Labels } from './types.js'

const plural = new Intl.PluralRules('ar')

/** Arabic has six categories, so a count label picks a form rather than filling a template. */
function byCount(forms: {
  zero: string
  one: string
  two: string
  few: (n: string) => string
  many: (n: string) => string
  other: (n: string) => string
}): CountLabel {
  return (n, fmt) => {
    const rule = plural.select(n)
    const value = fmt.format(n)
    if (rule === 'zero') return forms.zero
    if (rule === 'one') return forms.one
    if (rule === 'two') return forms.two
    if (rule === 'few') return forms.few(value)
    if (rule === 'many') return forms.many(value)
    return forms.other(value)
  }
}

export const ar = {
  common: {
    close: 'إغلاق',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    retry: 'حاول مرة أخرى',
    loading: 'جارٍ التحميل',
    more: 'المزيد',
    clear: 'مسح',
    copy: 'نسخ',
    copied: 'تم النسخ',
    copyFailed: 'تعذّر النسخ',
    search: 'بحث',
    required: 'مطلوب',
    optional: 'اختياري',
  },
  state: {
    empty: 'لا يوجد شيء بعد',
    emptyDescription: 'عندما يصبح هناك ما يُعرض، سيظهر هنا.',
    error: 'حدث خطأ ما',
    errorDescription: 'تعذّر تحميل القائمة.',
    loadingMore: 'جارٍ تحميل المزيد',
  },
  collection: {
    results: byCount({
      zero: 'لا نتائج',
      one: 'نتيجة واحدة',
      two: 'نتيجتان',
      few: (n) => `${n} نتائج`,
      many: (n) => `${n} نتيجة`,
      other: (n) => `${n} نتيجة`,
    }),
    selected: byCount({
      zero: 'لم يتم تحديد شيء',
      one: 'عنصر واحد محدد',
      two: 'عنصران محددان',
      few: (n) => `${n} عناصر محددة`,
      many: (n) => `${n} عنصرًا محددًا`,
      other: (n) => `${n} عنصر محدد`,
    }),
    noResults: 'لا نتائج',
  },
  pagination: {
    label: 'ترقيم الصفحات',
    previous: 'السابق',
    next: 'التالي',
    first: 'الصفحة الأولى',
    last: 'الصفحة الأخيرة',
    page: (n, fmt) => `صفحة ${fmt.format(n)}`,
    ofPages: (n, fmt) => `من ${fmt.format(n)}`,
    pageOf: (page, count, fmt) => `صفحة ${fmt.format(page)} من ${fmt.format(count)}`,
  },
  select: {
    placeholder: 'اختر',
    open: 'افتح القائمة',
  },
  dialog: {
    close: 'إغلاق هذا الحوار',
  },
  file: {
    drop: 'أفلت الملفات هنا',
    browse: 'تصفّح',
    remove: 'إزالة',
    tooMany: byCount({
      zero: 'لا يُسمح بأي ملف',
      one: 'يُسمح بملف واحد فقط',
      two: 'يُسمح بملفين فقط',
      few: (n) => `يُسمح بـ ${n} ملفات فقط`,
      many: (n) => `يُسمح بـ ${n} ملفًا فقط`,
      other: (n) => `يُسمح بـ ${n} ملف فقط`,
    }),
    tooLarge: 'الحجم كبير جدًا',
    wrongType: 'نوع غير مقبول',
  },
  breadcrumb: {
    label: 'مسار التنقل',
    home: 'الرئيسية',
  },
  avatar: {
    more: byCount({
      zero: 'لا أحد آخر',
      one: 'واحد آخر',
      two: 'اثنان آخران',
      few: (n) => `${n} آخرون`,
      many: (n) => `${n} آخرون`,
      other: (n) => `${n} آخرون`,
    }),
  },
  rating: {
    value: (value, max, fmt) => `${fmt.format(value)} من ${fmt.format(max)}`,
    stars: byCount({
      zero: 'بلا نجوم',
      one: 'نجمة واحدة',
      two: 'نجمتان',
      few: (n) => `${n} نجوم`,
      many: (n) => `${n} نجمة`,
      other: (n) => `${n} نجمة`,
    }),
  },
  table: {
    sortBy: 'ترتيب حسب',
    sortedAscending: 'مرتب تصاعديًا',
    sortedDescending: 'مرتب تنازليًا',
  },
  timeline: {
    done: 'مكتمل',
    current: 'الحالي',
    todo: 'لم يبدأ',
  },
  drawer: {
    close: 'إغلاق هذه اللوحة',
  },
  toast: {
    region: 'الإشعارات',
    close: 'إغلاق هذا الإشعار',
  },
  command: {
    label: 'لوحة الأوامر',
    placeholder: 'اكتب أمرًا أو ابحث',
  },
  navbar: {
    label: 'التنقل الرئيسي',
  },
  sidebar: {
    label: 'الشريط الجانبي',
    collapse: 'طي الشريط الجانبي',
    expand: 'توسيع الشريط الجانبي',
  },
  tag: {
    remove: 'إزالة',
  },
  banner: {
    dismiss: 'إغلاق',
  },
  numberField: {
    increase: 'زيادة',
    decrease: 'إنقاص',
    field: 'حقل رقمي',
  },
  slider: {
    minimum: 'الحد الأدنى',
    maximum: 'الحد الأقصى',
  },
  otp: {
    character: (place, length, fmt) => `الخانة ${fmt.format(place)} من ${fmt.format(length)}`,
  },
  textarea: {
    count: (length, max, fmt) => `عدد الأحرف: ${fmt.format(length)} من ${fmt.format(max)}`,
  },
  datePicker: {
    placeholder: 'اختر تاريخًا',
    previousMonth: 'الشهر السابق',
    nextMonth: 'الشهر التالي',
  },
  stepper: {
    done: 'مكتمل',
    todo: 'لم يبدأ',
    error: 'يحتاج إلى مراجعة',
  },
} satisfies Labels
