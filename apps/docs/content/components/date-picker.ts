// The hand-written data of one component page (docs-site S7), in en and ar.
export const datePicker = {
  slug: 'date-picker',
  title: {
    en: 'Date picker',
    ar: 'منتقي التاريخ',
  },
  description: {
    en: 'A lazy calendar popover that formats dates with the provider\'s locale and digits.',
    ar: 'تقويم منبثق يُحمَّل عند الحاجة، ويكتب التواريخ بلغة المزوّد وأرقامه.',
  },
  demos: ['basic', 'in-field', 'limits', 'week-start', 'form', 'sizes', 'rtl'],
  stageHeight: 21,
  stageOpen: true,
  controlOrder: ['size', 'placement', 'firstDayOfWeek', 'disabled', 'invalid'],
  controlsHidden: ['fullWidth'],
  extraSwitches: ['disabled'],
  note: {
    en: 'The value is an ISO date string, YYYY-MM-DD; the shown format comes from the provider\'s locale.',
    ar: 'القيمة تاريخ بصيغة ISO، أي YYYY-MM-DD؛ والصيغة المعروضة تأتي من لغة المزوّد.',
  },
  notes: {
    en: [
      '`value` and `defaultValue` are an ISO date or null; a string that is not a real day, such as 2026-02-30, counts as null.',
      'With a `name`, a hidden input sends the ISO date, and an empty value with nothing chosen. Before the page hydrates it sends the default.',
      '`minDate` and `maxDate` are ISO dates; a day outside them is dimmed and cannot be chosen, and the month buttons stop at them.',
      'The week starts on `firstDayOfWeek`, 1 (Monday) to 7 (Sunday); left out, on the locale\'s first day.',
      'The calendar is a chunk of its own, loaded on the first open. The grid is always Gregorian, with no date library.',
    ],
    ar: [
      '`value` و`defaultValue` تاريخ بصيغة ISO أو null؛ والنص الذي لا يمثّل يومًا حقيقيًا، مثل 2026-02-30، يُعدّ null.',
      'مع `name` يرسل حقل مخفي التاريخ بصيغة ISO، وقيمة فارغة إن لم يُختر شيء. وقبل الترطيب يرسل القيمة الافتراضية.',
      '`minDate` و`maxDate` تاريخان بصيغة ISO؛ اليوم الواقع خارجهما يخفت ولا يمكن اختياره، وأزرار الشهر تتوقف عندهما.',
      'يبدأ الأسبوع من `firstDayOfWeek`، من 1 (الاثنين) إلى 7 (الأحد)؛ وإن لم يُمرَّر، فمن أول أيام الأسبوع في اللغة.',
      'التقويم جزء مستقل يُحمَّل عند الفتح الأول. والشبكة ميلادية دائمًا، دون أي مكتبة تواريخ.',
    ],
  },
  keyboard: [
    { keys: ['Enter', 'Space'], action: { en: 'On the button, open the calendar on the chosen day, else on today; in the grid, choose the day and close.', ar: 'على الزر، يفتحان التقويم على اليوم المختار، أو على اليوم الحالي؛ وفي الشبكة، يختاران اليوم ويغلقانه.' } },
    { keys: ['ArrowLeft', 'ArrowRight'], action: { en: 'Move a day back or forward.', ar: 'ينقلان يومًا إلى الوراء أو إلى الأمام.' } },
    { keys: ['ArrowUp', 'ArrowDown'], action: { en: 'Move a week back or forward.', ar: 'ينقلان أسبوعًا إلى الوراء أو إلى الأمام.' } },
    { keys: ['Home', 'End'], action: { en: 'Go to the first or the last day of the row, within the month.', ar: 'ينتقلان إلى أول يوم أو آخر يوم في الصف، داخل الشهر.' } },
    { keys: ['PageUp', 'PageDown'], action: { en: 'Move a month; with Shift, a year. The day stays inside the month.', ar: 'ينقلان شهرًا؛ ومع Shift سنة. ويبقى اليوم داخل الشهر.' } },
    { keys: ['Escape'], action: { en: 'Closes the calendar with no change and returns the focus to the button.', ar: 'يغلق التقويم دون تغيير ويعيد التركيز إلى الزر.' } },
    { keys: ['Tab'], action: { en: 'Goes round previous, next, close and the grid.', ar: 'يدور بين السابق والتالي والإغلاق والشبكة.' } },
  ],
  accessibility: {
    en: [
      'A name is required: `id` for a `<label htmlFor>`, or `aria-label`, or `aria-labelledby`. The label names the button and the day is its description.',
      'The calendar follows the date picker dialog of the ARIA Authoring Practices; while it is open the focus is in it, named by its month.',
      '`required` describes the button as required, since a button cannot carry aria-required. `invalid` turns its line to danger and thickens it.',
    ],
    ar: [
      'الاسم مطلوب: `id` لتسمية `<label htmlFor>`، أو `aria-label`، أو `aria-labelledby`. التسمية تسمّي الزر، واليوم هو وصفه.',
      'يتبع التقويم نمط حوار اختيار التاريخ في ARIA Authoring Practices؛ وما دام مفتوحًا يبقى التركيز فيه، مسمّى باسم شهره.',
      '`required` يصف الزر بأنه مطلوب، لأن الزر لا يحمل aria-required. و`invalid` يحوّل خطه إلى لون الخطر ويزيد سمكه.',
    ],
  },
  rtl: {
    en: 'Month and day names come in Arabic, the week starts on Saturday in ar, and the calendar lines up with the right edge of the button. ArrowLeft is the next day.',
    ar: 'تأتي أسماء الشهور والأيام بالعربية، ويبدأ الأسبوع من السبت في ar، ويحاذي التقويم الحافة اليمنى للزر. وArrowLeft هو اليوم التالي.',
  },
  related: {
    components: ['input', 'select', 'popover', 'field', 'form'],
    pages: ['accessibility', 'rtl'],
  },
} as const
