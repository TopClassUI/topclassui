// The hand-written data of one component page (docs-site S7), in en and ar.
export const select = {
  slug: 'select',
  title: {
    en: 'Select',
    ar: 'قائمة اختيار',
  },
  description: {
    en: 'One choice from a list of plain data. The popup stays inside the viewport and scrolls itself, seven rows tall by default.',
    ar: 'اختيار واحد من قائمة بيانات بسيطة. تبقى القائمة المنبثقة داخل الشاشة وتمرّر نفسها، بارتفاع سبعة صفوف افتراضيًا.',
  },
  demos: ['basic', 'form', 'sizes', 'four-rows', 'sixty-items', 'long-content', 'rtl'],
  stageHeight: 5,
  note: {
    en: '`items` is plain data, so a server page can render a Select: no function crosses to the browser.',
    ar: '`items` بيانات بسيطة، فتستطيع صفحة خادم أن تعرض Select: لا تعبر أي دالة إلى المتصفح.',
  },
  notes: {
    en: [
      '`items` takes `{ value, label, disabled? }`: the value is what the form receives, the label what the row and the trigger show.',
      'In a form it sends the chosen value, and before the page hydrates it sends the default. A form reset brings the default back.',
      'The list shows seven rows, or `visibleRows` (1 to 20), then scrolls inside itself. It is not windowed: for thousands of options, use a Combobox.',
      '`placement` takes the twelve shared values, `bottom-start` by default; the list flips at an edge and stays 8px inside the screen.',
      'The width is an Input\'s at the same `size`; `fullWidth` fills the parent, and a width class in `className` lands on the trigger inside the box.',
    ],
    ar: [
      '`items` يأخذ `{ value, label, disabled? }`: القيمة هي ما يستلمه النموذج، والتسمية هي ما يظهر في الصف وعلى الزر.',
      'داخل نموذج يرسل القيمة المختارة، وقبل الترطيب يرسل القيمة الافتراضية. وإعادة ضبط النموذج تعيد القيمة الافتراضية.',
      'تعرض القائمة سبعة صفوف، أو `visibleRows` (من 1 إلى 20)، ثم تمرّر داخلها. ولا تعرض الصفوف الظاهرة فقط: للآلاف من الخيارات استخدم Combobox.',
      '`placement` يأخذ القيم المشتركة الاثنتي عشرة، و`bottom-start` هي الافتراضية؛ تنقلب القائمة عند الحافة وتبقى على بعد 8px داخل الشاشة.',
      'العرض هو عرض Input بنفس `size`؛ `fullWidth` يملأ الحاوية، وصنف العرض في `className` يقع على الزر داخل الصندوق.',
    ],
  },
  keyboard: [
    { keys: ['ArrowDown'], action: { en: 'Opens the list on the chosen option; in the list, moves down and stops at the end.', ar: 'يفتح القائمة على الخيار المحدد؛ وداخلها ينتقل إلى الأسفل ويتوقف عند النهاية.' } },
    { keys: ['ArrowUp'], action: { en: 'Opens the list on the chosen option; in the list, moves up and stops at the start.', ar: 'يفتح القائمة على الخيار المحدد؛ وداخلها ينتقل إلى الأعلى ويتوقف عند البداية.' } },
    { keys: ['Space'], action: { en: 'Opens the list on the chosen option.', ar: 'يفتح القائمة على الخيار المحدد.' } },
    { keys: ['Enter'], action: { en: 'Opens the list; in the list, chooses the option and closes it.', ar: 'يفتح القائمة؛ وداخلها يختار الخيار ويغلقها.' } },
    { keys: ['Home'], action: { en: 'Moves to the first option.', ar: 'ينتقل إلى الخيار الأول.' } },
    { keys: ['End'], action: { en: 'Moves to the last option.', ar: 'ينتقل إلى الخيار الأخير.' } },
    { keys: ['Escape'], action: { en: 'Closes the list and returns the focus to the trigger.', ar: 'يغلق القائمة ويعيد التركيز إلى زر الفتح.' } },
    { keys: ['A-Z'], action: { en: 'On the closed trigger, chooses the next option that starts with the letter.', ar: 'على الزر المغلق، يختار الخيار التالي الذي يبدأ بذلك الحرف.' } },
  ],
  accessibility: {
    en: [
      'A name is required: `id` for a `<label htmlFor>`, or `aria-label`, or `aria-labelledby`. The trigger is a `<button role="combobox">`.',
      'A row is 40px tall, 44px under a touch pointer, and a long label ends in an ellipsis in the row and in the trigger.',
      '`invalid` sets aria-invalid on the trigger, whose line turns to danger and thickens.',
    ],
    ar: [
      'الاسم مطلوب: `id` لتسمية `<label htmlFor>`، أو `aria-label`، أو `aria-labelledby`. الزر هو `<button role="combobox">`.',
      'ارتفاع الصف 40px، و44px تحت مؤشر لمس، والتسمية الطويلة تنتهي بعلامة حذف في الصف وعلى الزر.',
      '`invalid` يضبط aria-invalid على الزر، فيتحوّل خطه إلى لون الخطر ويزداد سمكًا.',
    ],
  },
  rtl: {
    en: 'The caret and the tick sit at the left, and `bottom-start` lines the list up with the right edge of the trigger. The arrow keys are vertical, so they do not change.',
    ar: 'يقع السهم وعلامة الاختيار على اليسار، و`bottom-start` تحاذي القائمة مع الحافة اليمنى للزر. مفاتيح الأسهم عمودية، فلا يتغيّر معناها.',
  },
  related: {
    components: ['combobox', 'radio-group', 'input', 'field', 'form'],
    pages: ['accessibility', 'rtl'],
  },
} as const
