export const content = {
  slug: 'radio-group',
  demos: ['basic', 'horizontal', 'form', 'sizes', 'long-content', 'rtl'],
  stageDemo: 'basic',
  stageHeight: 9,
  related: ['checkbox', 'select', 'segmented-control', 'field', 'form'],
  keyboard: [
    { keys: ['Tab'], en: 'Enters the group on the checked radio, and leaves it on the next Tab.', ar: 'يدخل المجموعة على الزر المحدد، ويغادرها عند الضغط التالي على Tab.' },
    { keys: ['ArrowDown', 'ArrowRight'], en: 'Move to the next radio and select it, skipping a disabled one and wrapping at the end.', ar: 'ينتقلان إلى الزر التالي ويحددانه، متخطّيَين الزر المعطّل، ويعودان إلى البداية بعد الأخير.' },
    { keys: ['ArrowUp', 'ArrowLeft'], en: 'Move to the previous radio and select it, wrapping at the start.', ar: 'ينتقلان إلى الزر السابق ويحددانه، ويعودان إلى النهاية بعد الأول.' },
    { keys: ['Space'], en: 'Selects the focused radio. Enter does not.', ar: 'يحدد الزر الذي عليه التركيز. أما Enter فلا.' },
  ],
  en: {
    title: 'Radio group',
    description: 'One choice out of a few, all shown at once. One Tab stop for the group, and the checked radio is the tab stop before hydration.',
    note: 'The group carries the state and the form; each `RadioGroupItem` carries only its `value` and its text.',
    notes: [
      'For one choice out of a few. For many options, a Select reads better; for two to five short ones in a bar, a SegmentedControl.',
      'In a form the group sends the checked value, and nothing while no radio is checked. Before the page hydrates it sends the default.',
      '`orientation` is `vertical` (a column) or `horizontal` (a row that wraps). It is layout only: the arrow keys are the same in both.',
      'A long text wraps under itself rather than ending in an ellipsis: a choice is read whole.',
      'On an item, `style` goes to the `<label>`; `ref` goes to the radio button itself.',
    ],
    accessibility: [
      'Name the group with `aria-label` or `aria-labelledby`: no `<label htmlFor>` can name a group. Each radio is named by its own text.',
      'The target is 24px, 44px under a finger, whatever `size` draws: the focus ring is around the circle.',
      '`invalid` sets aria-invalid on the group: every circle turns to danger and its line thickens, checked or not.',
    ],
    rtl: 'Each circle sits at the right, before its text. Under a right-to-left TopClassProvider, ArrowRight goes to the radio before.',
  },
  ar: {
    title: 'مجموعة اختيار فردي',
    description: 'اختيار واحد من خيارات قليلة معروضة كلها معًا. للمجموعة محطة Tab واحدة، والزر المحدد هو تلك المحطة قبل الترطيب.',
    note: 'المجموعة تحمل الحالة والنموذج؛ وكل `RadioGroupItem` يحمل `value` الخاص به ونصه فقط.',
    notes: [
      'لاختيار واحد من خيارات قليلة. للخيارات الكثيرة يناسب Select أكثر؛ ولخيارين إلى خمسة قصيرة في شريط واحد، SegmentedControl.',
      'داخل نموذج ترسل المجموعة القيمة المحددة، ولا شيء ما دام لا زر محددًا. وقبل الترطيب ترسل القيمة الافتراضية.',
      '`orientation` قيمته `vertical` (عمود) أو `horizontal` (صف يلتف). وهو للتخطيط فقط: مفاتيح الأسهم نفسها في الحالتين.',
      'النص الطويل يلتف تحت نفسه بدل أن ينتهي بعلامة حذف: الخيار يُقرأ كاملًا.',
      'على العنصر، يذهب `style` إلى `<label>`، ويذهب `ref` إلى زر الراديو نفسه.',
    ],
    accessibility: [
      'سمِّ المجموعة بـ`aria-label` أو `aria-labelledby`: لا تستطيع `<label htmlFor>` أن تسمّي مجموعة. وكل زر يسمّيه نصه.',
      'مساحة الهدف 24px، و44px تحت الإصبع، مهما كان `size` المرسوم: حلقة التركيز تحيط بالدائرة.',
      '`invalid` يضبط aria-invalid على المجموعة: تتحوّل كل دائرة إلى لون الخطر ويزداد سمك خطها، محددة كانت أو لا.',
    ],
    rtl: 'تقع كل دائرة على اليمين، قبل نصها. وتحت TopClassProvider باتجاه من اليمين إلى اليسار، ينتقل ArrowRight إلى الزر السابق.',
  },
} as const
