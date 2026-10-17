export const content = {
  slug: 'switch',
  demos: ['basic', 'form', 'unchecked-value', 'sizes', 'rtl'],
  stageDemo: 'basic',
  stageHeight: 4,
  related: ['checkbox', 'segmented-control', 'field', 'form'],
  keyboard: [
    { keys: ['Tab'], en: 'Moves the focus to the switch; a disabled switch is skipped.', ar: 'ينقل التركيز إلى المفتاح، ويتخطى المفتاح المعطّل.' },
    { keys: ['Space', 'Enter'], en: 'Turn the switch on or off.', ar: 'يشغّلان المفتاح أو يطفئانه.' },
  ],
  en: {
    title: 'Switch',
    description: 'An on and off switch for a setting that takes effect at once. Its thumb travels the right way in right-to-left layouts.',
    note: 'The `xs` and `sm` switches still grow to a 44px target under a coarse pointer, so the thumb stays easy to tap.',
    notes: [
      'For a setting that takes effect as it is turned on or off. For a choice the form sends later, a Checkbox reads better.',
      'In a form, off sends nothing and on sends on, before the page hydrates and after. An unchecked value makes an off switch send a string of its own.',
      'A form reset brings the switch back to its default, on screen and in the form.',
      'Switch draws no label of its own: write a `<label htmlFor>` that points at its `id`.',
      '`size="custom"` draws no track size: give the track one from your own CSS.',
    ],
    accessibility: [
      'A name is required: `id` for a `<label htmlFor>`, or `aria-label`, or `aria-labelledby`. The root is a `<button role="switch">`.',
      'The target is 24px, 44px under a finger, whatever `size` draws: the focus ring is around the track.',
      '`invalid` sets aria-invalid, and the line of the track turns to danger and thickens.',
    ],
    rtl: 'The thumb starts at the right and slides left when the switch is on, with no code change.',
  },
  ar: {
    title: 'مفتاح تبديل',
    description: 'مفتاح تشغيل وإطفاء لإعداد يسري فورًا. يتحرك مقبضه في الاتجاه الصحيح في التخطيطات من اليمين إلى اليسار.',
    note: 'المفتاحان `xs` و`sm` يكبران إلى هدف بمقدار 44px تحت المؤشر الخشن، فيبقى المقبض سهل اللمس.',
    notes: [
      'لإعداد يسري لحظة تشغيله أو إطفائه. أما الاختيار الذي يرسله النموذج لاحقًا فيناسبه Checkbox أكثر.',
      'داخل نموذج، المطفأ لا يرسل شيئًا والمشغَّل يرسل on، قبل الترطيب وبعده. وقيمة عدم التحديد تجعل المفتاح المطفأ يرسل نصًا خاصًا به.',
      'إعادة ضبط النموذج تعيد المفتاح إلى حالته الافتراضية، على الشاشة وفي النموذج.',
      'لا يرسم Switch تسمية خاصة به: اكتب `<label htmlFor>` تشير إلى `id` الخاص به.',
      '`size="custom"` لا يرسم مقاسًا للمسار: أعطِ المسار مقاسًا من CSS الخاص بك.',
    ],
    accessibility: [
      'الاسم مطلوب: `id` لتسمية `<label htmlFor>`، أو `aria-label`، أو `aria-labelledby`. والجذر هو `<button role="switch">`.',
      'مساحة الهدف 24px، و44px تحت الإصبع، مهما كان `size` المرسوم: حلقة التركيز تحيط بالمسار.',
      '`invalid` يضبط aria-invalid، ويتحوّل خط المسار إلى لون الخطر ويزداد سمكًا.',
    ],
    rtl: 'يبدأ المقبض من اليمين وينزلق إلى اليسار عند التشغيل، دون أي تغيير في الشيفرة.',
  },
} as const
