// The hand-written data of the Alert page (S7), in both locales.
export const content = {
  slug: 'alert',
  title: { en: 'Alert', ar: 'تنبيه' },
  description: {
    en: 'A message that belongs to the page, in six tones. Info, success, warning and danger each draw their own icon, so it reads without colour.',
    ar: 'رسالة تنتمي إلى الصفحة، بست نبرات. لكلٍّ من المعلومة والنجاح والتحذير والخطر أيقونتها الخاصة، فتُقرأ الرسالة دون الاعتماد على اللون.',
  },
  note: {
    en: 'Not a live region: it is page content. Pass role="alert" when it appears after load, or announce the event with Toast.',
    ar: 'ليس منطقة حية: إنه جزء من محتوى الصفحة. مرّر role="alert" إذا ظهر بعد التحميل، أو أعلن الحدث بإشعار.',
  },
  demos: ['basic', 'tones', 'variants', 'with-actions', 'minimal', 'rich-content', 'custom-icon', 'live-region', 'rtl'],
  stageHeight: 8,
  notes: {
    en: [
      'For a message that belongs to the page: a trial about to end, a failed deploy, a saved form. For something that has just happened, use a Toast; for a bar above the whole page, use a Banner.',
      '`primary` and `neutral` take the info icon. Pass your own `icon` to replace it, or `icon={null}` for none.',
      '`children` is the description, so it can hold several paragraphs or a list. `actions` puts buttons or links in a row under it.',
      'Keep `actions` on the soft variant: an unfilled Button on a solid fill falls below 4.5:1.',
      'A long title, description or URL wraps inside the box instead of truncating.',
    ],
    ar: [
      'للرسالة التي تخص الصفحة: فترة تجريبية توشك أن تنتهي، أو نشر فشل، أو نموذج حُفظ. لما حدث للتو استخدم الإشعار، وللشريط الذي يعلو الصفحة كلها استخدم شريط الإعلان.',
      'النبرتان `primary` و`neutral` تأخذان أيقونة المعلومة. مرّر `icon` خاصة بك لتحل محلها، أو `icon={null}` لإخفائها.',
      '`children` هو الوصف، فيمكن أن يحمل عدة فقرات أو قائمة. و`actions` يضع الأزرار أو الروابط في صف تحته.',
      'اترك `actions` على النمط `soft`: الزر غير المعبّأ فوق تعبئة `solid` ينزل عن نسبة 4.5:1.',
      'العنوان أو الوصف أو الرابط الطويل يلتف داخل الصندوق بدل أن يُقطع.',
    ],
  },
  keyboard: [],
  a11y: {
    en: [
      'Alert has no role: it is page content, read in place, not a live region.',
      'A screen reader does not read out an alert that is already in the first HTML. Pass `role="alert"` only when it is inserted after the page has loaded and must be announced.',
      'The tone never carries the meaning alone: each of the four meaningful tones draws its own icon. Alert itself takes no focus; only the caller\'s `actions` do.',
    ],
    ar: [
      'التنبيه بلا دور: إنه محتوى من الصفحة يُقرأ في مكانه، لا منطقة حية.',
      'قارئ الشاشة لا يقرأ تنبيهًا موجودًا في HTML الأول. مرّر `role="alert"` فقط إذا أُدرج بعد تحميل الصفحة ويجب الإعلان عنه.',
      'النبرة لا تحمل المعنى وحدها: لكل نبرة من النبرات الأربع ذات المعنى أيقونتها. التنبيه نفسه لا يأخذ التركيز؛ وحدها عناصر `actions` التي تمررها تأخذه.',
    ],
  },
  rtl: {
    en: 'The icon sits at the inline start and the text and actions follow it; every spacing class is logical, so nothing is mirrored by hand.',
    ar: 'الأيقونة في بداية السطر ويتبعها النص والإجراءات؛ كل أصناف المسافات منطقية، فلا شيء يُعكس يدويًا.',
  },
  related: ['toast', 'banner', 'empty-state'],
} as const
