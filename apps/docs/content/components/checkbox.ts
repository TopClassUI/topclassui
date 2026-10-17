export const content = {
  slug: 'checkbox',
  demos: ['basic', 'labelled', 'form', 'sizes', 'rtl'],
  stageDemo: 'basic',
  stageHeight: 4,
  related: ['switch', 'radio-group', 'field', 'form'],
  keyboard: [
    { keys: ['Tab'], en: 'Moves the focus to the box; a disabled box is skipped.', ar: 'ينقل التركيز إلى المربع، ويتخطى المربع المعطّل.' },
    { keys: ['Space'], en: 'Ticks or unticks the box.', ar: 'يحدد المربع أو يلغي تحديده.' },
    { keys: ['Enter'], en: 'Submits the form the box is in, as a native checkbox does; it does not tick it.', ar: 'يرسل النموذج الذي يضم المربع، كما يفعل مربع الاختيار الأصلي، ولا يحدده.' },
  ],
  en: {
    title: 'Checkbox',
    description: 'Checked, unchecked or mixed. A hidden input sends the default value before the page hydrates, and a form reset brings it back.',
    note: 'The box is a native `<button role="checkbox">`, and a hidden checkbox beside it is what the form sends.',
    notes: [
      'For a choice the form sends later. For a setting that takes effect at once, a Switch reads better.',
      'Unticked sends nothing and ticked sends on, before the page hydrates and after. An unchecked value can make an unticked box send a string of its own.',
      'A mixed box draws a dash and sets aria-checked to mixed; it is yours to clear, and it sends nothing while it is mixed.',
      'Checkbox draws no label of its own: write the label beside it, or around it, and give the box an `id`.',
      'In Ocean the `xs` and `sm` boxes are circles: only the tick or the dash tells them from a radio.',
    ],
    accessibility: [
      'A name is required: `id` for a `<label htmlFor>`, or `aria-label`, or `aria-labelledby`. A click on the label presses the box.',
      'The target is 24px, 44px under a finger, whatever `size` draws: the focus ring is around the box.',
      '`invalid` sets aria-invalid, and the line of the box turns to danger and thickens, ticked or not.',
    ],
    rtl: 'The box sits at the right, before its label, with no change to your code: the order is logical, not physical.',
  },
  ar: {
    title: 'مربع اختيار',
    description: 'محدد أو غير محدد أو مختلط. حقل مخفي يرسل القيمة الافتراضية قبل الترطيب، وإعادة ضبط النموذج تعيدها.',
    note: 'المربع زر أصلي `<button role="checkbox">`، وبجانبه مربع اختيار مخفي هو ما يرسله النموذج.',
    notes: [
      'لاختيار يرسله النموذج لاحقًا. أما الإعداد الذي يسري فورًا فيناسبه Switch أكثر.',
      'غير المحدد لا يرسل شيئًا، والمحدد يرسل on، قبل الترطيب وبعده. ويمكن لقيمة عدم التحديد أن تجعل المربع غير المحدد يرسل نصًا خاصًا به.',
      'المربع المختلط يرسم شَرطة ويضبط aria-checked على mixed؛ وإلغاؤه مسؤوليتك، ولا يرسل شيئًا ما دام مختلطًا.',
      'لا يرسم Checkbox تسمية خاصة به: اكتب التسمية بجانبه أو حوله، وأعطِ المربع `id`.',
      'في سمة Ocean يكون المربعان `xs` و`sm` دائريين: لا يميّزهما عن زر الراديو إلا علامة الاختيار أو الشَرطة.',
    ],
    accessibility: [
      'الاسم مطلوب: `id` لتسمية `<label htmlFor>`، أو `aria-label`، أو `aria-labelledby`. والنقر على التسمية يضغط المربع.',
      'مساحة الهدف 24px، و44px تحت الإصبع، مهما كان `size` المرسوم: حلقة التركيز تحيط بالمربع.',
      '`invalid` يضبط aria-invalid، ويتحوّل خط المربع إلى لون الخطر ويزداد سمكًا، محددًا كان أو لا.',
    ],
    rtl: 'يقع المربع على اليمين، قبل تسميته، دون أي تغيير في شيفرتك: الترتيب منطقي لا فيزيائي.',
  },
} as const
