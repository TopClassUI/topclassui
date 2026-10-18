// The hand-written data of one component page (docs-site S7), in en and ar.
export const avatarGroup = {
  slug: 'avatar-group',
  title: { en: 'Avatar group', ar: 'مجموعة صور رمزية' },
  description: {
    en: 'Overlapping avatars with a +N counter for the rest. Render every member; max is clamped from 1 to 20.',
    ar: 'صور رمزية متداخلة مع عدّاد +N للبقية. اعرض كل الأعضاء؛ وتُحصر قيمة max بين 1 و20.',
  },
  demos: ['max', 'two', 'four', 'overflow', 'counts', 'sizes', 'linked', 'on-card', 'in-table', 'many', 'custom-size', 'rtl'],
  stageHeight: 8,
  note: {
    en: 'max counts children, so render every member and let the group hide the overflow.',
    ar: 'تعدّ max العناصر الأبناء، فاعرض كل عضو ودع المجموعة تخفي الفائض.',
  },
  notes: {
    en: [
      'The first `max` children show, and a last circle says +N. `size` reaches that circle only, so give each avatar the same `size`.',
      'One avatar per child: an array or a `map()` counts one by one, but a fragment counts as one child, so pass the array itself.',
      'A count too long for a circle widens the counter into a pill, so +12,345 keeps its plus and every digit.',
      'The ring between avatars is the page colour. On a Card, in a Table or on any other surface, give it that surface: `className="*:ring-surface-raised"`.',
      'A group wider than its container wraps onto another row; in a table cell it keeps one row, so keep `max` small there.',
      'Wrap an avatar in a link made `inline-flex` and give the link a focus ring: the group rounds it and lifts the focused face.',
    ],
    ar: [
      'تظهر أول `max` من العناصر الأبناء، وتقول دائرة أخيرة +N. لا يصل `size` إلا إلى تلك الدائرة، فأعطِ كل صورة رمزية الحجم `size` نفسه.',
      'صورة رمزية لكل عنصر ابن: المصفوفة أو `map()` تُعدّ واحدًا واحدًا، أما الجزء `<>...</>` فيُعدّ ابنًا واحدًا، فمرّر المصفوفة نفسها.',
      'العدد الأطول من أن تتسع له الدائرة يوسّع العدّاد إلى شكل كبسولة، فيحتفظ +12,345 بعلامة الزائد وبكل رقم.',
      'الحلقة بين الصور الرمزية بلون الصفحة. على `Card` أو داخل `Table` أو على أي سطح آخر، أعطها لون ذلك السطح: `className="*:ring-surface-raised"`.',
      'المجموعة الأعرض من حاويتها تلتف إلى صف آخر؛ أما في خلية جدول فتبقى صفًا واحدًا، فاجعل `max` صغيرة هناك.',
      'لفّ الصورة الرمزية برابط من نوع `inline-flex` وأعطِ الرابط حلقة تركيز: المجموعة تجعلها دائرية وترفع الوجه الذي عليه التركيز.',
    ],
  },
  keyboard: [
    {
      keys: ['Tab'],
      action: {
        en: 'Moves to the next face only when it is a link or a button you wrapped; the group itself is not a tab stop.',
        ar: 'ينتقل إلى الوجه التالي فقط إن كان رابطًا أو زرًا لففته به؛ المجموعة نفسها ليست محطة Tab.',
      },
    },
  ],
  accessibility: {
    en: [
      'Give the group an `aria-label` or `aria-labelledby` that says who the faces are; it renders `role="group"`.',
      'Name each avatar, by the `alt` of its picture or by `aria-label` on `AvatarRoot`: initials alone are silent.',
      'The counter is read as `labels.avatar.more` ("1 more"); for Arabic pass `labels` and `locale` from `getLabels(\'ar\')`.',
    ],
    ar: [
      'أعطِ المجموعة `aria-label` أو `aria-labelledby` يقول من هم أصحاب الوجوه؛ فهي تُعرض مع `role="group"`.',
      'سمِّ كل صورة رمزية، عبر `alt` صورتها أو `aria-label` على `AvatarRoot`: الأحرف الأولى وحدها صامتة.',
      'يُقرأ العدّاد بنص `labels.avatar.more` ("1 more")؛ وللعربية مرّر `labels` و`locale` من `getLabels(\'ar\')`.',
    ],
  },
  rtl: {
    en: 'The row starts at the inline start and each face overlaps the one before it, so in Arabic it starts on the right; the +N keeps its plus before the digits.',
    ar: 'يبدأ الصف من بداية السطر ويتداخل كل وجه مع الذي قبله، فيبدأ في العربية من اليمين؛ ويبقى +N بعلامة الزائد قبل الأرقام.',
  },
  related: {
    components: ['avatar', 'card', 'table', 'badge'],
    pages: ['server-first', 'accessibility', 'rtl'],
  },
} as const
