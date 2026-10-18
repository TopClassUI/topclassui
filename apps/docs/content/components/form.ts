// The hand-written data of the Form page (S7), in both locales.
export const form = {
  slug: 'form',
  title: { en: 'Form', ar: 'النموذج' },
  description: {
    en: 'A plain form that posts with no script, and FormAction, whose action answers with errors that land on the matching fields.',
    ar: 'نموذج عادي يُرسَل بلا سكربت، وFormAction الذي يجيب إجراؤه بأخطاء تصل إلى الحقول المطابقة لها.',
  },
  demos: ['basic', 'server-errors', 'form-action', 'rtl'],
  stageHeight: 11,
  stageDemo: 'basic',
  note: {
    en: 'A server Form cannot show what its action returns: hand each Field its `error` yourself, or use `FormAction` in a client file.',
    ar: 'نموذج الخادم لا يستطيع عرض ما يعيده إجراؤه: أعطِ كل Field خطأه `error` بنفسك، أو استخدم `FormAction` في ملف عميل.',
  },
  notes: {
    en: [
      '`Form` adds the flat export and the `className` merge, nothing else: no `noValidate`, so the browser\'s own `required` check runs before hydration and after.',
      '`FormAction` runs React\'s `useActionState`: `action(state, formData)` returns the next state, whose `errors` are keyed by field name, as Zod\'s `fieldErrors`.',
      'React resets the form when an action settles, so an action that returns errors returns the submitted values too, and the function child gives them back as defaults.',
      'With no script a client function cannot post: pass `permalink` with a Server Action.',
    ],
    ar: [
      '`Form` يضيف التصدير المسطّح ودمج `className` فقط: بلا `noValidate`، فيعمل فحص `required` الخاص بالمتصفح قبل الترطيب وبعده.',
      '`FormAction` يشغّل `useActionState` من React: يعيد `action(state, formData)` الحالة التالية، وأخطاؤها `errors` مرتبة باسم الحقل، مثل `fieldErrors` في Zod.',
      'يعيد React تعيين النموذج حين يستقر الإجراء، لذا يعيد الإجراء الذي يرجع أخطاءً القيمَ المرسلة أيضًا، فتعيدها الدالة الابن قيمًا افتراضية.',
      'بلا سكربت لا تستطيع دالة العميل الإرسال: مرّر `permalink` مع Server Action.',
    ],
  },
  keyboard: [
    { keys: ['Enter'], action: { en: 'Submits the form from a text control, as a native form does.', ar: 'يرسل النموذج من حقل نصي، كما يفعل النموذج الأصلي.' } },
  ],
  accessibility: {
    en: [
      'After an answer with errors the focus goes to the first control with `aria-invalid="true"`, never on the first render.',
      'The form carries `aria-busy` while the action is pending.',
    ],
    ar: [
      'بعد إجابة فيها أخطاء ينتقل التركيز إلى أول عنصر يحمل `aria-invalid="true"`، ولا يحدث ذلك أبدًا في العرض الأول.',
      'يحمل النموذج `aria-busy` ما دام الإجراء قيد التنفيذ.',
    ],
  },
  rtl: {
    en: 'Nothing of its own mirrors: the fields inside it read from the right, through their own logical classes.',
    ar: 'لا شيء خاص به ينعكس: الحقول داخله تُقرأ من اليمين، عبر أصنافها المنطقية الخاصة.',
  },
  related: {
    components: ['field', 'input', 'button', 'file-upload'],
    pages: ['first-component', 'server-first', 'accessibility'],
  },
} as const
