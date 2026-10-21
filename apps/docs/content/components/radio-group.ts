// The hand-written data of one component page (docs-site S7), in en and ar.
export const radioGroup = {
  slug: 'radio-group',
  title: {
    en: 'Radio group',
    ar: 'مجموعة اختيار فردي',
  },
  description: {
    en: 'One choice out of a few, all shown at once. One Tab stop for the group, and the checked radio is the tab stop before hydration.',
    ar: 'اختيار واحد من خيارات قليلة معروضة كلها معًا. للمجموعة محطة Tab واحدة، والزر المحدد هو تلك المحطة قبل الترطيب.',
  },
  demos: ['basic', 'horizontal', 'form', 'sizes', 'long-content', 'rtl'],
  stageHeight: 13.75,
  extraSwitches: ['disabled', 'required'],
  note: {
    en: 'The group carries the state and the form; each `RadioGroupItem` carries only its `value` and its text.',
    ar: 'المجموعة تحمل الحالة والنموذج؛ وكل `RadioGroupItem` يحمل `value` الخاص به ونصه فقط.',
  },
  notes: {
    en: [
      'For one choice out of a few. For many options, a Select reads better; for two to five short ones in a bar, a SegmentedControl.',
      'In a form the group sends the checked value, and nothing while no radio is checked. Before the page hydrates it sends the default.',
      '`orientation` is `vertical` (a column) or `horizontal` (a row that wraps). It is layout only: the arrow keys are the same in both.',
      'A long text wraps under itself rather than ending in an ellipsis: a choice is read whole.',
      'On an item, `style` goes to the `<label>`; `ref` goes to the radio button itself.',
    ],
    ar: [
      'لاختيار واحد من خيارات قليلة. للخيارات الكثيرة يناسب Select أكثر؛ ولخيارين إلى خمسة قصيرة في شريط واحد، SegmentedControl.',
      'داخل نموذج ترسل المجموعة القيمة المحددة، ولا شيء ما دام لا زر محددًا. وقبل الترطيب ترسل القيمة الافتراضية.',
      '`orientation` قيمته `vertical` (عمود) أو `horizontal` (صف يلتف). وهو للتخطيط فقط: مفاتيح الأسهم نفسها في الحالتين.',
      'النص الطويل يلتف تحت نفسه بدل أن ينتهي بعلامة حذف: الخيار يُقرأ كاملًا.',
      'على العنصر، يذهب `style` إلى `<label>`، ويذهب `ref` إلى زر الراديو نفسه.',
    ],
  },
  keyboard: [
    { keys: ['Tab'], action: { en: 'Enters the group on the checked radio, and leaves it on the next Tab.', ar: 'يدخل المجموعة على الزر المحدد، ويغادرها عند الضغط التالي على Tab.' } },
    { keys: ['ArrowDown', 'ArrowRight'], action: { en: 'Move to the next radio and select it, skipping a disabled one and wrapping at the end.', ar: 'ينتقلان إلى الزر التالي ويحددانه، متخطّيَين الزر المعطّل، ويعودان إلى البداية بعد الأخير.' } },
    { keys: ['ArrowUp', 'ArrowLeft'], action: { en: 'Move to the previous radio and select it, wrapping at the start.', ar: 'ينتقلان إلى الزر السابق ويحددانه، ويعودان إلى النهاية بعد الأول.' } },
    { keys: ['Space'], action: { en: 'Selects the focused radio. Enter does not.', ar: 'يحدد الزر الذي عليه التركيز. أما Enter فلا.' } },
  ],
  accessibility: {
    en: [
      'Name the group with `aria-label` or `aria-labelledby`: no `<label htmlFor>` can name a group. Each radio is named by its own text.',
      'The target is 24px, 44px under a touch pointer, whatever `size` draws: the focus ring is around the circle.',
      '`invalid` sets aria-invalid on the group: every circle turns to danger and its line thickens, checked or not.',
    ],
    ar: [
      'سمِّ المجموعة بـ`aria-label` أو `aria-labelledby`: لا تستطيع `<label htmlFor>` أن تسمّي مجموعة. وكل زر يسمّيه نصه.',
      'مساحة الهدف 24px، و44px تحت مؤشر لمس، مهما كان `size` المرسوم: حلقة التركيز تحيط بالدائرة.',
      '`invalid` يضبط aria-invalid على المجموعة: تتحوّل كل دائرة إلى لون الخطر ويزداد سمك خطها، محددة كانت أو لا.',
    ],
  },
  rtl: {
    en: 'Each circle sits at the right, before its text. Under a right-to-left TopClassProvider, ArrowRight goes to the radio before.',
    ar: 'تقع كل دائرة على اليمين، قبل نصها. وتحت TopClassProvider باتجاه من اليمين إلى اليسار، ينتقل ArrowRight إلى الزر السابق.',
  },
  related: {
    components: ['checkbox', 'select', 'segmented-control', 'field', 'form'],
    pages: ['accessibility', 'rtl'],
  },
} as const
