// The hand-written data of one component page (docs-site S7), in en and ar.
export const slider = {
  slug: 'slider',
  title: {
    en: 'Slider',
    ar: 'شريط تمرير',
  },
  description: {
    en: 'A single value or a range of two. Arrow keys and a press on the track give the same result as every drag.',
    ar: 'قيمة واحدة أو نطاق من قيمتين. مفاتيح الأسهم والضغط على المسار يصلان إلى النتيجة نفسها التي يصل إليها السحب.',
  },
  demos: ['basic', 'range', 'show-value', 'form', 'sizes', 'rtl'],
  stageHeight: 6,
  note: {
    en: 'A hidden range input carries the value, so the slider submits with its form; the thumb moves once the page hydrates.',
    ar: 'حقل نطاق مخفي يحمل القيمة، فيُرسل الشريط مع نموذجه؛ ويتحرك المقبض بعد ترطيب الصفحة.',
  },
  notes: {
    en: [
      'For a number picked by feel inside known limits. For an exact number, a NumberField.',
      '`min`, `max` and `step` are 0, 100 and 1, clamped to plus or minus 1e15; `largeStep` is never under the `step`, so Page Up always moves.',
      '`minStepsBetweenValues` keeps the two thumbs of a range apart; they never cross.',
      '`showValue` writes the value after the track, in the provider\'s locale and digits. A long value moves below the track.',
      'The width is an Input\'s of the same `size`; `fullWidth` fills the parent. A slider always has a value, so `required` is accepted and dropped.',
    ],
    ar: [
      'لرقم يُختار بالإحساس ضمن حدود معروفة. أما الرقم الدقيق فمكانه NumberField.',
      '`min` و`max` و`step` قيمها 0 و100 و1، ومحصورة بين سالب وموجب 1e15؛ و`largeStep` لا يقل عن `step`، فيتحرك Page Up دائمًا.',
      '`minStepsBetweenValues` يبقي مقبضي النطاق متباعدين؛ فلا يتقاطعان أبدًا.',
      '`showValue` يكتب القيمة بعد المسار، بلغة المزوّد وأرقامه. والقيمة الطويلة تنتقل إلى أسفل المسار.',
      'العرض هو عرض Input بنفس `size`؛ و`fullWidth` يملأ الحاوية. للشريط قيمة دائمًا، لذا يُقبل `required` ثم يُهمل.',
    ],
  },
  keyboard: [
    { keys: ['Tab'], action: { en: 'Moves the focus to a thumb; each thumb of a range is a tab stop.', ar: 'ينقل التركيز إلى مقبض؛ وكل مقبض في النطاق محطة Tab.' } },
    { keys: ['ArrowRight', 'ArrowUp'], action: { en: 'Add one step.', ar: 'يضيفان خطوة واحدة.' } },
    { keys: ['ArrowLeft', 'ArrowDown'], action: { en: 'Take one step away.', ar: 'ينقصان خطوة واحدة.' } },
    { keys: ['PageUp', 'PageDown'], action: { en: 'Move by the large step, 10 by default; so does Shift with an arrow.', ar: 'يحرّكان بمقدار الخطوة الكبيرة، 10 افتراضيًا؛ وكذلك Shift مع سهم.' } },
    { keys: ['Home', 'End'], action: { en: 'Go to the minimum and the maximum, or to the other thumb of a range.', ar: 'ينتقلان إلى الحد الأدنى والحد الأقصى، أو إلى المقبض الآخر في النطاق.' } },
  ],
  accessibility: {
    en: [
      'Name it with `aria-label` or `aria-labelledby`: what takes the focus is a range input inside the thumb. The two thumbs of a range are named Minimum and Maximum.',
      'Every drag has a keyboard path (WCAG 2.5.7). The thumb is the target: 24px, 44px under a touch pointer.',
      '`invalid` sets aria-invalid on the group and on each range input; the fill, the knob and the line around the track turn to danger.',
    ],
    ar: [
      'سمِّه بـ`aria-label` أو `aria-labelledby`: ما يأخذ التركيز هو حقل نطاق داخل المقبض. ويُسمّى مقبضا النطاق «الحد الأدنى» و«الحد الأقصى».',
      'لكل سحب طريق بلوحة المفاتيح (WCAG 2.5.7). والمقبض هو الهدف: 24px، و44px تحت مؤشر لمس.',
      '`invalid` يضبط aria-invalid على المجموعة وعلى كل حقل نطاق؛ ويتحوّل الملء والمقبض والخط حول المسار إلى لون الخطر.',
    ],
  },
  rtl: {
    en: 'Under a right-to-left TopClassProvider the track runs from the right: ArrowLeft adds a step, and a value of 30 sits 30% in from the right.',
    ar: 'تحت TopClassProvider باتجاه من اليمين إلى اليسار يبدأ المسار من اليمين: ArrowLeft يضيف خطوة، والقيمة 30 تقع على بعد 30% من اليمين.',
  },
  related: {
    components: ['number-field', 'rating', 'field', 'form'],
    pages: ['accessibility', 'rtl'],
  },
} as const
