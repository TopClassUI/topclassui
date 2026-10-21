// The hand-written data of one component page (docs-site S7), in en and ar.
export const dialog = {
  slug: 'dialog',
  title: { en: 'Dialog', ar: 'مربع حوار' },
  description: {
    en: 'A modal dialog whose body scrolls between a sticky header and footer, while the page behind it stays still.',
    ar: 'مربع حوار يحجب الصفحة، يتمرّر متنه بين رأس وتذييل ثابتين، بينما تبقى الصفحة خلفه ساكنة.',
  },
  demos: [
    'basic',
    'confirm',
    'with-form',
    'close-on-success',
    'long-body',
    'long-content',
    'sizes',
    'no-close-button',
    'non-modal',
    'trap-focus',
    'with-tooltip',
    'rtl',
  ],
  stageHeight: 24.25,
  stageOpen: true,
  note: {
    en: 'Wrap the parts in a form with the class `contents`, and a Server Action submits from the footer with no client handler.',
    ar: 'غلّف الأجزاء بنموذج يحمل الصنف `contents`، فيُرسَل إجراء الخادم من التذييل دون أي معالج في المتصفح.',
  },
  notes: {
    en: [
      'For a task or a question the page waits for: a form, a confirm, a text to accept.',
      'Nine flat parts and no bare `Dialog`: `DialogRoot`, `DialogTrigger`, `DialogPopup`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogBody`, `DialogFooter` and `DialogClose`.',
      '`DialogBody` scrolls and the header and the footer stay put. On a very short screen the whole popup scrolls instead.',
      '`size` on `DialogPopup` is the widest it grows: 320, 360, 400, 512 or 640 px. `custom` sets no width.',
      'For a confirm, `disablePointerDismissal` on `DialogRoot`: a press outside no longer closes it.',
      'From a server page pass text, booleans, elements and a Server Action. `onOpenChange` and any other function need a `\'use client\'` file.',
    ],
    ar: [
      'لمهمة أو سؤال تنتظره الصفحة: نموذج، تأكيد، نص للموافقة عليه.',
      'تسعة أجزاء بأسماء مسطّحة ولا يوجد `Dialog` وحده: `DialogRoot` و`DialogTrigger` و`DialogPopup` و`DialogHeader` و`DialogTitle` و`DialogDescription` و`DialogBody` و`DialogFooter` و`DialogClose`.',
      '`DialogBody` يتمرّر ويبقى الرأس والتذييل في مكانهما. على شاشة قصيرة جدًا يتمرّر المربع كله بدلًا من ذلك.',
      '`size` على `DialogPopup` هو أقصى عرض يبلغه: 320 أو 360 أو 400 أو 512 أو 640 بكسل. `custom` لا يضبط عرضًا.',
      'للتأكيد، ضع `disablePointerDismissal` على `DialogRoot`: الضغط خارجه لم يعد يغلقه.',
      'من صفحة خادم مرّر نصوصًا وقيمًا منطقية وعناصر وإجراء خادم. `onOpenChange` وأي دالة أخرى تحتاج ملفًا فيه `\'use client\'`.',
    ],
  },
  keyboard: [
    {
      keys: ['Enter', 'Space'],
      action: { en: 'On the trigger, opens the dialog. Focus lands on the x.', ar: 'على المشغّل، يفتح مربع الحوار. ينتقل التركيز إلى زر الإغلاق.' },
    },
    {
      keys: ['Tab', 'Shift+Tab'],
      action: { en: 'Move through the dialog. Focus stays inside it.', ar: 'يتنقّلان داخل مربع الحوار. يبقى التركيز داخله.' },
    },
    {
      keys: ['Escape'],
      action: {
        en: 'Closes a tooltip open inside first, then the dialog. Focus returns to the trigger.',
        ar: 'يغلق أولًا تلميحًا مفتوحًا داخله، ثم مربع الحوار. يعود التركيز إلى المشغّل.',
      },
    },
  ],
  accessibility: {
    en: [
      '`DialogTitle` names the dialog. With no title, pass `aria-label` to `DialogPopup`.',
      'Remove the x with `closeButton={false}` only when a `DialogClose` sits in the footer: a touch screen reader has no Escape key.',
      'While `DialogBody` scrolls it is a tab stop, so the keyboard reaches a long text with no control in it.',
    ],
    ar: [
      '`DialogTitle` يسمّي مربع الحوار. إن لم يكن له عنوان، مرّر `aria-label` إلى `DialogPopup`.',
      'لا تُزل زر الإغلاق بـ `closeButton={false}` إلا إذا وُضع `DialogClose` في التذييل: قارئ الشاشة على شاشة لمس لا يملك مفتاح Escape.',
      'ما دام `DialogBody` يتمرّر فهو محطة Tab، فتصل لوحة المفاتيح إلى نص طويل لا عنصر تحكم فيه.',
    ],
  },
  rtl: {
    en: 'The x moves to the left, the text aligns right and the actions end at the left. The popup takes its direction from the nearest `TopClassProvider`.',
    ar: 'ينتقل زر الإغلاق إلى اليسار، ويُحاذى النص إلى اليمين، وتنتهي الإجراءات عند اليسار. يأخذ المربع اتجاهه من أقرب `TopClassProvider`.',
  },
  related: {
    components: ['drawer', 'popover', 'command'],
    pages: ['server-first', 'accessibility', 'rtl'],
  },
} as const
