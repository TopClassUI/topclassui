// The hand-written data of the Toast page (S7), in both locales.
export const toast = {
  slug: 'toast',
  title: { en: 'Toast', ar: 'إشعار' },
  description: {
    en: 'A close button is always rendered, because swiping one away is a drag (WCAG 2.5.7).',
    ar: 'زر الإغلاق حاضر دائمًا، لأن إبعاده بالسحب حركة جرّ (WCAG 2.5.7).',
  },
  note: {
    en: 'The viewport lives in TopClassProvider; toast.add works outside React too.',
    ar: 'منطقة العرض في TopClassProvider؛ وtoast.add يعمل خارج React أيضًا.',
  },
  demos: ['with-description', 'basic', 'tones', 'with-action', 'promise', 'sticky', 'high-priority', 'many', 'over-dialog', 'long-content', 'rtl'],
  stageHeight: 19.4375,
  controlOrder: ['tone'],
  stageOpen: true,
  starts: { tone: 'success', duration: 5000 },
  notes: {
    en: [
      '`toast` is four plain functions: `add`, `update`, `close` and `promise`. The table lists the options of `toast.add`, not props; it also takes a required title, a description and one action.',
      '`duration` is clamped to 0 to 600000 ms, and 0 stays until it is closed. Left out, the provider\'s applies: 5000 unless `TopClassProvider` sets another.',
      'The action does not close the toast: call `toast.close(id)` in its handler, with the id `add` returned. `toast.close()` with no id closes them all.',
      '`toast.promise` shows one toast: a spinner, then the success or the error icon and text. It returns the promise, rejection included, so catch it.',
      'Placement, limit and duration are set once on the provider. The newest toast is the nearest the edge, and three show at once; the next appears when one closes.',
    ],
    ar: [
      '`toast` أربع دوال عادية: `add` و`update` و`close` و`promise`. الجدول يسرد خيارات `toast.add` لا خصائص مكوّن؛ وتأخذ أيضًا عنوانًا إلزاميًا ووصفًا وإجراءً واحدًا.',
      '`duration` محصورة بين 0 و600000 ملّي ثانية، والقيمة 0 تُبقيه حتى يُغلق. إن لم تُمرَّر طُبّقت مدة المزوّد: 5000 ما لم يحدد `TopClassProvider` غيرها.',
      'الإجراء لا يغلق الإشعار: استدعِ `toast.close(id)` داخله، بالمعرّف الذي أعاده `add`. و`toast.close()` بلا معرّف يغلقها كلها.',
      '`toast.promise` يعرض إشعارًا واحدًا: مؤشر تحميل، ثم أيقونة النجاح أو الخطأ ونصه. ويعيد الوعد نفسه، بما في ذلك رفضه، فالتقطه.',
      'الموضع والحد الأقصى والمدة تُضبط مرة واحدة على المزوّد. أحدث إشعار هو الأقرب إلى الحافة، وتظهر ثلاثة معًا؛ ويظهر التالي عندما يُغلق أحدها.',
    ],
  },
  keyboard: [
    { keys: ['F6'], action: { en: 'Moves focus to the toasts.', ar: 'ينقل التركيز إلى الإشعارات.' } },
    {
      keys: ['Tab'],
      action: {
        en: 'Goes to the toast, its action, its x, then back where you were.',
        ar: 'ينتقل إلى الإشعار، ثم إجرائه، ثم زر إغلاقه، ثم يعود إلى حيث كنت.',
      },
    },
    {
      keys: ['Escape'],
      action: {
        en: 'Closes the toast that holds focus. Closing the last one returns focus where F6 found it.',
        ar: 'يغلق الإشعار الذي يحمل التركيز. إغلاق آخرها يعيد التركيز إلى حيث وجده F6.',
      },
    },
  ],
  accessibility: {
    en: [
      'The viewport is a polite live region named by `labels.toast.region`. `priority="high"` is read at once, as an alert: keep it for what cannot wait.',
      'Every toast ends with an x, and nothing removes it: a swipe is a drag, and a drag needs a second way (WCAG 2.5.7).',
      'The timers pause while the pointer is over the toasts, while one holds focus, and while the window is in the background. Over a modal Dialog, Tab stays in the dialog and F6 reaches the toast.',
    ],
    ar: [
      'منطقة العرض منطقة حية مهذّبة يسمّيها `labels.toast.region`. أما `priority="high"` فيُقرأ فورًا كتنبيه: احتفظ به لما لا يحتمل الانتظار.',
      'ينتهي كل إشعار بزر إغلاق لا يُزال أبدًا: السحب حركة جرّ، والجرّ يحتاج إلى طريقة ثانية (WCAG 2.5.7).',
      'تتوقف المؤقتات ما دام المؤشر فوق الإشعارات، وما دام أحدها يحمل التركيز، وما دامت النافذة في الخلفية. وفوق حوار نمطي يبقى Tab داخل الحوار ويصل F6 إلى الإشعار.',
    ],
  },
  rtl: {
    en: '`bottom-end`, the default, is the bottom right in English and the bottom left in Arabic, and the sideways swipe follows the edge the toast sits at. An Arabic island on an English page shows its toasts in the page\'s corner, in the page\'s language.',
    ar: 'الموضع الافتراضي `bottom-end` هو أسفل اليمين في الإنجليزية وأسفل اليسار في العربية، والسحب الجانبي يتبع الحافة التي يجلس عندها الإشعار. والجزيرة العربية داخل صفحة إنجليزية تعرض إشعاراتها في زاوية الصفحة وبلغتها.',
  },
  related: {
    components: ['alert', 'banner', 'spinner', 'dialog'],
    pages: ['provider', 'accessibility', 'rtl'],
  },
} as const
