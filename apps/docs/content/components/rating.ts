// The hand-written data of one component page (docs-site S7), in en and ar.
export const rating = {
  slug: 'rating',
  title: {
    en: 'Rating',
    ar: 'التقييم',
  },
  description: {
    en: 'Read-only stars are server HTML and ship no script. Only an editable rating hydrates, as a group of native radios.',
    ar: 'نجوم القراءة فقط هي HTML من الخادم ولا تشحن أي سكربت. وحده التقييم القابل للتعديل يترطّب، كمجموعة أزرار راديو أصلية.',
  },
  demos: ['read-only', 'editable', 'in-form', 'controlled', 'disabled', 'sizes', 'max-ten', 'rtl'],
  stageHeight: 4,
  controlOrder: ['max', 'size', 'readOnly'],
  controlsHidden: ['value', 'defaultValue'],
  note: {
    en: '`value` alone renders stars on the server; only `readOnly={false}` ships the client half.',
    ar: '`value` وحده يعرض النجوم على الخادم؛ ووحده `readOnly={false}` يشحن نصف العميل.',
  },
  notes: {
    en: [
      'Read-only is the default: `value` is clamped to 0 and `max` and drawn to the nearest half star.',
      '`readOnly={false}` renders native radios, one per star, named "1 star" to "5 stars".',
      'With a `name`, the checked step, 1 to `max`, is submitted before any script runs. A form reset goes back to the served step and calls `onValueChange`.',
      '`value` with `onValueChange` needs a \'use client\' file: a server page cannot pass a function. `defaultValue` works from a server page.',
      '`max` is 1 to 10, 5 by default. Ten `xl` stars are 436px, so on a phone the row wraps rather than scroll the page.',
    ],
    ar: [
      'القراءة فقط هي الافتراضية: `value` محصور بين 0 و`max` ويُرسم إلى أقرب نصف نجمة.',
      '`readOnly={false}` يعرض أزرار راديو أصلية، زر لكل نجمة، مسمّاة من «نجمة واحدة» إلى «5 نجوم».',
      'مع `name` تُرسل الخطوة المحددة، من 1 إلى `max`، قبل تشغيل أي سكربت. وإعادة ضبط النموذج تعيد الخطوة التي أرسلها الخادم وتستدعي `onValueChange`.',
      '`value` مع `onValueChange` يحتاجان ملفًا فيه \'use client\': صفحة الخادم لا تستطيع تمرير دالة. أما `defaultValue` فيعمل من صفحة الخادم.',
      '`max` من 1 إلى 10، والافتراضي 5. عشر نجوم بحجم `xl` عرضها 436px، فيلتف الصف على الهاتف بدل أن تتمرر الصفحة.',
    ],
  },
  keyboard: [
    { keys: ['Tab'], action: { en: 'Enters an editable rating on the checked star, or on the first when none is; the next Tab leaves.', ar: 'يدخل التقييم القابل للتعديل على النجمة المحددة، أو على الأولى إن لم تُحدد أي نجمة؛ والضغطة التالية تغادره.' } },
    { keys: ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'], action: { en: 'Move between the stars and check the one reached.', ar: 'تنقل بين النجوم وتحدد النجمة التي تصل إليها.' } },
    { keys: ['Space'], action: { en: 'Checks the focused star.', ar: 'يحدد النجمة التي عليها التركيز.' } },
  ],
  accessibility: {
    en: [
      'Read-only, it is one image named "4.5 out of 5"; pass `aria-label` to say more, as in "4.3 from 128 reviews".',
      'Editable, the group needs `aria-label` or `aria-labelledby`. Each star is at least 24px to press, and 44px under a touch pointer.',
      'A filled star is warning-on-soft, 3:1 or more on every surface; under forced colours a filled star stays solid and an empty one an outline.',
    ],
    ar: [
      'في وضع القراءة فقط هو صورة واحدة مسمّاة «4.5 من 5»؛ مرّر `aria-label` لتقول أكثر، مثل «4.3 من 128 مراجعة».',
      'في وضع التعديل تحتاج المجموعة إلى `aria-label` أو `aria-labelledby`. ولا تقل مساحة ضغط النجمة عن 24px، و44px تحت مؤشر لمس.',
      'النجمة الممتلئة بلون warning-on-soft، بتباين 3:1 أو أكثر على كل سطح؛ وفي وضع الألوان القسرية تبقى الممتلئة مصمتة والفارغة محدّدة الإطار.',
    ],
  },
  rtl: {
    en: 'The first star is at the right, and half a star fills its right half. Pass the Arabic `labels` and `locale` for Arabic names.',
    ar: 'النجمة الأولى على اليمين، ونصف النجمة يملأ نصفها الأيمن. مرّر `labels` و`locale` العربيين لأسماء عربية.',
  },
  related: {
    components: ['slider', 'radio-group', 'form'],
    pages: ['server-first', 'accessibility', 'rtl'],
  },
} as const
